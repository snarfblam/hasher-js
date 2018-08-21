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

export { readBytesFromBlob, getFileExtension };