// @ts-check

/**
 * Object containing NES-specific data and functions
 */

import RomRegion from '../RomRegion';
import Rom from '../Rom';
import Platform from './Platform';
const category = Platform.exDataCategories;

/**
 * Checks whether the rom image has the 'FDS' external header identifier
 * @param {Uint8Array} romImage 
 * @returns {boolean}
 */
function hasFdsHeaderTag(romImage) {
    return (romImage.length > 0x10 && (romImage[0] === 0x46 && romImage[1] === 0x44 && romImage[2] === 0x53 && romImage[3] === 0x1a));
}

class FdsPlatform extends Platform {
    constructor() {
        super('FDS', "Famicom Disk System", ['fds']);
    }

    /** @param {Rom} rom */
    isPlatformMatch (rom) {
        // FDS ROMs are identified by their FDS (external) headers.
        return hasFdsHeaderTag(rom.preview);
    }

    /** @param {Rom} rom */
    hasExternalHeader(rom) {
        // Check for iNES header tag ('NES\u001a')
        return hasFdsHeaderTag(rom.preview);
    }

    /** @param {Rom} rom */
    getHashRegions(rom) {
        var fileRegion = new RomRegion('file', rom, 0, rom.size);
        var romRegion;
        if (this.hasExternalHeader(rom)) {
            romRegion = new RomRegion('rom', rom, 0x10, rom.size - 0x10);
        } else {
            romRegion = new RomRegion('rom', rom, 0, rom.size);
        } 

        return Promise.resolve([fileRegion, romRegion]);
    }

    /** @param {Rom} rom */
    getFormatName(rom) {
        return this.hasExternalHeader(rom) ? 'FDS file' : 'rom image';
    }
}

// module.exports = nesPlatform;
export default FdsPlatform;