// @ts-check

/**
 * Object containing NES-specific data and functions
 */

import snesUtil from '../romUtils/snesUtil';
import util from '../romUtils/util';
import SnesHeader from '../romUtils/SnesHeader';
import RomRegion from '../RomRegion';
import common from './common';
const category = common.romDataCategory;
import Platform from './Platform';
import Rom from '../Rom';

const maxRomBufferSize = 4200000; // bytes

class SnesPlatform extends Platform {
    constructor() {
        super('SNES', 'Super Nintendo Entertainment System', ['smc', 'sfc', 'swc', 'fig']);
    }

    /** @param {Rom} rom */
    isPlatformMatch (rom) {
        if (rom.size < 0x2000) return false;

        var header = new SnesHeader(rom.preview, this.hasExternalHeader(rom));
        // I've sacrificed a full checksum verification here because we can't stream
        // the file syncronously in JS and this method must be syncronous.
        // It wouldn't be terribly unreasonable to increase the ROM 'preview' size
        // to a large enough size that we would have immediate access to 99% of ROMs.
        var checksumChecksOut = 0xFFFF === (header.checksum ^ header.checksumComplement);

        if (checksumChecksOut) return true;
        if (snesUtil.hasGoodSmcHeader(rom.preview)) return true;
        if (snesUtil.hasGoodSwcHeader(rom.preview)) return true;
        
        return false;
    }

    /** @param {Rom} rom */
    hasExternalHeader (rom) {
        // Check for iNES header tag ('NES\u001a')
        return snesUtil.hasExternalHeader(rom.size);
    }

    /** @param {Rom} rom */
    getHashRegions(rom) {
        var fileRegion = new RomRegion('file', rom.file, 0, rom.size);
        var romRegion;

        if (this.hasExternalHeader(rom)) {
            romRegion = new RomRegion('rom', rom.file, snesUtil.externalHeaderSize, rom.size - snesUtil.externalHeaderSize);
        } else {
            romRegion = new RomRegion('rom', rom.file, 0, rom.size);
        }

        return [fileRegion, romRegion];
    }

    /** @param {Rom} rom */
    getExtendedData(rom) {
        var result = [];
        
        var addHeader = (label, value) => result.push({category: category.Header, label: label, value: value });
        var addRom = (label, value) => result.push({category: category.ROM, label: label, value: value });

        /** @type {Promise<SnesHeader>} */
        var headerPromise = this.getHeader(rom);
        var bytesPromise;
        if (rom.size < rom.preview.length || rom.size > maxRomBufferSize) {
            bytesPromise = rom.preview;
        } else {
            bytesPromise = rom.getBytes(0, rom.size);
        }

        return Promise.all([headerPromise, bytesPromise])
            .then(([header, romImage]) => {
                var checksum = snesUtil.calculateChecksum(romImage);
        
                addRom("Actual checksum", util.toHex(checksum, 4));
                addRom("Mapping", header.mapping);
                    
                if (header.valid) {
                    addHeader("Header offset", header.internalHeaderOffset);
                    addHeader("Checksum", util.toHex(header.checksum, 2));
                    addHeader("Checksum complement", util.toHex(header.checksumComplement, 2));
                }
                
                return result;
            });
    }

    /** @param {Rom} rom */
    getFormatName (rom) {
        if (snesUtil.hasGoodSmcHeader(rom.preview)) return "Super Magic Com ROM";
        if (snesUtil.hasGoodSwcHeader(rom.preview)) return "Super Wild Card ROM";
        if (snesUtil.hasExternalHeader(rom)) return "SNES ROM image (headered)";
        return "SNES ROM image";
    }

    /** @param {Rom} rom */
    _decodeHeader(rom) {
        return Promise.resolve( new SnesHeader(rom.preview, this.hasExternalHeader(rom)));
    }
}

// module.exports = snesPlatform;
export default SnesPlatform;
export {SnesPlatform}