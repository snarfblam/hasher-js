/**
 * Object containing NES-specific data and functions
 */

import snesUtil from '../romUtils/snesUtil';
import SnesHeader from '../romUtils/SnesHeader';
import RomRegion from '../RomRegion';
import common from './common';
const category = common.romDataCategory;

var snesPlatform = {
    name: 'SNES',
    longName: 'Super Nintendo Entertainment System',
    knownExtensions: ['smc', 'sfc', 'swc', 'fig'],

    /**
     * Determines whether the specified ROM is for this platform, based on a platform-specific heuristic.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM appears to belong to this platform based on ROM contents
     */
    isPlatformMatch: function (romImage) {
        if (romImage.length < 0x2000) return false;

        if (romImage.length < 4200000 && romImage.length >= 0x8000) {
            var checksum = snesUtil.calculateChecksum(romImage);

            if (checksum != 0 && checksum == snesUtil.getInternalChecksum(romImage)) return true;
        }
        
        if (snesUtil.hasGoodSmcHeader(romImage)) return true;
        if (snesUtil.hasGoodSwcHeader(romImage)) return true;
        
        return false;
    },

    /**
     * Determines whether the specified ROM contains an external (non-embedded) header using platform-specific logic
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM contains an external header
     */
    hasExternalHeader: function (romImage) {
        // Check for iNES header tag ('NES\u001a')
        return snesUtil.hasExternalHeader(romImage);
    },

    /**
     * Returns an array of region descriptors for sections of the ROM to be hashed
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {RomRegion[]} Array of region descriptors
     */
    getHashRegions: function (romImage) {
        var fileRegion = new RomRegion('file', romImage, 0, romImage.length);
        var romRegion;

        if (this.hasExternalHeader(romImage)) {
            romRegion = new RomRegion('file', romImage, snesUtil.externalHeaderSize, romImage.length - snesUtil.externalHeaderSize );
        } else {
            romRegion = new RomRegion('file', romImage, 0, romImage.length);
        }

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

        var internalHeader = new SnesHeader(romImage);
        var checksum = snesUtil.calculateChecksum(romImage);

        if (this.hasExternalHeader(romImage)) {
            addRom("Actual checksum", checksum);
            addRom("Mapping", internalHeader.mapping);
            
            if (internalHeader.valid) {
                addHeader("Header offset", internalHeader.internalHeaderOffset);
                addHeader("Checksum", internalHeader.checksum);
                addHeader("Checksum complement", internalHeader.checksumComplement);
            }
        }
        
        return result;
    },

    getFormatName: function (romImage) {
        if (snesUtil.hasGoodSmcHeader(romImage)) return "Super Magic Com ROM";
        if (snesUtil.hasGoodSwcHeader(romImage)) return "Super Wild Card ROM";
        if (snesUtil.hasExternalHeader(romImage)) return "SNES ROM image (headered)";
        return "SNES ROM image";
    }
}

// module.exports = snesPlatform;
export default snesPlatform;