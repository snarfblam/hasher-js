// @ts-check

/**
 * Object containing Neo-Geo-Pocket-specific data and functions
 */

import RomRegion from '../RomRegion';
import Platform from './Platform';
const category = Platform.exDataCategories;
import Rom from '../Rom';

/** Value that identifies first-party ROMs */
var NgpCopyright = [0x43, 0x4F, 0x50, 0x59, 0x52, 0x49, 0x47, 0x48, 0x54, 0x20, 0x42, 0x59, 0x20, 0x53, 0x4E, 0x4B];
/** Value that identifies third-party ROMs */
var NgpLicense = [0x20, 0x4C, 0x49, 0x43, 0x45, 0x4E, 0x53, 0x45, 0x44, 0x20, 0x42, 0x59, 0x20, 0x53, 0x4E, 0x4B];
// function yesNo(bool) {
//     return bool ? "yes" : "no";
// }

/** Compares two sets of bytes for equality
 * @param {number[] | ArrayBufferView} bytesA 
 * @param {number} offsetA 
 * @param {number[] | ArrayBufferView} bytesB 
 * @param {number} offsetB 
 * @param {number} length 
 */
function compareBytes(bytesA, offsetA, bytesB, offsetB, length) {
    for (var i = 0; i < length; i++) {
        if (bytesA[offsetA + i] != bytesB[offsetB + i]) return false;
    }

    return true;
}

class NgpPlatform extends Platform{
    constructor() {
        super('NGP', "Neo Geo Pocket", ['ngp', 'ngc']);
    }

    /** @param {Rom} rom */
    isPlatformMatch(rom) {
        if (rom.size < 0x10) return false;

        return (
            compareBytes(rom.preview, 0, NgpCopyright, 0, NgpCopyright.length) ||
            compareBytes(rom.preview, 0, NgpLicense, 0, NgpLicense.length)
        );
    }

    /** @param {Rom} rom */
    hasExternalHeader(rom) {
        return false;
    }

    /** @param {Rom} rom */
    getHashRegions(rom) {
        var fileRegion = new RomRegion('file', rom, 0,rom.size);
        var romRegion = new RomRegion('rom', rom, 0,rom.size);

        return Promise.resolve([fileRegion, romRegion]);
    }

    /** @param {Rom} rom */
    getFormatName(rom) {
        return "Neo Geo Pocket ROM image";
    }
}

export default NgpPlatform;