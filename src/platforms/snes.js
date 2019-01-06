// @ts-check

import snesUtil from '../romUtils/snesUtil';
import { toHex, HexValue } from '../util';
import SnesHeader from '../romUtils/SnesHeader';
import RomRegion from '../RomRegion';
import Platform from './Platform';
const category = Platform.exDataCategories;
import Rom from '../Rom';

const maxRomBufferSize = 8200000; // bytes

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
                var mapping = { hirom: "HiROM", lorom: "LoROM" }[header.mapping] || header.mapping;
        
                    
                data.addRom("Mapping", mapping);
                data.addRom("Calculated checksum", HexValue.justHex(checksum, 4));

                if (header.valid) {
                    data.addHeader("Header offset", HexValue.hex(header.internalHeaderOffset));
                    data.addHeader("Checksum", HexValue.justHex(header.checksum, 4));
                    data.addHeader("Checksum complement", HexValue.justHex(header.checksumComplement, 2));
                    data.addRom("Checksum valid", (checksum === header.checksum) ? "Yes": "No" );
                }

                
                return data;
            });
    }

    /** @param {Rom} rom */
    getFormatName (rom) {
        if (snesUtil.hasGoodSmcHeader(rom.preview)) return "Super Magic Com";
        if (snesUtil.hasGoodSwcHeader(rom.preview)) return "Super Wild Card";
        if (this.hasExternalHeader(rom)) return "SNES ROM image (headered)";
        return "SNES ROM image";
    }

    /** @param {Rom} rom */
    _decodeHeader(rom) {
        return Promise.resolve( new SnesHeader(rom.preview, this.hasExternalHeader(rom)));
    }
}

export default SnesPlatform;