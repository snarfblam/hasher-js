// @ts-check

/** The sum of all the bytes making up the standard gameboy logo image in the GB header  */
const gbaLogoChecksum = 0x4927;
/** Location of the GB logo within the ROM  */
const gbaLogoOffset = 0x04;
/** Size of the GB logo image in bytes  */
const gbaLogoSize = 152;


var gbaUtil = {

    /**
     * Validates the logo bitmap in a GBA ROM
     * @param {Uint8Array} romImage 
     * @param {number} [headerOffset] 
     * @returns {boolean}
     */
    verifyLogo: function verifyLogo(romImage, headerOffset) {
        if (headerOffset == null) headerOffset = 0;

        if (romImage.length < headerOffset + gbaLogoOffset + gbaLogoSize)
            return false;
        
        var sum = 0;
        for (var i = 0; i < gbaLogoSize; i++) {
            sum += romImage[gbaLogoOffset + i];
        }

        return (sum & 0xFFFF) === gbaLogoChecksum;
    },

    /**
     * Calculates the checksum of the ROM's internal header
     * @param {Uint8Array} romImage 
     * @param {number?} headerOffset optional
     * @returns {number}
     */
    calculateHeaderChecksum: function calculateHeaderChecksum(romImage, headerOffset) {
        if (headerOffset == null) headerOffset = 0;

        var firstByte = headerOffset + 0xA0;
        var lastByte = headerOffset + 0xBC;

        var sum = 0;
        for (var i = firstByte; i <= lastByte; i++) {
            sum -= romImage[i];
        }

        // Truncate
        return (sum - 0x19) & 0xFF;
    },

};


export default gbaUtil;