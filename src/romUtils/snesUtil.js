// @ts-check

var snesUtil = {
    /**
     * Calculates the 16-bit checksum of the ROM
     * @param {Uint8Array} romImage
     * @returns {number}
     */
    calculateChecksum: function(romImage) {
        // NOTE: I've found two SNES checksum algorithms, one of
        // which mirrors data to a power-of-two size, and one of
        // which mirrors data to a multiple of 4 MBits. Both failed
        // some of the ROMs tested.
        // 
        // Hello past self. This is future self. I've received yet a third explanation:
        // The largest power of two that is less than or equal the size of the ROM is 
        // checksummed, then the remainder (if any) is mirrored to the next power of two
        if (romImage.byteLength < 0x1000) return 0;

        var size = snesUtil.getRomSize(romImage);
        var mirroredSize = size.mirroredSize;
        var unmirroredSize = size.unmirroredSize;
        var baseOffset = snesUtil.hasExternalHeader(romImage) ? snesUtil.externalHeaderSize : 0;
    
        // ANDing the value of a number with -1 results in an integer truncated to 32 bits (signed)
        var result = 0; // 32-bit signed int


        // Sum unmirrored data
        var endOfUnmirrored = baseOffset + unmirroredSize;
        for (var iByte = baseOffset; iByte < endOfUnmirrored; iByte++) {
            result = (result + romImage[iByte]) & -1;
        }

        if(mirroredSize == 0)
            return result & 0xFFFF;

        var startOfMirrored = baseOffset + unmirroredSize;
        var endOfMirrored = startOfMirrored + mirroredSize;
        var mirrorCount = unmirroredSize / mirroredSize;

        // Sum mirrored data
        for (var iMirror = 0; iMirror < mirrorCount; iMirror++) {
            for (var iByte = startOfMirrored; iByte < endOfMirrored; iByte++) {
                result = (result + romImage[iByte]) & -1;
            }
        }

        return result & 0xFFFF;
    },

    /**
     * Gets the size of mirrored and unmirrored data in the ROM.
     * @param romImage {Uint8Array}
     * @returns {{unmirroredSize: number, mirroredSize: number}}
     */
    getRomSize: function (romImage) {
        var result = {};

        var totalSize = romImage.byteLength;
        if (snesUtil.hasExternalHeader(romImage)) totalSize -= snesUtil.externalHeaderSize;

        result.unmirroredSize = 1024;

        // We'll keep checking larger powers of two until we
        // find one that is >= total ROM size
        while (true) {
            // Is the size exactly a power of 2? Then nothing is mirrored.
            if (result.unmirroredSize == totalSize) {
                result.mirroredSize = 0;
                return result;
            }

            var nextSize = result.unmirroredSize  * 2;

            // Size is not a power of two? Remainder is mirrored.
            if (nextSize > totalSize) {
                result.mirroredSize = totalSize - result.unmirroredSize;
                return result;
            }

            result.unmirroredSize = nextSize;
        }
    },

    // /**
    //  * Returns the internal checksum. The result may be incorrect or NULL if the ROM is not
    //  * large enough or HIROM/LOROM can't be detected.
    //  * @param romImage {Uint8Array}
    //  * @param {number} [size]
    //  * @returns {number | null}
    //  */
    // getInternalChecksum: function (romImage, size) {
    //     var romImageOffset = snesUtil.hasExternalHeader(romImage) ? snesUtil.externalHeaderSize : 0;

    //     //if (offset + 1 >= rom.Length) return 0;
    //     //return (ushort)(rom[offset] | (rom[offset + 1] << 8));
    //     var mapping = snesUtil.checkHiromOrLorom(romImage, size);
    //     //HiromOrLorom(romImage, romImageOffset, out lorom, out hirom);
        
    //     if (mapping.exhirom && (romImage.byteLength >= snesUtil.exhiromChecksumOffset + 1)) {
    //         return (
    //             romImage[romImageOffset + snesUtil.exhiromChecksumOffset] |
    //             romImage[romImageOffset + snesUtil.exhiromChecksumOffset + 1] << 8
    //         );
    //     } else if (mapping.hirom && (romImage.byteLength >= snesUtil.hiromChecksumOffset + 1)) {
    //         return (
    //             romImage[romImageOffset + snesUtil.hiromChecksumOffset] |
    //             romImage[romImageOffset + snesUtil.hiromChecksumOffset + 1] << 8
    //         );
    //     } else if (romImage.byteLength >= snesUtil.loromChecksumOffset + 1) {
    //         return (
    //             romImage[romImageOffset + snesUtil.loromChecksumOffset] |
    //             romImage[romImageOffset + snesUtil.loromChecksumOffset + 1] << 8
    //         );
    //     }
    //     return null;
    // },

    /**
     * Identifies whether the ROM has an external ROM header (SMC, SWC, or Pro Fighter)
     * @param romImage {Uint8Array}
     * @returns {boolean}
     */
    hasExternalHeader: function (romSize) {
        return (romSize % 1024) === snesUtil.externalHeaderSize;
    },

    /**
     * Returns true if the ROM can be determined to have a valid SMC header
     * @param {Uint8Array} romImage
     * @returns boolean
     */
    hasGoodSmcHeader: function (romImage) {
        if (!snesUtil.hasExternalHeader(romImage)) return false;

        // Verify size specified
        var size = romImage.byteLength - snesUtil.externalHeaderSize;
        var smcSizeValue = romImage[0] | (romImage[1] << 8);
        var smcSize = smcSizeValue * 8 * 1024; // Size is specified in units of 8kB

        // Verify zero padding
        if (romImage.byteLength != smcSize + snesUtil.externalHeaderSize) return false;
        for (var i = 0; i < 509; i++) {
            if (romImage[i + 3] != 0) return false;
        }

        return true;
    },

    /**
     * Returns true if the ROM can be determined to have a valid SWC header
     * @param {Uint8Array} romImage
     * @returns boolean
     */
    hasGoodSwcHeader: function (romImage) {
        if (!snesUtil.hasExternalHeader(romImage)) return false;

        // Verify size specified
        var size = romImage.byteLength - snesUtil.externalHeaderSize;
        var smcSizeValue = romImage[0] | (romImage[1] << 8);
        var smcSize = smcSizeValue * 8 * 1024; // Size is specified in units of 8kB

        // Apparently, this is some sort of magic number
        if (romImage[8] != 0xAA || romImage[9] != 0xBB || romImage[10] != 0x04) return false;

        // Verify zero padding
        if (romImage.byteLength != smcSize + snesUtil.externalHeaderSize) return false;
        for (var i = 0; i < 501; i++) {
            if (romImage[i + 11] != 0) return false;
        }

        return true;    },

    /**
     * Returns an object that indicates whether the ROM matches the heuristic
     * for detecting HiROM, LoRom, both, or neither.
     * @param {*} romImagePreview - An array containing at least the first 64 KB of the ROM
     * @param {number} [size] - Optional. Used as a heuristic in determining ROM layout.
     * @returns {{lorom: boolean, hirom: boolean, exhirom: boolean}}
     */
    checkHiromOrLorom: function (romImagePreview, size) {
        var romImageOffset = snesUtil.hasExternalHeader(romImagePreview) ? snesUtil.externalHeaderSize : 0;

        var result = { hirom: false, lorom: false, exhirom: false };

        if (romImagePreview.byteLength < romImageOffset + 0x10000) {
            return result;
        }

        var loromCheckum = getWord(romImagePreview, romImageOffset + snesUtil.loromChecksumOffset);
        var loromComplement = getWord(romImagePreview, romImageOffset + snesUtil.loromChecksumCompOffset);

        var hiromCheckum = getWord(romImagePreview, romImageOffset + snesUtil.hiromChecksumOffset);
        var hiromComplement = getWord(romImagePreview, romImageOffset + snesUtil.hiromChecksumCompOffset);

        var exhiromCheckum = getWord(romImagePreview, romImageOffset + snesUtil.exhiromChecksumOffset);
        var exhiromComplement = getWord(romImagePreview, romImageOffset + snesUtil.exhiromChecksumCompOffset);

        result.lorom =
            ((loromCheckum.lo ^ loromComplement.lo) == 0xFF) &&
            ((loromCheckum.hi ^ loromComplement.hi) == 0xFF);
        result.hirom =
            ((hiromCheckum.lo ^ hiromComplement.lo) == 0xFF) &&
            ((hiromCheckum.hi ^ hiromComplement.hi) == 0xFF);
        //result.exhirom = Math.max(romImagePreview.byteLength, (size || 0)) >= snesUtil.exhiromThreshold;
        result.exhirom =
            ((exhiromCheckum.lo ^ exhiromComplement.lo) == 0xFF) &&
            ((exhiromCheckum.hi ^ exhiromComplement.hi) == 0xFF);
        
        return result;
    },

    externalHeaderSize: 512,
    /// <summary>Location of checksum in a HIROM game</summary>
    hiromChecksumOffset: 0xFFDE,
    /// <summary>Location of checksum in a LOROM game</summary>
    loromChecksumOffset: 0x7FDE,
    /// <summary>Location of checksum in a EXHIROM game</summary>
    exhiromChecksumOffset: 0x40FFDE,
    /// <summary>Location of checksum complement in a HIROM game</summary>
    hiromChecksumCompOffset: 0xFFDC,
    /// <summary>Location of checksum complement in a LOROM game</summary>
    loromChecksumCompOffset: 0x7FDC,
    /// <summary>Location of checksum complement in a EXHIROM game</summary>
    exhiromChecksumCompOffset: 0x40FFDC,
    /// <summary>The minimum size of a ROM image that can be considered EXHIROM</summary>
    exhiromThreshold: 0x400001,
    
};

/**
 * Gets the 16-bit value as two byte values, low byte first
 * @param {Uint8Array} byteArray 
 * @param {number} offset 
 * @returns {{lo: number, hi: number}}
 */
function getWord(byteArray, offset) {
    return {
        lo: byteArray[offset],
        hi: byteArray[offset + 1]
    };
}

export default snesUtil;