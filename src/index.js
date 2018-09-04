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
     *  @param {function(number):void} [progressCallback]
     */
    getRomData(progressCallback) {
        if (this._rom == null) throw Error('Can not make multiple calls to getRomData');

        /** @type {Promise<any> & {[x: string]: any}} */
        var promise = RomData.getData(this._rom, progressCallback);
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

// 'export default Hasher' produces an object {_deafult: Hasher}... not what we want
module.exports = Hasher;