/*
 *  hasher public interface
 *  
 *  Usage:
 *      // Display object with hashes, db match, etc.
 *      hasher.getRomData(someFileInput.files[0])
 *          .then(data => console.log(data));
 * 
 *      // Convenience method to get binary data from a File object
 *      hasher.getFileBytes(someFileInput.files[0])
 *          .then(buffer => console.log(buffer));
 * 
 *  Webpack:
 *      In the root directory, run the command `npm run build`.
 *      This runs webpack, and copies the bundle and the ROM
 *      database to the server folder.
 * 
 *  Test Server:
 *      Build the project as described above first. From the
 *      "server" directory, run the command `node index.js`.
 *      You can the access the test page at 
 *      http://localhost:8000/
 */

//@ts-check
"use strict";

import RomData from './RomData';
import Rom from './Rom';
import { HexValue } from './util';

/** Creates an object that can produce metadata for a ROM file
 *  @param {File} romFile File to process. A blob can be processed provided 
 *                that it has a name property containing a string
 */
class Hasher {
    constructor(romFile) {
        this._rom = new Rom(romFile);
        this._cancel = null;
    }

    /** Begins processing the ROM. Returns a promise that resolves to a
     *  @param {string[]} [algos] An array of hashing algorithms to use, from: 'sha1', 'md5', 'crc32'
     *  @param {function(number):void} [progressCallback]
     */
    getRomData(algos, progressCallback) {
        if (this._rom == null) throw Error('Can not make multiple calls to getRomData');

        // RomData class expects requested algoithms to take the form content_algorithm
        var algoList = null;
        if (algos) {
            // Apply the specified algorightms to both the file and the ROM
            var fileAlgos = algos.map(algo => 'file_' + algo);
            var romAlgos = algos.map(algo => 'rom_' + algo);
            algoList = fileAlgos.concat(romAlgos);
        }

        /** @type {Promise<any> & {[x: string]: any}} */
        var promise = RomData.getData(this._rom, algoList, progressCallback);
        this._cancel = promise.cancel;

        // Let things be collected
        this._rom = null;
        promise.then(() => this._cancel = null);

        return promise;
    }

    cancel() {
        if (this._cancel) this._cancel();
        this._cancel = null;
    }
}

/**
 * Returns a number formatted as hex with a style consistent with Hasher-js's output.
 * @param {number} value - Value to format
 * @param {number} [minLength] - Minimum number of digits to use. Values will be zero-padded if necessary.
 * @param {boolean} [prefixed] - If true, a hexidecimal prefix such as a dollar sign will be prepended
 */
Hasher.FormatHex = function (value, minLength, prefixed) { 
    if (prefixed) {
        return HexValue.hex(value, minLength || 0).toString();
    } else {
        return HexValue.justHex(value, minLength || 0).toString();
    }
}


/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
function detectIE() {
    var ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return null;
}

var isIE = !!detectIE(); // true if it's IE
// @ts-ignore
window.poopMode = isIE;

// 'export default Hasher' produces an object {_deafult: Hasher}... not what we want
module.exports = Hasher;