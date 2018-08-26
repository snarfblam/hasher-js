/**
 * Object containing NES-specific data and functions
 */

import smsUtil from '../romUtils/smsUtil';
import { toHex } from '../util';
import RomRegion from '../RomRegion';
import common from './common';
const category = common.romDataCategory;

import Platform_gg_sms from './Platform_gg_sms';

class SmsPlatform extends Platform_gg_sms {
    constructor() {
        super(
            // Name, long name, extensions
            'SMS', 'Master System', ['sms'],
            // Region codes
            [3, 4],
            // File format name
            'Master System ROM image'
        );
    }
}

function yesNo(bool) {
    return bool ? "yes" : "no";
}



var smsPlatform = {
    name: 'SMS',
    longName: "Master System",
    knownExtensions: ['sms'],

    /**
     * Determines whether the specified ROM is for this platform, based on a platform-specific heuristic.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM appears to belong to this platform based on ROM contents
     */
    isPlatformMatch: function (romImage) {
        var headerOffset = smsUtil.getHeaderOffset(romImage.length);
        if(!headerOffset) return false;

        if (!smsUtil.verifyMagicNumber(romImage, headerOffset)) return false;
        var region = smsUtil.getRegionCode(romImage, headerOffset);
        return region === 3 || region === 4;
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
        var fileRegion = new RomRegion('file', romImage, 0,romImage.length );
        var romRegion = new RomRegion('file', romImage, 0, romImage.length);

        return [fileRegion, romRegion];
    },

    /**
     * Returns an array of extended information for the ROM image.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {{label: string, category: string, value: any}[]} Array of details
     */
    getExtendedData: function (romImage) {
        var result = [];
        
        var addHeader = (label, value) => result.push({category: category.Header, label: label, value: value });
        var addRom = (label, value) => result.push({category: category.ROM, label: label, value: value });

        var headerOffset = smsUtil.getHeaderOffset(romImage.length);
        var headerValid = smsUtil.verifyMagicNumber(romImage, headerOffset);

        addHeader("Header found", yesNo(headerValid));

        if (headerValid) {
            addHeader("Checksum", toHex(smsUtil.getChecksum(romImage, headerOffset), 4));
            addHeader("Region", smsUtil.regionCodes[smsUtil.getRegionCode(romImage, headerOffset)]);
            addHeader("Version", smsUtil.getVersion(romImage, headerOffset));
            addHeader("Product code", smsUtil.getProductCode(romImage, headerOffset));
        }
        
        return result;
    },

    getFormatName: function (romImage) {
        return "Master System ROM image";
    }
}

export { SmsPlatform };
export default smsPlatform;