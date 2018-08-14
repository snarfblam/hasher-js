/**
 * Object containing Genesis-specific data and functions
 */

import common from './common';
import genUtil from '../utils/genUtil';
const category = common.romDataCategory;

var genPlatform = {
    name: 'GEN',
    longName: 'Genesis',
    knownExtensions: ['bin', 'gen', 'smd', 'md'],

    /**
     * Determines whether the specified ROM is for this platform, based on a platform-specific heuristic.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM appears to belong to this platform based on ROM contents
     */
    isPlatformMatch: function (romImage) {
        return genUtil.getRomInfo(romImage).internalHeader;
    },

    /**
     * Determines whether the specified ROM contains an external (non-embedded) header using platform-specific logic
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM contains an external header
     */
    hasExternalHeader: function (romImage) {
        return genUtil.getRomInfo(romImage).externalHeader;
    },

    /**
     * Returns an array of region descriptors for sections of the ROM to be hashed
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {{name: string, start: number, length: number, romImage?: Uint8Array}[]} Array of region descriptors
     */
    getHashRegions: function (romImage) {
        var binRom = genUtil.getBinFormat(romImage);

        var fileRegion = { name: 'file', start: 0, length: romImage.length };
        var romRegion = { name: 'rom', start: 0, length: binRom.length, rom: binRom };

        return [fileRegion, romRegion];
    },

    /**
     * Returns an array of extended information for the ROM image.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {{label: string, category: string, value: any}[]} Array of details
     */
    getExtendedData: function (romImage) {
        // so many results
        var result = [];
        return result;
    },

    getFormatName: function (romImage) {
        var { externalHeader, interleaved } = genUtil.getRomInfo(romImage);

        if (interleaved) {
            return externalHeader ? "SMD (headered)" : "SMD (no header)";
        } else {
            return externalHeader ? "BIN (headered)" : "BIN";
        }
    }
}

// module.exports = nesPlatform;
export default genPlatform;