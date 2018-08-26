// @ts-check

/**
 * Object containing NES-specific data and functions
 */

import { toHex } from '../util';
import RomRegion from '../RomRegion';
import gbaUtil from '../romUtils/gbaUtil';
import GbaHeader from '../romUtils/GbaHeader';
import common from './common';
const category = common.romDataCategory;
import Platform from './Platform';
import Rom from '../Rom';

function yesNo(bool) {
    return bool ? "yes" : "no";
}

class GbaPlatform extends Platform {
    constructor() {
        super('GBA', "Game Boy Advance", ['gba']);
    }
     

    /** @param {Rom} rom */
    isPlatformMatch(rom) {
        return gbaUtil.verifyLogo(rom.preview);
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
    getExtendedData(rom) {
        var result = [];
        
        var addHeader = (label, value) => result.push({ category: category.Header, label: label, value: value })
        var addRom = (label, value) => result.push({ category: category.ROM, label: label, value: value })
        
        // try {
        //     var gbaHeader = new GbaHeader(romImage);
        // } catch (err) {
        //     console.warn(err);
        //     return result;
        // }
        return this.getHeader(rom)
            .catch(err => {
                console.warn(err);
                return null;
            })
            .then(header => {
                if (header) {
                    addHeader("Logo present", yesNo(header.validGbaLogo));
                    addHeader("Header checksum", toHex(header.headerChecksum, 2));
                    addHeader("Header checksum valid", yesNo(header.headerChecksumValid));
                    addHeader("Title", header.title);
                    addHeader("Game Maker", header.makerCode);
                    addHeader("Game Code", header.gameCode);
        
                    addHeader("Mask ROM version", header.romVersion);
                }
                return result;
            });
    }

    /** @param {Rom} rom */
    getFormatName(rom) {
        return "Gameboy Advance ROM image";
    }
    
    /** @param {Rom} rom */
    _decodeHeader(rom) {
        return new GbaHeader(rom.preview)        
    }
}
    

export default GbaPlatform;