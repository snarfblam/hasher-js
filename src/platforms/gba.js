// @ts-check

/**
 * Object containing NES-specific data and functions
 */

import { toHex, HexValue } from '../util';
import RomRegion from '../RomRegion';
import gbaUtil from '../romUtils/gbaUtil';
import GbaHeader from '../romUtils/GbaHeader';
import Platform from './Platform';
const category = Platform.exDataCategories;
import Rom from '../Rom';

// function yesNo(bool) {
//     return bool ? "yes" : "no";
// }

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
        return this.getHeader(rom)
            .catch(err => {
                console.warn(err);
                return null;
            })
            .then(header => {
                return Promise.all([header, super.getExtendedData(rom)]);
            })
            .then(([header, data]) => {
                if (header) {
                    data.addHeader("Logo present", header.validGbaLogo);
                    data.addHeader("Header checksum", HexValue.justHex(header.headerChecksum, 2));
                    data.addHeader("Header checksum valid", header.headerChecksumValid);
                    data.addHeader("Title", header.title);
                    data.addHeader("Game Maker", header.makerCode);
                    data.addHeader("Game Code", header.gameCode);
        
                    data.addHeader("Mask ROM version", header.romVersion);
                }
                return data;
            });
    }

    /** @param {Rom} rom */
    getFormatName(rom) {
        return "Game Boy Advance ROM image";
    }
    
    /** @param {Rom} rom */
    _decodeHeader(rom) {
        return new GbaHeader(rom.preview)        
    }
}
    

export default GbaPlatform;