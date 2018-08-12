/*
 *  RomData
 * 
 *  Retrieves all available information about a ROM
 */

import platform from './platform';
import * as hasher from './hasher';
import romDb from './romDb';

/**
 * @constructor
 * @param {Uint8Array} romImage ROM image to examine
 * @param {string[]} hashAlgos A string specifying the hash in the form 'content_algorithm',
 * where content matches a portion of the ROM identified by Platform.getHashRegions and
 * the algorithm matches the name of a supported hash function in the Hasher module.
 */
function RomData(romImage, filename, hashAlgos) {
    hashAlgos = hashAlgos || ['file_sha1', 'rom_sha1'];
    var ext = getExtension(filename);
    var plat = platform.getAssociatedPlatform(romImage, ext);

    this.platformIdent = plat.method;
    this.platform = plat.platform;
    console.log(plat);
    this.hashRegions = plat.platform.getHashRegions(romImage);
    this.hasExternalHeader = plat.platform.hasExternalHeader(romImage);
    this.dbInfo = { name: 'not found', version: 'not found' };
    this.dbMatch = 'not found';
    this.extendedData = plat.platform.getExtendedData(romImage);
    this.format = plat.platform.getFormatName(romImage);

    this.hashes = hashAlgos.map(algo => {
        if (!typeof algo === 'string') throw Error('Invalid value specified for hashAlgos');
        var parts = algo.split('_');
        if (parts.length != 2) throw Error('Invalid value specified for hashAlgos');
        
        var region = this.hashRegions.find(reg => reg.name == parts[0]);
        // Get the function that actually performs the hash
        var algoFunc = hasher[parts[1]];

        // TODO: optimize this by not re-hashing redundant regions (frequently ROM and FILE regions are identical)
        if (region && algoFunc) {
            return { name: algo, value: algoFunc(romImage.slice(region.start, region.length + region.start)) };
        } else {
            return null;
        }
    }).filter(item => item); // remove nulls

    this.dbLookupPromise = romDb(this.platform.name)
        .catch(err => {
            console.error(err);
            return null;
        })
        .then(db => {
            if (db) {
                if (db.meta) {
                    this.dbInfo = {
                        name: db.meta.name || this.dbInfo.name,
                        version: db.meta.version || this.dbInfo.version
                    };
                }

                // TODO: DB should specify what kind of hash it's looking for, e.g. TOSEC wants FILE hashes
                var rom_sha1 = this.hashes.find(hash => hash.name == 'rom_sha1');
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

}

function getData(romImage, filename) {
    var result = new RomData(romImage, filename);
    return result.dbLookupPromise.then(() => {
        delete result.dbLookupPromise; // done with this
        return result;
    });
}

/**
 * Gets the file extension for the given filename
 * @param {string} filename 
 */
function getExtension(filename) {
    if (!filename) filename = '';

    var index = filename.lastIndexOf('.');
    if (index >= 0) {
        return filename.substr(index + 1);
    } else {
        return '';
    }
}

// module.exports = RomData;
// export default RomData;
export default { getData: getData };