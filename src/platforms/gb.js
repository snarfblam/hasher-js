// @ts-check

/**
 * Object containing NES-specific data and functions
 */

import { toHex } from '../util';
import RomRegion from '../RomRegion';
import gbUtil from '../romUtils/gbUtil';
import GbHeader from '../romUtils/GbHeader';
import common from './common';
const category = common.romDataCategory;
import Platform from './Platform';
import Rom from '../Rom';

function yesNo(bool) {
    return bool ? "yes" : "no";
}

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
        var result = [];
        
        var addHeader = (label, value) => result.push({ category: category.Header, label: label, value: value })
        var addRom = (label, value) => result.push({ category: category.ROM, label: label, value: value })
        
        // try {
        //     var gbHeader = new GbHeader(rom);
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
                    addRom("ROM checksum", toHex(header.romChecksum, 4));
                    addRom("Checksum valid", yesNo(header.romChecksumValid));
            
                    addHeader("Logo present", yesNo(header.validGbLogo));
                    addHeader("Header checksum", toHex(header.headerChecksum, 2));
                    addHeader("Header checksum valid", yesNo(header.headerChecksumValid));
                    addHeader("ROM checksum", toHex(header.romChecksum,4));
                    addHeader("ROM checksum valid", yesNo(header.romChecksumValid));
                    addHeader("Title", header.title);
                    addHeader("Manufacturer", header.manufacturer);
                    addHeader("Gameboy Color support", header.cgbSupport);
                    addHeader("Super Gameboy support", yesNo(header.supportsSgb));
                    addHeader("Cart type", header.cartType);
            
                    addHeader("ROM size", header.romSize);
                    addHeader("RAM size", header.ramSize);
            
                    addHeader("Mask ROM version", header.romVersion);
            
            
                    addHeader("Licensee code", "$" + toHex(header.licensee, 2));
                    addHeader("Licensee code (extended)", header.lincenseeEx);  
                }

                return result;
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