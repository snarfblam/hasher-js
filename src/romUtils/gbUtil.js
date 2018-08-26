// @ts-check

/** Checksum of logo bitmap */
const gbLogoChecksum = 0x1546;
/** Location of logo bitmap */
const gbLogoOffset = 0x0104;
/** Size of logo bitmap in bytes */
const gbLogoSize = 0x30;
/** Offset of a header within a ROM image */
const gbHeaderOffset = 0x100;

var gbUtil = {

    /** Checksum of logo bitmap */
    gbLogoChecksum: gbLogoChecksum,
    /** Location of logo bitmap */
    gbLogoOffset: gbLogoOffset,
    /** Size of logo bitmap in bytes */
    gbLogoSize: gbLogoSize,
    /** Offset of a header within a ROM image */
    gbHeaderOffset: gbHeaderOffset,


    /**
     * Returns a boolean indicating whether or not the specified ROM or header contains a valid logo bitmap
     * @param {Uint8Array} romImage
     * @param {number} [headerOffset] 
     * @returns {boolean}
     */
    verifyLogo: function (romImage, headerOffset) {
        if (headerOffset == null) headerOffset = gbHeaderOffset;

        if (romImage.length < headerOffset + (gbLogoOffset - 0x100) + gbLogoSize) { 
            return false;
        }

        var sum = 0;
        for (var i = 0; i < gbLogoSize; i++) {
            sum += romImage[gbLogoOffset + i];
        }

        return sum == gbLogoChecksum;
    },

    /**
     * Returns the checksum of the specified header
     * @param {Uint8Array} romImage
     * @param {number} headerOffset optional
     * @returns {number}
     */
    calculateHeaderChecksum: function (romImage, headerOffset) {
        if (headerOffset == null) headerOffset = gbHeaderOffset;

        var firstByte = headerOffset + 0x34;
        var lastByte = headerOffset + 0x4C;
        var sum = 0;

        for (var i = firstByte; i <= lastByte; i++) {
            sum -= romImage[i] + 1;
        }

        return sum & 0xFF;
    },

    /**
     * Calculates a ROM's checksum. This can be compared to the
     * checksum found in the internal header to verify the header.
     * @param {Uint8Array} romImage
     * @returns {number}
     */
    calculateRomChecksum: function (romImage) {
        var sum = 0;

        for (var i = 0; i < romImage.length; i++) {
            sum = 0xFFFFFF & (sum + romImage[i]);
        }

        if (romImage.length >= 0x0150) {
            sum -= romImage[0x14e];
            sum -= romImage[0x14f];
        }

        return sum & 0xFFFF;
    },

};

export default gbUtil;