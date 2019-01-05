/*
    RomData
   
    Orchestrates the hashing, header decoding, and database logic
    for a file.
*/

import RomRegion from './RomRegion';
import platformLookup from './platformLookup';
import * as hasher from './hash';
import romDb from './romDb';
import RomHasher from './RomHasher';
import Rom from './Rom';
import { HexValue } from './util';

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
    var plat = platformLookup.getAssociatedPlatform(rom, ext);

    /** Private */
    this._cancel = null;

    /** Cancels the ROM hashing operation */
    this.cancel = () => { if (this._cancel) this._cancel() };
    /** Identifies the method used to identify the ROM's platform */
    this.platformIdent = plat.method;
    /** Provides platform-specific functionality */
    this.platform = plat.platform;
    /** Whether the file contains a header that is not part of the ROM image */
    this.hasExternalHeader = plat.platform.hasExternalHeader(rom);
    /** Name and version info regarding the database associated with the ROM's platform */
    this.dbInfo = { name: 'not found', version: 'not found' };
    /** Canonical name of the ROM, if found in the database */
    this.dbMatch = 'not found';
    /** A string representing the file format the ROM uses */
    this.format = plat.platform.getFormatName(rom);

    var extendedDataPromise = plat.platform.getExtendedData(rom)
        .then(extendedData => {
            this.extendedData = extendedData.getData();
        })
        .catch(err => {
            console.error(err);
            this.extendedData = [];
        });
    
    var hashPromise = plat.platform.getHashRegions(rom)
        .then(hashRegions => {
            this.hashRegions = hashRegions;
            var hasher = new RomHasher(rom, this.hashRegions, hashAlgos, progressCallback);
            this._cancel = hasher.cancel;
            return hasher.performHashes();
        })
        .then(hashlist => {
            this.hashes = hashlist;
            // Hash casing should be consistent with everything else.
            if (HexValue.upperCaseHex) {
                this.hashes.forEach(hash => hash.value = hash.value.toUpperCase());
            }
        })
        .catch(err => {
            console.error(err);
            this.hashes = [];
        });
    
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

                var hashRegion = db.meta.hashContent;
                var rom_sha1 = this.hashes.find(hash => hash.algoName === 'sha1' && hash.region.name === hashRegion);
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

    /** Private */
    this._processingCompletePromise = Promise.all([hashPromise, dbLookupPromise, extendedDataPromise]);
}

/** Returns a promise that resolves to a RomData object. The promise has
 *  a cancel method that will stop analyzing the ROM. The promise will 
 *  return the RomData object with any available information populated.
 *  @param {Rom} rom 
 *  @param {string[]} [algos] A string specifying the hash in the form 'content_algorithm',
 *  @param {function(number):void} [progressCallback]
 */
function getData(rom, algos, progressCallback) {
    /** @type {RomData} */
    var romData;
    var promise = rom.loaded.then(() => {
        romData = new RomData(rom, algos, progressCallback);
        var result = romData._processingCompletePromise.then(() => {
            delete romData._processingCompletePromise; // done with this
            return romData;
        });

        return result;
    });

    promise.cancel = () => romData.cancel();
    return promise;
}

export default { getData: getData };
