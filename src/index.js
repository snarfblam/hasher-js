// const fs = require('fs');
import platform from './platform';
import RomData from './RomData';
// import {sha1} from './hasher';
import getDB from './romDb';

// const filePath = process.argv[2] || 'd:\\emu\\nes\\metroid (u) [!].nes';
// // console.log(filePath);
// {
//     fs.readFile(filePath, (err, buffer) => {

//         if (err) {
//             console.error(err);
//         } else {
//             var romData = new RomData(buffer);
//             var regions = romData.hashRegions.map(reg => ({
//                 name: reg.name,
//                 data: buffer.slice(reg.start, reg.start + reg.length),
//             }));

//             // regions.forEach(reg => {
//             //     var x = data;
//             //     console.log(reg.name, sha1(reg.data));
//             // })
//             romData.hashes.forEach(hash => {
//                 console.log(hash.name.replace('_', '/'), hash.value);
//             });

//             var ass = platform.getAssociatedPlatform(buffer);
//             console.log(ass.method, ass.platform.name);

//             getDB(romData.platform.name).then(db => {
//                 return db.getTitle(romData.hashes.find(hash => hash.name == 'rom_sha1').value);
//             }).then(title => console.log(title));
//         }
//     });
// }

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
 * Accepts a File object and returns a promise that resolves to 
 * @param {File | Blob} file 
 */
function fileToBuffer(file) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function () {
            resolve(this.result);
        };
        reader.onerror = function (er) {
            reject();
        };
        reader.readAsArrayBuffer(file);
    });
}

// export default doHash;
export { doHash };
