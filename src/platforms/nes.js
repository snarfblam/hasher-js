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

var nesPlatform = {
    name: 'NES',
    longName: "Nintendo Entertainment System",
    knownExtensions: ['nes'],

    /**
     * Determines whether the specified ROM is for this platform, based on a platform-specific heuristic.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM appears to belong to this platform based on ROM contents
     */
    isPlatformMatch: function (romImage) {
        // NES ROMs are identified by their iNES headers.
        return this.hasExternalHeader(romImage);
    },

    /**
     * Determines whether the specified ROM contains an external (non-embedded) header using platform-specific logic
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM contains an external header
     */
    hasExternalHeader: function (romImage) {
        // Check for iNES header tag ('NES\u001a')
        return (romImage.length > 0x10 && (romImage[0] == 0x4e && romImage[1] == 0x45 && romImage[2] == 0x53 && romImage[3] == 0x1a));
    },

    /**
     * Returns an array of region descriptors for sections of the ROM to be hashed
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {RomRegion[]} Array of region descriptors
     */
    getHashRegions: function (romImage) {
        var fileRegion = new RomRegion('file', romImage, 0,romImage.length );
        var romRegion = new RomRegion('rom', romImage, 0x10, romImage.length - 0x10);

        if(!this.hasExternalHeader(romImage)) romRegion = new RomRegion('rom', romImage, 0, romImage.length);

        return [fileRegion, romRegion];
    },

    /**
     * Returns an array of extended information for the ROM image.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {{label: string, category: string, value: any}[]} Array of details
     */
    getExtendedData: function (romImage) {
        var result = [];
        function addHeader(label, value) {
            result.push({ category: category.Header, label: label, value: value });
        }

        if (this.hasExternalHeader(romImage)) {
            var ines = new iNESHeader(romImage);

            addHeader("CHR banks", ines.chrRomCount);
            addHeader("PRG banks", ines.prgRomCount);
            addHeader("Battery backed", ines.hasBattery);
            addHeader("Mapper #", ines.mapper);
            addHeader("Mapper name", ines.mapperName || 'unknown');
            addHeader("Mirroring", ines.mirroring);
            addHeader("Region", ines.palFlagSet ? "PAL" : "NTSC");
            addHeader("Trainer present", ines.hasTrainer);
            addHeader("VS Unisystem", ines.vsUnisystem);
            addHeader("Placechoice 10", ines.playchoice10);
            addHeader("NES 2.0", ines.nes2);
        }
        
        return result;
    },

    getFormatName: function (romImage) {
        return this.hasExternalHeader(romImage) ? 'INES' : 'NES rom image';
    }
}

// module.exports = nesPlatform;
export default nesPlatform;

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

export { NesPlatform };