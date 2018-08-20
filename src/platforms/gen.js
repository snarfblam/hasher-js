/**
 * Object containing Genesis-specific data and functions
 */

import RomRegion from '../RomRegion';
import common from './common';
import genUtil from '../utils/genUtil';
import util from '../utils/util';
import GenHeader from '../utils/GenHeader';
const category = common.romDataCategory;

var genPlatform = {
    name: 'GEN',
    longName: 'Genesis',
    knownExtensions: ['bin', 'gen', 'smd', 'md'],

    /**
     * Determines whether the specified ROM is for this platform, based on a platform-specific heuristic.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM appears to belong to this platform based on ROM contents
     */
    isPlatformMatch: function (romImage) {
        return genUtil.getRomInfo(romImage).internalHeader;
    },

    /**
     * Determines whether the specified ROM contains an external (non-embedded) header using platform-specific logic
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM contains an external header
     */
    hasExternalHeader: function (romImage) {
        return genUtil.getRomInfo(romImage).externalHeader;
    },

    /**
     * Returns an array of region descriptors for sections of the ROM to be hashed
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {RomRegion[]} Array of region descriptors
     */
    getHashRegions: function (romImage) {
        var binRom = genUtil.getBinFormat(romImage);

        var fileRegion = new RomRegion('file', romImage, 0,romImage.length );
        var romRegion = new RomRegion('rom', binRom, 0, binRom.length);

        return [fileRegion, romRegion];
    },

    /**
     * Returns an array of extended information for the ROM image.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {{label: string, category: string, value: any}[]} Array of details
     */
    getExtendedData: function (romImage) {
        try {
            var header = new GenHeader(romImage);
        }
        catch (err) {
            console.warn(err);
            return [];
        }

        var result = [];
        var addHeader = (label, value) => result.push({ category: category.Header, label: label, value: value })
        var addRom = (label, value) => result.push({ category: category.ROM, label: label, value: value })

        addHeader("Title", header.gameName);
        addHeader("Alt Title", header.altName);
        addHeader("Platform", header.platform);
        addHeader("Region", header.region);
        addHeader("Copyright", header.copyrightFormatted);
        addHeader("Product ID", header.productID);
        addHeader("Checksum", util.toHex(header.checksum, 4));
        addHeader("IO Devices", header.ioSupportFormatted);
        addHeader("Memo", header.memo);
        addHeader("Modem", header.modem);

        var romStart = util.toHex(header.romStart, 8);
        var romEnd = util.toHex(header.romEnd, 8);
        var ramStart = util.toHex(header.ramStart, 8);
        var ramEnd = util.toHex(header.ramEnd, 8);

        addHeader("ROM range", romStart + "-" + romEnd);
        addHeader("RAM range", ramStart + "-" + ramEnd);

        return result;
    },

    getFormatName: function (romImage) {
        var { externalHeader, interleaved } = genUtil.getRomInfo(romImage);

        if (interleaved) {
            return externalHeader ? "SMD (headered)" : "SMD (no header)";
        } else {
            return externalHeader ? "BIN (headered)" : "BIN";
        }
    }
}

// module.exports = nesPlatform;
export default genPlatform;