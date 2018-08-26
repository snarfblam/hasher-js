import { resolve } from "path";

/**
 * Reads bytes from a blob into a Uint8Array
 * @param {Blob} blob 
 * @param {number} [offset] 
 * @param {number} [length]
 * @returns {Promise<Uint8Array>}
 */
function readBytesFromBlob(blob, offset, length) {
    return new Promise((resolve, reject) => {
        if (length == null) length = blob.size;
        if (offset == null) offset = 0;
        var actualBlob = blob;
        
        var reader = new FileReader();
        if (offset != 0 || length != blob.size) {
            var actualLength = Math.min(blob.size - offset, length - offset);
            actualBlob = blob.slice(offset, offset + actualLength);
        }

        reader.onload = function () {
            resolve(new Uint8Array(reader.result)); 
        };
        reader.onerror = function () {
            reject(reader.error || Error("Unknown error"));
        }

        reader.readAsArrayBuffer(actualBlob);
    });

}

/**
 * Gets the file extension for the given filename
 * @param {string} filename 
 */
function getFileExtension(filename) {
    if (!filename) filename = '';

    var index = filename.lastIndexOf('.');
    if (index >= 0) {
        return filename.substr(index + 1);
    } else {
        return '';
    }
}

/**
 * Parses ASCII-encoded text from a ROM image. Character values above 0x7F are undefined.
 * @param {Uint8Array} rom 
 * @param {number} offset 
 * @param {number} length 
 * @param {boolean} [ignoreTerminator] - If true, the returned string will not be truncated at the first null terminator character
 * @returns {string}
 */
function parseAscii(rom, offset, length, ignoreTerminator) {
    // Create a view into the rom
    var buffer = rom.buffer;
    var start = Math.min(rom.byteOffset + offset, buffer.byteLength); // no further than end of buffer
    var len = Math.min(buffer.byteLength - start, length); // no longer than to end of buffer 
    
    var view = new Uint8Array(buffer, start, len);

    // Use this view as an array of character codes
    var result = String.fromCharCode.apply(null, view);

    // Truncate the string at the first null terminator, if applicable
    if (!ignoreTerminator) {
        var indexOfNull = result.indexOf("\x00");
        if (indexOfNull >= 0) return result.substr(0, indexOfNull);
    }

    return result;
}

/**
 * Converts an integer value to a hex string
 * @param {number} value
 * @param {number} digits
 * @returns {string}
 */
function toHex (value, digits) {
    var result = value.toString(16);
    while (result.length < digits) result = "0" + result;
    return result;
}

export { readBytesFromBlob, getFileExtension, toHex, parseAscii};