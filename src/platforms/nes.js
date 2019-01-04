//@ts-check

/**
 * Object containing NES-specific data and functions
 */

import RomRegion from '../RomRegion';
import iNESHeader from '../romUtils/iNESHeader';
import Platform from './Platform';
import Rom from '../Rom';
import { HexValue } from '../util';
const category = Platform.exDataCategories;


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
        return Promise.all([this.getHeader(rom), super.getExtendedData(rom)])
            .then(([header, data]) => {
                if (header) {
                    data.addHeader("CHR banks", header.chrRomCount);
                    data.addHeader("PRG banks", header.prgRomCount);
                    data.addHeader("Battery backed", header.hasBattery);
                    data.addHeader("Mapper #", HexValue.hexParen(header.mapper));
                    data.addHeader("Mapper name", header.mapperName || 'unknown');
                    data.addHeader("Mirroring", header.mirroring);
                    data.addHeader("Region", header.palFlagSet ? "PAL" : "NTSC");
                    data.addHeader("Trainer present", header.hasTrainer);
                    data.addHeader("VS Unisystem", header.vsUnisystem);
                    data.addHeader("Placechoice 10", header.playchoice10);
                    data.addHeader("NES 2.0", header.nes2);
                }
                
                return data;
            });
    }

    /** @param {Rom} rom */
    getFormatName(rom) {
        return this.hasExternalHeader(rom) ? 'iNES' : 'NES ROM image';
    }

    /** @param {Rom} rom */
    _decodeHeader(rom) {
        return new iNESHeader(rom.preview);
    }

}

export default NesPlatform;