/**
 * Object containing NES-specific data and functions
 */

import util from '../utils/util';
import RomRegion from '../RomRegion';
import gbaUtil from '../utils/gbaUtil';
import GbaHeader from '../utils/GbaHeader';
import common from './common';
const category = common.romDataCategory;

function yesNo(bool) {
    return bool ? "yes" : "no";
}

var gbaPlatform = {
    name: 'GBA',
    longName: "Game Boy Advance",
    knownExtensions: ['gba'],

    /**
     * Determines whether the specified ROM is for this platform, based on a platform-specific heuristic.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM appears to belong to this platform based on ROM contents
     */
    isPlatformMatch: function (romImage) {
        return gbaUtil.verifyLogo(romImage);
    },

    /**
     * Determines whether the specified ROM contains an external (non-embedded) header using platform-specific logic
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM contains an external header
     */
    hasExternalHeader: function (romImage) {
        // not supported for this platform.
        false
    },

    /**
     * Returns an array of region descriptors for sections of the ROM to be hashed
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {RomRegion[]} Array of region descriptors
     */
    getHashRegions: function (romImage) {
        return [
            new RomRegion('file', rom, 0, romImage.length),
            new RomRegion('rom', rom, 0, romImage.length),
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
            var gbaHeader = new GbaHeader(romImage);
        } catch (err) {
            console.warn(err);
            return result;
        }

        addHeader("Logo present", yesNo(gbaHeader.validGbaLogo));
        addHeader("Header checksum", util.toHex(gbaHeader.headerChecksum, 2));
        addHeader("Header checksum valid", yesNo(gbaHeader.headerChecksumValid));
        addHeader("Title", gbaHeader.title);
        addHeader("Game Maker", gbaHeader.makerCode);
        addHeader("Game Code", gbaHeader.gameCode);

        addHeader("Mask ROM version", gbaHeader.romVersion);
        return result;
    },

    getFormatName: function (romImage) {
        return "Gameboy Advance ROM image";
    }
}

export default gbaPlatform;