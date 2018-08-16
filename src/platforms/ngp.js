/**
 * Object containing Neo-Geo-Pocket-specific data and functions
 */

import util from '../utils/util'
import common from './common';
const category = common.romDataCategory;

/** Value that identifies first-party ROMs */
var NgpCopyright = [0x43, 0x4F, 0x50, 0x59, 0x52, 0x49, 0x47, 0x48, 0x54, 0x20, 0x42, 0x59, 0x20, 0x53, 0x4E, 0x4B];
/** Value that identifies third-party ROMs */
var NgpLicense = [0x20, 0x4C, 0x49, 0x43, 0x45, 0x4E, 0x53, 0x45, 0x44, 0x20, 0x42, 0x59, 0x20, 0x53, 0x4E, 0x4B];
function yesNo(bool) {
    return bool ? "yes" : "no";
}

/** Compares two sets of bytes for equality
 * @param {number[]} bytesA 
 * @param {number} offsetA 
 * @param {number[]} bytesB 
 * @param {number} offsetB 
 * @param {number} length 
 */
function compareBytes(bytesA, offsetA, bytesB, offsetB, length) {
    for (var i = 0; i < length; i++) {
        if (bytesA[offsetA + i] != bytesB[offsetB + i]) return false;
    }

    return true;
}

var ngpPlatform = {
    name: 'NGP',
    longName: "Neo Geo Pocket",
    knownExtensions: ['ngp', 'ngc'],

    /**
     * Determines whether the specified ROM is for this platform, based on a platform-specific heuristic.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM appears to belong to this platform based on ROM contents
     */
    isPlatformMatch: function (romImage) {
        if (romImage.length < 0x10) return false;

        return (
            compareBytes(romImage, 0, NgpCopyright, 0, NgpCopyright.length) ||
            compareBytes(romImage, 0, NgpLicense, 0, NgpLicense.length)
        );
    },

    /**
     * Determines whether the specified ROM contains an external (non-embedded) header using platform-specific logic
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM contains an external header
     */
    hasExternalHeader: function (romImage) {
        return false;
    },

    /**
     * Returns an array of region descriptors for sections of the ROM to be hashed
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {{name: string, start: number, length: number}[]} Array of region descriptors
     */
    getHashRegions: function (romImage) {
        var fileRegion = { name: 'file', start: 0, length: romImage.length };
        var romRegion = { name: 'rom', start: 0, length: romImage.length };

        return [fileRegion, romRegion];
    },

    /**
     * Returns an array of extended information for the ROM image.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {{label: string, category: string, value: any}[]} Array of details
     */
    getExtendedData: function (romImage) {
        var result = [];
        
        // var addHeader = (label, value) => result.push({category: category.Header, label: label, value: value });
        
        // nada
        return result;
    },

    getFormatName: function (romImage) {
        return "Neo Geo Pocket ROM";
    }
}

export default ngpPlatform;