/*
    RomHasher

    Orchestrates hashing operations, providing a mechanism to listen to
    overall progress updates and cancel the overall operation.
*/

import RomRegion from './RomRegion';
import * as hasher from './hash';
import Rom from './Rom';

class RomHasher {
    /**
     * @param {Blob | Uint8Array} romImage 
     * @param {RomRegion[]} regions
     * @param {string[]} hashAlgos 
     * @param {function(number):void} [progressCallback]
     */
    constructor(romImage, regions, hashAlgos, progressCallback) {
        this.hashRegions = regions;
        this.hashAlgos = hashAlgos;

        /** @type {{algoName: string, region: RomRegion, value: string}[]} */
        this.hashlist = [];
        
        /** NO LONGER USED -- See hachTaskBuckets
         *  @type {{algoName: string, region: RomRegion}[]} */
        this.hashTasks = [];

        /** List of hash tasks. Each item in the bucket represents a list of algorithms and a region of data to operate on
         *  @type {{algoNames: string[], region: RomRegion}[]} */
        this.hashTaskBuckets = [];

        this._parseHashlist();
        this._queueHashTasks();
        this._cancel = false;
        this._cancelList = [];
        this._progressCallback = progressCallback;

        this.cancel = this.cancel.bind(this);

    }

    /** Parses each hash into an algorithm name and RomRegion object. */
    _parseHashlist() {
        this.hashlist = this.hashAlgos.map(algo => {
            if (typeof algo !== 'string') throw Error('Invalid value specified for hashAlgos');
            var parts = algo.split('_');
            if (parts.length != 2) throw Error('Invalid value specified for hashAlgos');

            var [regionName, algoName] = parts;
            var region = this.hashRegions.find(reg => reg.name == regionName);

            return {
                algoName: algoName,
                region: region,
                value: "(none)", // to be filled in when result is calculated
            };
        });
    }

    /** Creates a queue of tasks. */
    _queueHashTasks() {
        this.hashlist.forEach(item => {
            // Avoid queueing identical tasks
            var existingTask = this.hashTasks.find(task => task.region.isSameRegion(item.region) && task.algoName === item.algoName);
            if (!existingTask) this.hashTasks.push({
                region: item.region,
                algoName: item.algoName,
            });
        });

        var hashlist = this.hashlist.slice();
        var hashBuckets = [];

        // Split hash items into buckets where each item within a bucket differs only by algorithm
        while (hashlist.length > 0) {
            // We'll separate all hash items that have the same region as the first remaining item
            var region = hashlist[0].region;
            var predicate =
                ( /** @type {{algoName: string, region: RomRegion, value: string}} */ item) =>
                    region.isSameRegion(item.region);

            var [bucket, remainder] = partition(hashlist, predicate);
            // Separated items go into a bucket
            hashBuckets.push(bucket);
            console.log(bucket);
            // Remaining items will be processed in same manner
            hashlist = remainder;
        }

        // reduce separate items to single item with array of algorithms
        this.hashTaskBuckets = hashBuckets.map(bucket => {
            var algoList = bucket.map(hashItem => hashItem.algoName);
            return {
                algoNames: algoList,
                region: bucket[0].region
            }
        });
    }

    /** Initiates the hashing process. Returns a promise.
     * @returns {Promise<{algoName: string, region: RomRegion, value: string}[]>}
    */
    performHashes() {
        var progressList = [];

        var startTime = 0;
        if (performance && performance.now) startTime = performance.now();

        // var hashPromises = this.hashTasks.map(task => {
        //     /** @type {function(): Promise<string>} */
        //     var algoFunc = hasher[task.algoName + 'Async'];
        //     if (!algoFunc) return Promise.reject("Hash algorithm " + task.algoName + " is not available");
    
        //     var rom = task.region.rom;
        //     if (rom instanceof Rom) rom = rom.file;

        //     // If the hash operation is cancelled, skip over any pending hashes
        //     if (this._cancel) return Promise.resolve(null);
        //     var progressEntryIndex = progressList.length;
        //     progressList.push(0);
        //     var progressCallback = (amt) => {
        //         progressList[progressEntryIndex] = amt;
        //         if (this._progressCallback) {
        //             var totalProgress = progressList.reduce((a, v) => v + a, 0) / this.hashTasks.length;
        //             this._progressCallback(totalProgress);
        //         }
        //     }

        //     var hashPromise = algoFunc(rom, task.region.offset, task.region.length, progressCallback);
        //     var hashDonePromise = hashPromise.then(hash => {
        //         var matches = this.hashlist.filter(item => item.region.isSameRegion(task.region) && item.algoName === task.algoName);
        //         if (matches.length === 0) console.warn("task to result error");
        //         matches.forEach(match => match.value = hash || match.value);
        //     });
            
        //     // Keep references to the cancel function for each hash operation so we can abort
        //     this._cancelList.push(hashPromise.cancel);
        //     return hashDonePromise;
        // });

        var hashPromises = this.hashTaskBuckets.map(bucket => {
            var rom = bucket.region.rom;
            if (rom instanceof Rom) rom = rom.file;

            // If the hash operation is cancelled, skip over any pending hashes
            if (this._cancel) return Promise.resolve(null);
            var progressListIndex = progressList.length;
            progressList.push(0);
            var progressCallback = (amt) => {
                progressList[progressListIndex] = amt;
                if (this._progressCallback) {
                    var totalProgress = progressList.reduce((a, v) => v + a, 0) / progressList.length;
                    this._progressCallback(totalProgress);
                }
            }

            var hashPromise = hasher.hashMultiAsync(bucket.algoNames, rom, bucket.region.offset, bucket.region.length, progressCallback);
            var hashDonePromise = hashPromise.then(hashResults => {
                for (var i = 0; i < hashResults.length; i++) {
                    var algoName = bucket.algoNames[i];
                    var matches = this.hashlist.filter(item => item.region.isSameRegion(bucket.region) && item.algoName === algoName);
                    if (matches.length === 0) console.warn("bucket to result error");
                    matches.forEach(match => {
                        match.value = hashResults[i] || match.value;
                        match.name = match.region.name + "_" + match.algoName;
                    });
                }
            });
            
            // Keep references to the cancel function for each hash operation so we can abort
            this._cancelList.push(hashPromise.cancel);
            return hashDonePromise;
        });

        return Promise.all(hashPromises)
            .then(() => {
                if (performance && performance.now) {
                    var endTime = performance.now();
                    console.log("Hashing operation complete in " + ((endTime - startTime) / 1000) + "s");
                }


                return this.hashlist;
            });
    }

    cancel() {
        // Don't start any more hashes
        this._cancel = true;
        // Abort any currently running hashes
        this._cancelList.forEach(cancelFunc => cancelFunc());
    }

}

/** Splits an array into a "matched" and "non-matched" array based on a predicate
 *  @param {T[]} array
 *  @param {function(T): boolean} predicate 
 *  @returns {[T[], T[]]}
 *  @template T
 */
function partition(array, predicate) {
    var match = [];
    var nonmatch = [];
    array.forEach(item => {
        if (predicate(item)) {
            match.push(item);
        } else {
            nonmatch.push(item);
        }
    });

    return [match, nonmatch];
}


export default RomHasher;