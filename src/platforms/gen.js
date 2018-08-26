// @ts-check

/**
 * Object containing Genesis-specific data and functions
 */

import Rom from '../Rom';
import Platform from './Platform';
import RomRegion from '../RomRegion';
import common from './common';
import genUtil from '../romUtils/genUtil';
import {toHex} from '../util'
import GenHeader from '../romUtils/GenHeader';
const category = common.romDataCategory;

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
        // try {
        //     var header = new GenHeader(rom.preview);
        // }
        // catch (err) {
        //     console.warn(err);
        //     return Promise.resolve([]);
        // }

        return this.getHeader(rom)
            .catch(err => {
                console.warn(err);
                return null;
            }).then(header => {
                var result = [];
                if (header) {
                    var addHeader = (label, value) => result.push({ category: category.Header, label: label, value: value })
                    var addRom = (label, value) => result.push({ category: category.ROM, label: label, value: value })
            
                    addHeader("Title", header.gameName);
                    addHeader("Alt Title", header.altName);
                    addHeader("Platform", header.platform);
                    addHeader("Region", header.region);
                    addHeader("Copyright", header.copyrightFormatted);
                    addHeader("Product ID", header.productID);
                    addHeader("Checksum", toHex(header.checksum, 4));
                    addHeader("IO Devices", header.ioSupportFormatted);
                    addHeader("Memo", header.memo);
                    addHeader("Modem", header.modem);
            
                    var romStart = toHex(header.romStart, 8);
                    var romEnd = toHex(header.romEnd, 8);
                    var ramStart = toHex(header.ramStart, 8);
                    var ramEnd = toHex(header.ramEnd, 8);
            
                    addHeader("ROM range", romStart + "-" + romEnd);
                    addHeader("RAM range", ramStart + "-" + ramEnd);
                }
                return result;
            });
        
    }

    /** @param {Rom} rom */
    getFormatName(rom) {
        var { externalHeader, interleaved } = genUtil.getRomInfo(rom.preview);

        if (interleaved) {
            return externalHeader ? "SMD (headered)" : "SMD (no header)";
        } else {
            return externalHeader ? "BIN (headered)" : "BIN";
        }
    }

    /** @param {Rom} rom */
    _convertToBin(rom) {
        return genUtil.convertRomToBin(rom)
            .then(result => {
                console.log('size: ', result.size);
                return result;
            });
    }

    _decodeHeader(rom) {
        return new GenHeader(rom.preview);
    }
}

export default GenPlatform;