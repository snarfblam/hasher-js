/**
 * Object containing Neo-Geo-Pocket-specific data and functions
 */

import util from '../romUtils/util'
import { crc16 } from '../hash';
import common from './common';
import RomRegion from '../RomRegion';
const category = common.romDataCategory;

function yesNo(bool) {
    return bool ? "yes" : "no";
    
}

const headerCrcRegionSize = 0x15E;

var ndsPlatform = {
    name: 'NDS',
    longName: "Nintendo DS",
    knownExtensions: ['nds'],

    /**
     * Determines whether the specified ROM is for this platform, based on a platform-specific heuristic.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM appears to belong to this platform based on ROM contents
     */
    isPlatformMatch: function (romImage) {
        //15Eh    2     Header Checksum, CRC-16 of [000h-15Dh]
        if (romImage.length < 0x200) return false;

        var bytesToHash = romImage.subarray(0, headerCrcRegionSize);

        var hash = crc16(bytesToHash);
        // console.log(util.toHex(hash,4));
        // console.log(romImage[0x15e], romImage[0x15F])
        return ((hash & 0xFF) === romImage[0x15e] && (hash >> 8) === romImage[0x15F]);
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
        return [
            new RomRegion('file', romImage, 0, romImage.length),
            new RomRegion('rom', romImage, 0, romImage.length),
        ];
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
        return "Nintendo DS ROM";
    }
}

export default ndsPlatform;