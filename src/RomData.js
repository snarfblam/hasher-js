/*
 *  RomData
 * 
 *  Retrieves all available information about a ROM
 */

import RomRegion from './RomRegion';
import platform from './platform';
import * as hasher from './hash';
import romDb from './romDb';
import RomHasher from './RomHasher';
import Rom from './Rom';

/**
 * @constructor
 * @param {Rom} rom ROM image to examine
 * @param {string[]} hashAlgos A string specifying the hash in the form 'content_algorithm',
 * @param {function(number):void} [progressCallback]
 * where content matches a portion of the ROM identified by Platform.getHashRegions and
 * the algorithm matches the name of a supported hash function in the Hasher module.
 */
function RomData(rom, hashAlgos, progressCallback) {
    hashAlgos = hashAlgos || ['file_sha1', 'rom_sha1', 'file_md5', 'rom_md5', 'file_crc32', 'rom_crc32'];
    var ext = rom.fileExtension; //getExtension(filename);
    var plat = platform.getAssociatedPlatform(rom, ext);

    this.platformIdent = plat.method;
    this.platform = plat.platform;
    console.log(plat);
    this.hasExternalHeader = plat.platform.hasExternalHeader(rom);
    this.dbInfo = { name: 'not found', version: 'not found' };
    this.dbMatch = 'not found';
    this.format = plat.platform.getFormatName(rom);


    var extendedDataPromise = plat.platform.getExtendedData(rom)
        .then(extendedData => {
            this.extendedData = extendedData.getData();
        });
    
    var hashPromise = plat.platform.getHashRegions(rom)
        .then(hashRegions => {
            this.hashRegions = hashRegions;
            var hasher = new RomHasher(rom, this.hashRegions, hashAlgos, progressCallback);
            return hasher.performHashes();
        })
        .then(hashlist => {
            this.hashes = hashlist;
        });
    
    // this.hashRegions = plat.platform.getHashRegions(rom);
    
    // var hasher = new RomHasher(rom, this.hashRegions, hashAlgos);
    // var hashPromise = hasher.performHashes()
    //     .then(hashlist => {
    //         this.hashes = hashlist;
    //     });

    var dbGetPromise = romDb(this.platform.name)
        .catch(err => {
            console.error(err);
            return null;
        });
    
    var dbLookupPromise = Promise.all([dbGetPromise, hashPromise])
        .then(([db]) => {
            if (db) {
                if (db.meta) {
                    this.dbInfo = {
                        name: db.meta.name || this.dbInfo.name,
                        version: db.meta.version || this.dbInfo.version
                    };
                }

                // TODO: DB should specify what kind of hash it's looking for, e.g. TOSEC wants FILE hashes
                var rom_sha1 = this.hashes.find(hash => hash.algoName === 'sha1' && hash.region.name === 'rom');
                if (rom_sha1) {
                    return db.getTitle(rom_sha1.value);
                }
            }
            
            return null;
        })
        .then(title => {
            if(title) this.dbMatch = title;
        })
        .catch(console.error);

    this.processingCompletePromise = Promise.all([hashPromise, dbLookupPromise, extendedDataPromise]);
}

/**
 *  @param {Rom} rom 
 *  @param {function(number):void} [progressCallback]
 */
function getData(rom, progressCallback) {
    return rom.loaded.then(() => {
        var result = new RomData(rom, null, progressCallback);
        return result.processingCompletePromise.then(() => {
            delete result.processingCompletePromise; // done with this
            return result;
        });
    })
}


// module.exports = RomData;
// export default RomData;
export default { getData: getData };

// /*
//  *  RomData
//  * 
//  *  Retrieves all available information about a ROM
//  */

// import RomRegion from './RomRegion';
// import platform from './platform';
// import * as hasher from './hash';
// import romDb from './romDb';
// import RomHasher from './RomHasher';

// /**
//  * @constructor
//  * @param {Uint8Array} romImage ROM image to examine
//  * @param {string[]} hashAlgos A string specifying the hash in the form 'content_algorithm',
//  * where content matches a portion of the ROM identified by Platform.getHashRegions and
//  * the algorithm matches the name of a supported hash function in the Hasher module.
//  */
// function RomData(romImage, filename, hashAlgos) {
//     hashAlgos = hashAlgos || ['file_sha1', 'rom_sha1'];
//     var ext = getExtension(filename);
//     var plat = platform.getAssociatedPlatform(romImage, ext);

//     this.platformIdent = plat.method;
//     this.platform = plat.platform;
//     console.log(plat);
//     this.hasExternalHeader = plat.platform.hasExternalHeader(romImage);
//     this.dbInfo = { name: 'not found', version: 'not found' };
//     this.dbMatch = 'not found';
//     this.extendedData = plat.platform.getExtendedData(romImage);
//     this.format = plat.platform.getFormatName(romImage);

//     this.hashRegions = plat.platform.getHashRegions(romImage);
    
//     // var hashlist = hashAlgos.map(algo => {
//     //     // throw error on constructor for invalid parameters
//     //     if (typeof algo !== 'string') throw Error('Invalid value specified for hashAlgos');
//     //     var parts = algo.split('_');
//     //     if (parts.length != 2) throw Error('Invalid value specified for hashAlgos');

//     //     var [regionName, algoName] = parts;
//     //     var region = this.hashRegions.find(reg => reg.name == parts[0]);

//     //     return {
//     //         algoName: algoName,
//     //         /**@type {RomRegion} */
//     //         region: region,
//     //     };
//     // });

//     // /** @type {{region: RomRegion, algoName: string, value: string}[]} */
//     // var hashResults = [];
//     // /** @type {{rom: Uint8Array, algoName: string, region: RomRegion}[]} */
//     // var hashTasks = []; 
//     // hashlist.forEach(item => {
//     //     hashResults.push({
//     //         region: item.region,
//     //         algoName: item.algoName,
//     //         value: null // tbd
//     //     });

//     //     // Don't want to queue multiple tasks that have same data, region, and algo
//     //     var existingTask = hashTasks.find(task => task.region.isSameRegion(item.region));

//     //     if (!existingTask) hashTasks.push({
//     //         rom: item.rom,
//     //         region: item.region,
//     //         algoName: item.algoName,
//     //     });
//     // });

//     // var hashPromises = hashTasks.map(task => {
//     //     /** @type {Promise<string>} */
//     //     var algoFunc = hasher[task.algoName + 'Async'];
//     //     if (!algoFunc) return Promise.reject("Hash algorithm " + task.algoName + " is not available");

//     //     // return { name: algo, value: algoFunc(romToHash.slice(region.start, region.length + region.start)) };
//     //     return algoFunc(task.rom, task.region.offset, task.region.length)
//     //         .then(hash => {
//     //             hashResults.find(result => result.region.isSameRegion(task.region));
//     //         })
        
//     // });

//     // this.hashPromises = hashAlgos.map(algo => { 
//     //     // throw error on constructor for invalid parameters
//     //     if (typeof algo !== 'string') throw Error('Invalid value specified for hashAlgos');
//     //     var parts = algo.split('_');
//     //     if (parts.length != 2) throw Error('Invalid value specified for hashAlgos');
        
//     //     var region = this.hashRegions.find(reg => reg.name == parts[0]);
//     //     // Get the function that actually performs the hash
//     //     var algoFunc = hasher[parts[1]];
//     //     var romToHash = region.rom || romImage;

//     //     // TODO: optimize this by not re-hashing redundant regions (frequently ROM and FILE regions are identical)
//     //     if (region && algoFunc) {
//     //         return { name: algo, value: algoFunc(romToHash.slice(region.start, region.length + region.start)) };
//     //     } else {
//     //         return null;
//     //     }
//     // });
    
    
//     // this.hashes = hashAlgos.map(algo => {
//     //     if (!typeof algo === 'string') throw Error('Invalid value specified for hashAlgos');
//     //     var parts = algo.split('_');
//     //     if (parts.length != 2) throw Error('Invalid value specified for hashAlgos');
        
//     //     var region = this.hashRegions.find(reg => reg.name == parts[0]);
//     //     // Get the function that actually performs the hash
//     //     var algoFunc = hasher[parts[1]];
//     //     var romToHash = region.rom || romImage;

//     //     // TODO: optimize this by not re-hashing redundant regions (frequently ROM and FILE regions are identical)
//     //     if (region && algoFunc) {
//     //         return { name: algo, value: algoFunc(romToHash.slice(region.start, region.length + region.start)) };
//     //     } else {
//     //         return null;
//     //     }
//     // }).filter(item => item); // remove nulls

//     var hasher = new RomHasher(romImage, this.hashRegions, hashAlgos);
//     var hashPromise = hasher.performHashes()
//         .then(hashlist => {
//             this.hashes = hashlist;
//         });

//     var dbGetPromise = romDb(this.platform.name)
//         .catch(err => {
//             console.error(err);
//             return null;
//         });
    
//     var dbLookupPromise = Promise.all([dbGetPromise, hashPromise])
//         .then(([db]) => {
//             if (db) {
//                 if (db.meta) {
//                     this.dbInfo = {
//                         name: db.meta.name || this.dbInfo.name,
//                         version: db.meta.version || this.dbInfo.version
//                     };
//                 }

//                 // TODO: DB should specify what kind of hash it's looking for, e.g. TOSEC wants FILE hashes
//                 var rom_sha1 = this.hashes.find(hash => hash.algoName === 'sha1' && hash.region.name === 'rom');
//                 if (rom_sha1) {
//                     return db.getTitle(rom_sha1.value);
//                 }
//             }
            
//             return null;
//         })
//         .then(title => {
//             if(title) this.dbMatch = title;
//         })
//         .catch(console.error);

//     hashPromise.then(() => console.log('hash'));
//     dbGetPromise.then(() => console.log('dbget'));
//     dbLookupPromise.then(() => console.log('dblookup'));
//     this.processingCompletePromise = Promise.all([hashPromise, dbLookupPromise]);
// }

// function getData(romImage, filename) {
//     var result = new RomData(romImage, filename);
//     return result.processingCompletePromise.then(() => {
//         delete result.processingCompletePromise; // done with this
//         return result;
//     });
// }

// /**
//  * Gets the file extension for the given filename
//  * @param {string} filename 
//  */
// function getExtension(filename) {
//     if (!filename) filename = '';

//     var index = filename.lastIndexOf('.');
//     if (index >= 0) {
//         return filename.substr(index + 1);
//     } else {
//         return '';
//     }
// }

// // module.exports = RomData;
// // export default RomData;
// export default { getData: getData };