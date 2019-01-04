// @ts-check

/**
 * Object containing NES-specific data and functions
 */

import { toHex, HexValue } from '../util';
import RomRegion from '../RomRegion';
import gbUtil from '../romUtils/gbUtil';
import GbHeader from '../romUtils/GbHeader';
import Platform from './Platform';
const category = Platform.exDataCategories;
import Rom from '../Rom';

// function yesNo(bool) {
//     return bool ? "yes" : "no";
// }

class GbPlatform extends Platform {
    constructor() {
        super('GB', "Game Boy", ['gb', 'gbc']);
    }
    
    /** @param {Rom} rom */
    isPlatformMatch(rom) {
        return gbUtil.verifyLogo(rom.preview);
    }

    /** @param {Rom} rom */
    hasExternalHeader(rom) {
        // not supported for this platform.
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
                return Promise.all([header, super.getExtendedData(rom)])
            })
            .then(([header, data]) => {
                if (header) {
                    data.addRom("ROM checksum", HexValue.justHex(header.romChecksum, 4));
                    data.addRom("Checksum valid", header.romChecksumValid);
            
                    data.addHeader("Logo present", header.validGbLogo);
                    data.addHeader("Header checksum", HexValue.justHex(header.headerChecksum, 2));
                    data.addHeader("Header checksum valid", header.headerChecksumValid);
                    data.addHeader("ROM checksum", HexValue.justHex(header.romChecksum,4));
                    data.addHeader("ROM checksum valid", header.romChecksumValid);
                    data.addHeader("Title", header.title);
                    data.addHeader("Manufacturer", header.manufacturer);
                    data.addHeader("Gameboy Color support", header.cgbSupport);
                    data.addHeader("Super Gameboy support", header.supportsSgb);
                    data.addHeader("Cart type", header.cartType);
            
                    data.addHeader("ROM size", header.romSize);
                    data.addHeader("RAM size", header.ramSize);
            
                    data.addHeader("Mask ROM version", header.romVersion);
            
            
                    data.addHeader("Licensee code", HexValue.hex(header.licensee, 2));
                    data.addHeader("Licensee code (extended)", header.lincenseeEx);  
                }

                return data;
            });
    }

    /** @param {Rom} rom */
    getFormatName (rom) {
        return "Gameboy ROM image";
    }

    _decodeHeader(rom) {
        return Promise.resolve(new GbHeader(rom.preview));
    }
}

export default GbPlatform;