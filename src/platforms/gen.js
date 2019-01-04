// @ts-check

/**
 * Object containing Genesis-specific data and functions
 */

import Rom from '../Rom';
import Platform from './Platform';
import RomRegion from '../RomRegion';
import genUtil from '../romUtils/genUtil';
import {toHex, HexValue} from '../util'
import GenHeader from '../romUtils/GenHeader';
const category = Platform.exDataCategories;

class GenPlatform extends Platform {
    constructor() {
        super('GEN', 'Genesis', ['bin', 'gen', 'smd', 'md']);
    }

    /** @param {Rom} rom */
    isPlatformMatch (rom) {
        return genUtil.getRomInfo(rom.preview).internalHeader;
    }

    /** @param {Rom} rom */
    hasExternalHeader (rom) {
        return genUtil.getRomInfo(rom.preview).externalHeader;
    }

    /** @param {Rom} rom */
    getHashRegions(rom) {
        // var binRom = genUtil.getBinFormat(romImage);
        return this.getBinFormat(rom)
            .then(binRom => {
                var fileRegion = new RomRegion('file', rom, 0,rom.size );
                var romRegion = new RomRegion('rom', binRom, 0, binRom.size);
        
                return [fileRegion, romRegion];
            });
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
                    data.addHeader("Title", header.gameName);
                    data.addHeader("Alt Title", header.altName);
                    data.addHeader("Platform", header.platform);
                    data.addHeader("Region", header.region);
                    data.addHeader("Copyright", header.copyrightFormatted);
                    data.addHeader("Product ID", header.productID);
                    data.addHeader("Checksum",  HexValue.justHex(header.checksum, 4));
                    data.addHeader("IO Devices", header.ioSupportFormatted);
                    data.addHeader("Memo", header.memo);
                    data.addHeader("Modem", header.modem);
            
                    var romStart = toHex(header.romStart, 8);
                    var romEnd = toHex(header.romEnd, 8);
                    var ramStart = toHex(header.ramStart, 8);
                    var ramEnd = toHex(header.ramEnd, 8);
            
                    data.addHeader("ROM range", romStart + "-" + romEnd);
                    data.addHeader("RAM range", ramStart + "-" + ramEnd);
                }
                return data;
            });
        
    }

    /** @param {Rom} rom */
    getFormatName(rom) {
        var { externalHeader, interleaved } = genUtil.getRomInfo(rom.preview);

        if (interleaved) {
            return externalHeader ? "SMD (headered)" : "SMD (no header)";
        } else {
            return externalHeader ? "BIN (headered)" : "Genesis ROM image (BIN)";
        }
    }

    /** @param {Rom} rom */
    _convertToBin(rom) {
        return genUtil.convertRomToBin(rom)
            .then(result => {
                return result;
            });
    }

    _decodeHeader(rom) {
        return this.getBinFormat(rom)
            .then(binRom => {
                return binRom.getBytes(0, 0x1000);
            })
            .then(binRomData => {
                return new GenHeader(binRomData);
            })
    }
}

export default GenPlatform;