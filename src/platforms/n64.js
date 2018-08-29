// @ts-check

import Platform from './Platform';
import Rom from '../Rom';
import RomRegion from '../RomRegion';
const category = Platform.exDataCategories;

class N64Platform extends Platform {
    constructor() {
        super("N64", "Nintendo 64", ['n64', 'z64', 'v64']);
    }

    /** @param {Rom} rom */
    isPlatformMatch(rom) {
        return IsByteswapped(rom.preview) !== null;
    }

    /** @param {Rom} rom */
    getExtendedData(rom) {
        var byteSwapped = IsByteswapped(rom.preview);
        
        var byteSwappedText;
        if (byteSwapped === true) byteSwappedText = "yes";
        if (byteSwapped === false) byteSwappedText = "no";
        if (byteSwapped === null) byteSwappedText = "unknown";

        return super.getExtendedData(rom)
            .then(data => {
                data.addRom("Byte swapped", byteSwappedText);
                return data;
             });
    }

    getFormatName(rom) {
        var byteSwapped = IsByteswapped(rom.preview);
        if (byteSwapped === true) return "N64 ROM image";
        if (byteSwapped === false) return "N64 ROM image (byte-swapped)";
        if (byteSwapped === null) return "N64 ROM image (byte-swapping unknown)";
    }

    getHashRegions(rom) {
        return this.getBinFormat(rom).then(binRom => {
            return [
                new RomRegion('file', rom, 0, rom.size),
                new RomRegion('rom', binRom, 0, binRom.size)
            ];
        });
    }

    /** @param {Rom} rom 
    */
    _convertToBin(rom) {
        if (IsByteswapped(rom.preview) !== true) return Promise.resolve(rom);

        var blobParts = [];

        return new Promise((resolve, reject) => {
            var doChunk = (/** @type {Uint8Array} */bytes) => {
                // Byte-swap in place
                var len = bytes.length - 1; // accounting for odd number of bytes
                for (var i = 0; i < len; i+= 2) {
                    var swap = bytes[i + 1];
                    bytes[i + 1] = bytes[i];
                    bytes[i] = swap;
                }

                blobParts.push(new Blob([bytes]));
            };

            var done = () => {
                resolve(new Blob(blobParts));
            }

            try{
                rom.streamData(doChunk, 0, 0x1000, null, true, done);
            } catch (err) {
                reject(err);
            }

        });
    }
}

export default N64Platform;

////////////////////////////////////////////////////////////////////////

/** First four bytes of a normal N64 ROM */
const n64Identifier = [0x80, 0x37, 0x12, 0x40];

/** First four bytes of a byte-swapped N64 ROM */
const n64Identifier_Byteswapped = [0x37, 0x80, 0x40, 0x12];

/**
 * Returns a boolean indicating whether the ROM is byteswapped, or null
 * if the ROM can not be determined to be an N64 ROM.
 * @param {Uint8Array} rom 
 * @returns {boolean} A boolean or null.
 */
function IsByteswapped(rom) {
    if (rom.length < 4) return null;

    var match = true;
    for (var i = 0; i < n64Identifier.length; i++) {
        if (n64Identifier[i] !== rom[i]) match = false;
    }

    if (match) return false;

    var match = true;
    for (var i = 0; i < n64Identifier_Byteswapped.length; i++) {
        if (n64Identifier_Byteswapped[i] !== rom[i]) match = false;
    }

    if (match) return true;

    return null;
}