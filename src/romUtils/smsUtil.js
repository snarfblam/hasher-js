// @ts-check

var headerOffsets = [0x7FF0, 0x3FF0, 0x1FF0];
var defaultHeaderOffset = 0x7FF0;

var regionCodes = [];
regionCodes[3] = "SMS Japan";
regionCodes[4] = "SMS Export";
regionCodes[5] = "GG Japan";
regionCodes[6] = "GG Export";
regionCodes[7] = "GG International";

const headerToken = [0x54, 0x4D, 0x52, 0x20, 0x53, 0x45, 0x47, 0x41];


var smsUtil = {

    /**
     * Verifies the ROM header contains the identifying marker
     * @param {Uint8Array} rom 
     * @param {number} headerOffset optional
     * @returns {boolean}
     */
    verifyMagicNumber: function verifyMagicNumber(romImage, headerOffset) {
        if (headerOffset == null) headerOffset = defaultHeaderOffset;

        if (romImage.Length < headerOffset + 0x10) return false;

        for (var i = 0; i < headerToken.length; i++) {
            if (romImage[i + headerOffset] != headerToken[i]) return false;
        }

        return true;
    },

    /**
     * Gets the location the header is expected to be found, given the size of a ROM.
     * Returns a number, or null a ROM that is too small.
     * @param {number} romSize
     * @returns {number}
     */
    getHeaderOffset: function (romSize) {
        // highest known location that falls within the ROM
        for (var i = 0; i < headerOffsets.length; i++) {
            if (headerOffsets[i] < romSize) return headerOffsets[i];
        }

        return null;
    },

    /**
    * Gets the region code for the given ROM. See regionCodes.
    * @param {Uint8Array} rom 
    * @param {number} headerOffset optional
    * @returns {number}
    */
    getRegionCode: function (romImage, headerOffset) {
        if (headerOffset == null) headerOffset = defaultHeaderOffset;

        return romImage[headerOffset + 0xF] >> 4;
    },

    
    /**
    * Gets the product code for the given ROM.
    * @param {Uint8Array} rom 
    * @param {number} headerOffset optional
    * @returns {string}
    */
    getProductCode: function (romImage, headerOffset) {
        if (headerOffset == null) headerOffset = defaultHeaderOffset;

        // Stored in BCD, but highest digit is allowed to overflow
        var d0 = romImage[headerOffset + 0xC] & 0xF;
        var d1 = romImage[headerOffset + 0xC] >> 4;
        var d2 = romImage[headerOffset + 0xD] & 0xF;
        var d3 = romImage[headerOffset + 0xD] >> 4;
        var dRest = romImage[headerOffset + 0xE] >> 4;

        return [dRest, d3, d2, d1, d0].join('');
    },

        /**
    * Gets the region code for the given ROM. See regionCodes.
    * @param {Uint8Array} rom 
    * @param {number} headerOffset optional
    * @returns {number}
    */
    getVersion: function (romImage, headerOffset) {
        if (headerOffset == null) headerOffset = defaultHeaderOffset;

        return romImage[headerOffset + 0xE] & 0xF;
    },

        /**
    * Gets the region code for the given ROM. See regionCodes.
    * @param {Uint8Array} rom 
    * @param {number} headerOffset optional
    * @returns {number}
    */
    getChecksum: function (romImage, headerOffset) {
        if (headerOffset == null) headerOffset = defaultHeaderOffset;

        return romImage[headerOffset + 0xA] | (romImage[headerOffset + 0xB] << 8);
    },

    /** Array containing known region code names */
    regionCodes: regionCodes,
};

export default smsUtil;