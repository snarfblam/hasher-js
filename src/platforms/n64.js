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
        // return IsByteswapped(rom.preview) !== null;
        return getRomLayout(rom) != null;
    }

    /** @param {Rom} rom */
    getExtendedData(rom) {
        // var byteSwapped = IsByteswapped(rom.preview);
        
        // var byteSwappedText;
        // if (byteSwapped === true) byteSwappedText = "Yes";
        // if (byteSwapped === false) byteSwappedText = "No";
        // if (byteSwapped === null) byteSwappedText = "Unknown";

        // return super.getExtendedData(rom)
        //     .then(data => {
        //         data.addRom("Byte swapped", byteSwappedText);
        //         return data;
        //      });
        return super.getExtendedData(rom);
    }

    getFormatName(rom) {
        // var byteSwapped = IsByteswapped(rom.preview);
        // if (byteSwapped === true) return "N64 ROM image";
        // if (byteSwapped === false) return "N64 ROM image (byte-swapped)";
        // if (byteSwapped === null) return "N64 ROM image (byte-swapping unknown)";
        var layout = getRomLayout(rom);
        if (layout) {
            return romFormatNames[layout];
        } else {
            return "N64 ROM image (layout unknown)";
        }
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
        var layout = getRomLayout(rom);
        if (layout === romLayout.bigEndian) return Promise.resolve(rom);

        /** @type {function(Uint8Array, Uint8Array): void} */
        var chunkConverter;

        if (layout === romLayout.byteSwapped) chunkConverter = chunkToBin_byteswapped;
        if (layout === romLayout.wordSwapped) chunkConverter = chunkToBin_wordswapped;
        if (layout === romLayout.littleEndian) chunkConverter = chunkToBin_littleEndian;
        // if (IsByteswapped(rom.preview) !== true) return Promise.resolve(rom);

        var blobParts = [];

        return new Promise((resolve, reject) => {
            var doChunk = (/** @type {Uint8Array} */bytes) => {
                // // Byte-swap in place
                // var len = bytes.length - 1; // accounting for odd number of bytes
                // for (var i = 0; i < len; i+= 2) {
                //     var swap = bytes[i + 1];
                //     bytes[i + 1] = bytes[i];
                //     bytes[i] = swap;
                // }
                chunkConverter(bytes, bytes);

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

/** First four bytes of a normal (big-endian) N64 ROM */
const n64Identifier = [0x80, 0x37, 0x12, 0x40];

/** First four bytes of a byte-swapped N64 ROM */
const n64Identifier_Byteswapped = [0x37, 0x80, 0x40, 0x12];

/** First four bytes of a word-swapped N64 ROM */
const n64Identifier_Wordswapped = [0x12, 0x40, 0x80, 0x37];

/** First four bytes of a little-endian  N64 ROM */
const n64Identifier_LittleEndian = [0x40, 0x12, 0x37, 0x80];

/** Enum listing known ROM layouts */
var romLayout = {
    "bigEndian": "bigEndian",
    "littleEndian": "littleEndian",
    "byteSwapped": "byteSwapped",
    "wordSwapped": "wordSwapped",
};


/** Key/value pairs mapping known ROM layouts to display-friendly format names */
var romFormatNames = {
    "bigEndian": "N64 ROM (big-endian)",
    "littleEndian": "N64 ROM (little-endian)",
    "byteSwapped": "N64 ROM (byte-swapped)",
    "wordSwapped": "N64 ROM (word-swapped)",
}

/**
 * Converts a chunk of byte-swapped ROM to big-endian ROM. Data
 * must be 64-bit aligned. Input and output arrays can be the same
 * array. Output array must have adequate memory allocated.
 * @param {Uint8Array} bytesIn 
 * @param {Uint8Array} bytesOut
 */
function chunkToBin_byteswapped(bytesIn, bytesOut) {
    // Byte-swap in place
    var len = bytesIn.length - 1; // accounting for odd number of bytes
    for (var i = 0; i < len; i+= 2) {
        var swap = bytesIn[i + 1];
        bytesOut[i + 1] = bytesIn[i];
        bytesOut[i] = swap;
    }
}


/**
 * Converts a chunk of word-swapped ROM to big-endian ROM. Data
 * must be 64-bit aligned. Input and output arrays can be the same
 * array. Output array must have adequate memory allocated.
 * @param {Uint8Array} bytesIn 
 * @param {Uint8Array} bytesOut
 */
function chunkToBin_wordswapped(bytesIn, bytesOut) {
    // Byte-swap in place
    var len = bytesIn.length - 3; // accounting for odd number of bytes
    for (var i = 0; i < len; i+= 4) {
        var swap = bytesIn[i + 2];
        bytesOut[i + 2] = bytesIn[i];
        bytesOut[i] = swap;

        swap = bytesIn[i + 3];
        bytesOut[i + 3] = bytesIn[i + 1];
        bytesOut[i + 1] = swap;
    }
}

/**
 * Converts a chunk of little-endian ROM to big-endian ROM. Data
 * must be 64-bit aligned. Input and output arrays can be the same
 * array. Output array must have adequate memory allocated.
 * @param {Uint8Array} bytesIn 
 * @param {Uint8Array} bytesOut
 */
function chunkToBin_littleEndian(bytesIn, bytesOut) {
    // Byte-swap in place
    var len = bytesIn.length - 3; // accounting for odd number of bytes
    for (var i = 0; i < len; i+= 4) {
        var swap = bytesIn[i + 3];
        bytesOut[i + 3] = bytesIn[i];
        bytesOut[i] = swap;

        swap = bytesIn[i + 2];
        bytesOut[i + 2] = bytesIn[i + 1];
        bytesOut[i + 1] = swap;
    }
}
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

/**
 *  Returns a string value representing the ROM layout, or null if layout can't be determined.
 *  See romLayout.
 *  @param {Rom} rom 
 */
function getRomLayout(rom) {
    var data = rom.preview;

    if (equalsAt(data, n64Identifier, 0)) return romLayout.bigEndian;
    if (equalsAt(data, n64Identifier_Byteswapped, 0)) return romLayout.byteSwapped;
    if (equalsAt(data, n64Identifier_Wordswapped, 0)) return romLayout.wordSwapped;
    if (equalsAt(data, n64Identifier_LittleEndian, 0)) return romLayout.n64Identifier_LittleEndian;
    return null;
}

/**
 * 
 * @param {ArrayLike<number>} data 
 * @param {ArrayLike<number>} comparison 
 * @param {number} dataOffset 
 */
function equalsAt(data, comparison, dataOffset) {
    if (data.length < dataOffset + comparison.length) return false;

    for (var i = 0; i < comparison.length; i++) {
        if (data[i + dataOffset] != comparison[i]) return false;
    }

    return true;
}