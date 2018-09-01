// @ts-check

/**
 * Object containing Neo-Geo-Pocket-specific data and functions
 */

import { crc16 } from '../hash';
import RomRegion from '../RomRegion';
import Platform from './Platform';
import Rom from '../Rom';
const category = Platform.exDataCategories;

// function yesNo(bool) {
//     return bool ? "yes" : "no";
    
// }

const headerCrcRegionSize = 0x15E;

class NdsPlatform extends Platform {
    constructor() {
        super('NDS', "Nintendo DS", ['nds']);
    }

    /** @param {Rom} rom */
    isPlatformMatch(rom) {
        //15Eh    2     Header Checksum, CRC-16 of [000h-15Dh]
        if (rom.size < 0x200) return false;

        var bytesToHash = rom.preview.subarray(0, headerCrcRegionSize);

        var hash = crc16(bytesToHash);
        return ((hash & 0xFF) === rom.preview[0x15e] && (hash >> 8) === rom.preview[0x15F]);
    }

    /** @param {Rom} rom */
    hasExternalHeader(rom) {
        return false;
    }

    /** @param {Rom} rom */
    getHashRegions(rom) {
        return Promise.resolve([
            new RomRegion('file', rom, 0, rom.size),
            new RomRegion('rom', rom, 0, rom.size),
        ]);
    }

    /** @param {Rom} rom */
    getFormatName(rom) {
        return "Nintendo DS ROM";
    }
}

// export default ndsPlatform;
export default NdsPlatform;