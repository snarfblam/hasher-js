//@ts-check

/**
 * Object containing NES-specific data and functions
 */

import RomRegion from '../RomRegion';
import iNESHeader from '../romUtils/iNESHeader';
import common from './common';
import Platform from './Platform';
import Rom from '../Rom';
const category = common.romDataCategory;


class NesPlatform extends Platform {
    constructor() {
        super("NES", "Nintendo Entertainment System", ["nes"]);
    }

    /** @param {Rom} rom */
    isPlatformMatch(rom) {
        return this.hasExternalHeader(rom);
    }

    /** @param {Rom} rom */
    hasExternalHeader(rom) {
        var romImage = rom.preview;
        // Check for iNES header tag ('NES\u001a')
        return (romImage.length > 0x10 && (romImage[0] == 0x4e && romImage[1] == 0x45 && romImage[2] == 0x53 && romImage[3] == 0x1a));
    }

    /** @param {Rom} rom */
    getHashRegions(rom) {
        var fileRegion = new RomRegion('file', rom, 0,rom.size);

        var romRegion;
        if (this.hasExternalHeader(rom)) {
            romRegion = new RomRegion('rom', rom, 0x10, rom.size - 0x10);
        } else {
            romRegion = new RomRegion('rom', rom, 0, rom.size);
        }

        return Promise.resolve([fileRegion, romRegion]);
    }

    /** @param {Rom} rom */
    getExtendedData(rom) {
        var result = [];
        function addHeader(label, value) {
            result.push({ category: category.Header, label: label, value: value });
        }

        return this.getHeader(rom)
            .then(header => {
                if (header) {
                    addHeader("CHR banks", header.chrRomCount);
                    addHeader("PRG banks", header.prgRomCount);
                    addHeader("Battery backed", header.hasBattery);
                    addHeader("Mapper #", header.mapper);
                    addHeader("Mapper name", header.mapperName || 'unknown');
                    addHeader("Mirroring", header.mirroring);
                    addHeader("Region", header.palFlagSet ? "PAL" : "NTSC");
                    addHeader("Trainer present", header.hasTrainer);
                    addHeader("VS Unisystem", header.vsUnisystem);
                    addHeader("Placechoice 10", header.playchoice10);
                    addHeader("NES 2.0", header.nes2);
                }
                
                return result;
            });
    }

    /** @param {Rom} rom */
    getFormatName(rom) {
        return this.hasExternalHeader(rom) ? 'INES' : 'NES rom image';
    }

    /** @param {Rom} rom */
    _decodeHeader(rom) {
        return new iNESHeader(rom.preview);
    }

}

export default NesPlatform;