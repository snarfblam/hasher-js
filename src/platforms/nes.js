/**
 * Object containing NES-specific data and functions
 */
var nesPlatform = {
    name: 'NES',
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

        return this.hasExternalHeader(romImage) ? [fileRegion, romRegion] : [fileRegion];
    }
}


module.exports = nesPlatform;