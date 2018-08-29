//@ts-check

/**
 * Object containing NES-specific data and functions
 */

import RomRegion from '../RomRegion';
import Platform from './Platform';
import Rom from '../Rom';
const category = Platform.exDataCategories;


class UnknownPlatform extends Platform {
    constructor() {
        super("UNK", "Unknown Platform", []);
    }

    /** @param {Rom} rom */
    isPlatformMatch(rom) {
        return false;
    }

    /** @param {Rom} rom */
    hasExternalHeader(rom) {
        return false;
    }

    /** @param {Rom} rom */
    getHashRegions(rom) {
        var fileRegion = new RomRegion('file', rom, 0,rom.size);
        var romRegion = new RomRegion('rom', rom, 0, rom.size);

        return Promise.resolve([fileRegion, romRegion]);
    }

    /** @param {Rom} rom */
    getExtendedData(rom) {
        return super.getExtendedData(rom);
    }

    /** @param {Rom} rom */
    getFormatName(rom) {
        return 'Unknown file type';
    }

}

export default UnknownPlatform;