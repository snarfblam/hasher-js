/*  
    Provides functions that perform both syncronous and asyncronous hashing.
    Currently the async functions do not implement any kind of explicit
    background worker or CPU-yielding mechanism.
 */

// @ts-check
import { Hasher } from './Hasher';
import crc16 from './crc16';
import crc32 from './crc32';
import jsSha1 from 'js-sha1';
import jsMd5 from 'js-md5';

/** The chunk size used */
const chunkSize = 0x4000;

/**
 * 
 * @param {Hasher} algo An object that implements the appropriate digesting interface (create() method which produces an object with update() and hex() methods)
 * @param {Blob | Uint8Array} buffer 
 * @param {number} offset 
 * @param {number} length 
 * @returns {Promise<string>}
 */
function hashAsync(algo, buffer, offset, length) {
    var end = offset + length;
    var hasher = algo.create(); // crypto.createHash('sha1');
    return new Promise((resolve, reject) => {

        // Convert byte array to a blob
        if (buffer instanceof Uint8Array) {
            var subBuffer = buffer;

            if (offset != 0 || length != buffer.length) {
                if (buffer.subarray) {
                    subBuffer = buffer.subarray(offset, end);
                } else {
                    subBuffer = buffer.slice(offset, end);
                }
            }

            buffer = new Blob([subBuffer]);
        }

        // if (buffer instanceof Uint8Array) {
        //     var subBuffer = buffer;

        //     if (offset != 0 || length != buffer.length) {
        //         if (buffer.subarray) {
        //             subBuffer = buffer.subarray(offset, end);
        //         } else {
        //             subBuffer = buffer.slice(offset, end);
        //         }
        //     }

        //     hasher.update(subBuffer);
        //     resolve(hasher.hex());
        // } else
        if (buffer instanceof Blob) {
            end = Math.min(end, buffer.size);

            var blob = buffer;
            var reader = new FileReader();
            var currentOffset = offset;
            var readNextChunk = () => {
                if (currentOffset < end) {
                    // don't include anything beyond end of blob in length
                    var currentEnd = Math.min(currentOffset + chunkSize, end);
                    reader.readAsArrayBuffer(blob.slice(currentOffset, currentEnd));
                    currentOffset += chunkSize;
                } else {
                    // We've finished processing the file
                    resolve(hasher.hex());
                }
            };
            var dataReady = () => {
                var data = new Uint8Array(reader.result);
                hasher.update(data);

                readNextChunk();
            };

            reader.onload = dataReady;
            reader.onerror = () => { reject(reader.error || Error("Unknown error reading a file")) };

            // start it off
            readNextChunk();
        } else {
            reject(Error('unknown input type'));
        }
    });
}

/**
 * Promise. Resolves to a hex string containing the MD5 digest of the buffer.
 * @param {Uint8Array} buffer 
 * @param {number} offset 
 * @param {number} length 
 * @returns {Promise<string>}
 */
function md5Async(buffer, offset, length) {
    return hashAsync(jsMd5, buffer, offset, length);
}


/**
 * Promise. Resolves to a hex string containing the SHA-1 digest of the buffer.
 * @param {Uint8Array} buffer 
 * @param {number} offset 
 * @param {number} length 
 * @returns {Promise<string>}
 */
function sha1Async(buffer, offset, length) {
    // For some reason, jsSha1.create is not showing up in the type definition... but it's definitely there
    // @ts-ignore
    return hashAsync(jsSha1, buffer, offset, length);
}

/**
 * Promise. Resolves to a hex string containing the CRC16 digest of the buffer.
 * @param {Uint8Array} buffer 
 * @param {number} offset 
 * @param {number} length 
 * @returns {Promise<string>}
 */
function crc16Async(buffer, offset, length) {
    return hashAsync(crc16, buffer, offset, length);
}

/**
 * Promise. Resolves to a hex string containing the CRC32 digest of the buffer.
 * @param {Uint8Array} buffer 
 * @param {number} offset 
 * @param {number} length 
 * @returns {Promise<string>}
 */
function crc32Async(buffer, offset, length) {
    return hashAsync(crc32, buffer, offset, length);
}
export { jsSha1 as sha1, crc16, sha1Async, crc16Async, md5Async, crc32Async };