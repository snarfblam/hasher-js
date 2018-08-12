/**
 * Object containing NES-specific data and functions
 */

import util from '../utils/util';
import gbUtil from '../utils/gbUtil';
import GbHeader from '../utils/GbHeader';
import common from './common';
const category = common.romDataCategory;

function yesNo(bool) {
    return bool ? "yes" : "no";
}

var gbPlatform = {
    name: 'GB',
    knownExtensions: ['gb', 'gbc'],

    /**
     * Determines whether the specified ROM is for this platform, based on a platform-specific heuristic.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM appears to belong to this platform based on ROM contents
     */
    isPlatformMatch: function (romImage) {
        return gbUtil.verifyLogo(romImage);
    },

    /**
     * Determines whether the specified ROM contains an external (non-embedded) header using platform-specific logic
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM contains an external header
     */
    hasExternalHeader: function (romImage) {
        // not supported for this platform.
        return false;
    },

    /**
     * Returns an array of region descriptors for sections of the ROM to be hashed
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {{name: string, start: number, length: number}[]} Array of region descriptors
     */
    getHashRegions: function (romImage) {
        return [
            { name: 'file', start: 0, length: romImage.length },
            { name: 'rom', start: 0, length: romImage.length },
        ];
    },

    /**
     * Returns an array of extended information for the ROM image.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {{label: string, category: string, value: any}[]} Array of details
     */
    getExtendedData: function (romImage) {
        var result = [];
        
        var addHeader = (label, value) => result.push({ category: category.Header, label: label, value: value })
        var addRom = (label, value) => result.push({ category: category.ROM, label: label, value: value })
        
        try {
            var gbHeader = new GbHeader(romImage);
        } catch (err) {
            return result;
        }

        addRom("ROM checksum", util.toHex(gbHeader.romChecksum, 4));
        addRom("Checksum valid", yesNo(gbHeader.romChecksumValid));

        addHeader("Logo present", yesNo(gbHeader.validGbLogo));
        addHeader("Header checksum", util.toHex(gbHeader.headerChecksum, 2));
        addHeader("Header checksum valid", yesNo(gbHeader.headerChecksumValid));
        addHeader("ROM checksum", util.toHex(gbHeader.romChecksum,4));
        addHeader("ROM checksum valid", yesNo(gbHeader.romChecksumValid));
        addHeader("Title", gbHeader.title);
        addHeader("Manufacturer", gbHeader.manufacturer);
        addHeader("Gameboy Color support", gbHeader.cgbSupport);
        addHeader("Super Gameboy support", yesNo(gbHeader.supportsSgb));
        addHeader("Cart type", gbHeader.cartType);

        addHeader("ROM size", gbHeader.romSize);
        addHeader("RAM size", gbHeader.ramSize);

        addHeader("Mask ROM version", gbHeader.romVersion);


        addHeader("Licensee code", "$" + util.toHex(gbHeader.licensee, 2));
        addHeader("Licensee code (extended)", gbHeader.lincenseeEx);
        
        return result;
    },

    getFormatName: function (romImage) {
        return "Gameboy ROM image";
    }
}

export default gbPlatform;