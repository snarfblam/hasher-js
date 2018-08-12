/**
 * Object containing NES-specific data and functions
 */

import common from './common';
const category = common.romDataCategory;

/**
 * Checks whether the rom image has the 'FDS' external header identifier
 * @param {Uint8Array} romImage 
 * @returns {boolean}
 */
function hasFdsHeaderTag(romImage) {
    return (romImage.length > 0x10 && (romImage[0] === 0x46 && romImage[1] === 0x44 && romImage[2] === 0x53 && romImage[3] === 0x1a));
}

var fdsPlatform = {
    name: 'FDS',
    knownExtensions: ['fds'],

    /**
     * Determines whether the specified ROM is for this platform, based on a platform-specific heuristic.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM appears to belong to this platform based on ROM contents
     */
    isPlatformMatch: function (romImage) {
        // FDS ROMs are identified by their FDS (external) headers.
        return hasFdsHeaderTag(romImage);
    },

    /**
     * Determines whether the specified ROM contains an external (non-embedded) header using platform-specific logic
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM contains an external header
     */
    hasExternalHeader: function (romImage) {
        // Check for iNES header tag ('NES\u001a')
        return hasFdsHeaderTag(romImage);
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
        // so many results
        var result = [];
        return result;
    },

    getFormatName: function (romImage) {
        return this.hasExternalHeader(romImage) ? 'FDS file' : 'rom image';
    }
}

// module.exports = nesPlatform;
export default fdsPlatform;