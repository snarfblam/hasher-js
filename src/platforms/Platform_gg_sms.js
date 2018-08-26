// @ts-check

/**
 * Object containing NES-specific data and functions
 */

import smsUtil from '../romUtils/smsUtil';
import { toHex } from '../util';
import RomRegion from '../RomRegion';
import Platform from './Platform';
import Rom from '../Rom';
import common from './common';
const category = common.romDataCategory;

function yesNo(bool) {
    return bool ? "yes" : "no";
}

class Platform_gg_sms extends Platform {
    /**
     * 
     * @param {string} name 
     * @param {string} longName 
     * @param {string[]} knownExts 
     * @param {number[]} regions 
     * @param {string} formatName
     */
    constructor(name, longName, knownExts, regions, formatName) {
        super(name, longName, knownExts);

        /** A list of regions used to identify this platform */
        this.regions = regions;
        /** Name of the file format this platform represents */
        this.formatName = formatName;
    }

    /** @param {Rom} rom */
    isPlatformMatch(rom) {
        var headerOffset = smsUtil.getHeaderOffset(rom.size);
        if(!headerOffset) return false;

        if (!smsUtil.verifyMagicNumber(rom, headerOffset)) return false;
        var region = smsUtil.getRegionCode(rom, headerOffset);
        return this.regions.indexOf(region) >= 0;
    }

    /** @param {Rom} rom */
    hasExternalHeader(rom) {
        return false;
    }

    /** @param {Rom} rom */
    getHashRegions(rom) {
        var fileRegion = new RomRegion('file', rom, 0, rom.size);
        var romRegion = new RomRegion('rom', rom, 0, rom.size);

        return Promise.resolve([fileRegion, romRegion]);
    }

    /** @param {Rom} rom */
    getExtendedData(rom) {
        var result = [];
        
        var addHeader = (label, value) => result.push({category: category.Header, label: label, value: value });
        var addRom = (label, value) => result.push({category: category.ROM, label: label, value: value });

        var romImage = rom.preview;
        var headerOffset = smsUtil.getHeaderOffset(rom.size);
        var headerValid = smsUtil.verifyMagicNumber(romImage, headerOffset);

        addHeader("Header found", yesNo(headerValid));

        if (headerValid) {
            addHeader("Checksum", toHex(smsUtil.getChecksum(romImage, headerOffset), 4));
            addHeader("Region", smsUtil.regionCodes[smsUtil.getRegionCode(romImage, headerOffset)]);
            addHeader("Version", smsUtil.getVersion(romImage, headerOffset));
            addHeader("Product code", smsUtil.getProductCode(romImage, headerOffset));
        }
        
        return Promise.resolve(result);
    }

    /** @param {Rom} rom */
    getFormatName(rom) {
        return "Master System ROM image";
    }
}

export default Platform_gg_sms;