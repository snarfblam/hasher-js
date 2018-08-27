// @ts-check

/**
 * Object containing NES-specific data and functions
 */

import snesUtil from '../romUtils/snesUtil';
import { toHex } from '../util';
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

        return Promise.resolve([fileRegion, romRegion]);
    }

    /** @param {Rom} rom */
    getExtendedData(rom) {
        var bytesPromise;
        if (rom.size < rom.preview.length || rom.size > maxRomBufferSize) {
            bytesPromise = rom.preview;
        } else {
            bytesPromise = rom.getBytes(0, rom.size);
        }

        return Promise.all([this.getHeader(rom), bytesPromise, super.getExtendedData(rom)])
            .then(([header, romImage, data]) => {
                var checksum = snesUtil.calculateChecksum(romImage);
        
                data.addRom("Actual checksum", toHex(checksum, 4));
                data.addRom("Mapping", header.mapping);
                    
                if (header.valid) {
                    data.addHeader("Header offset", header.internalHeaderOffset);
                    data.addHeader("Checksum", toHex(header.checksum, 2));
                    data.addHeader("Checksum complement", toHex(header.checksumComplement, 2));
                }
                
                return data;
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

export default SnesPlatform;