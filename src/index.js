// const fs = require('fs');
import platform from './platform';
import RomData from './RomData';
// import {sha1} from './hasher';
import getDB from './romDb';
import Buffer from './Buffer';

// Create Buffer type for browsers (essentially a Uint8Array)
// Needed by sha1 library
if (typeof window !== 'undefined') {
    window.Buffer = Buffer;
}


function doHash(buffer) {
    var romData = new RomData(buffer);
    var regions = romData.hashRegions.map(reg => ({
        name: reg.name,
        data: buffer.slice(reg.start, reg.start + reg.length),
    }));

    romData.hashes.forEach(hash => {
        console.log(hash.name.replace('_', '/'), hash.value);
    });

    var ass = platform.getAssociatedPlatform(buffer);
    console.log(ass.method, ass.platform.name);

    getDB(romData.platform.name).then(db => {
        return db.getTitle(romData.hashes.find(hash => hash.name == 'rom_sha1').value);
    }).then(title => console.log(title));
}

/**
 * Accepts a File object and returns a promise that resolves to a Uint8Array
 * @param {File | Blob} file 
 */
function getFileBytes(file) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function () {
            resolve(this.result);
        };
        reader.onerror = function (er) {
            reject();
        };
        reader.readAsArrayBuffer(file);
    }).then(buffer => {
        return new Buffer(buffer);
    });
}


// export default doHash;
export { doHash, getFileBytes };
