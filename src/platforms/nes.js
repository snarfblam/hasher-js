/**
 * Object containing NES-specific data and functions
 */

import iNESHeader from '../utils/iNESHeader';
import common from './common';
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
     * @returns {{name: string, start: number, length: number}[]} Array of region descriptors
     */
    getHashRegions: function (romImage) {
        var fileRegion = { name: 'file', start: 0, length: romImage.length };
        var romRegion = { name: 'rom', start: 0x10, length: romImage.length - 0x10 };

        if(!this.hasExternalHeader(romImage)) romRegion = { name: 'rom', start: 0, length: romImage.length }

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