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
        
        /** @type {{algoName: string, region: RomRegion}[]} */
        this.hashTasks = [];

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
    }

    /** Initiates the hashing process. Returns a promise.
     * @returns {Promise<{algoName: string, region: RomRegion, value: string}[]>}
    */
    performHashes() {
        var progressList = [];

        var hashPromises = this.hashTasks.map(task => {
            /** @type {function(): Promise<string>} */
            var algoFunc = hasher[task.algoName + 'Async'];
            if (!algoFunc) return Promise.reject("Hash algorithm " + task.algoName + " is not available");
    
            var rom = task.region.rom;
            if (rom instanceof Rom) rom = rom.file;

            // If the hash operation is cancelled, skip over any pending hashes
            if (this._cancel) return Promise.resolve(null);
            var progressEntryIndex = progressList.length;
            progressList.push(0);
            var progressCallback = (amt) => {
                progressList[progressEntryIndex] = amt;
                if (this._progressCallback) {
                    var totalProgress = progressList.reduce((a, v) => v + a, 0) / this.hashTasks.length;
                    this._progressCallback(totalProgress);
                }
            }

            var hashPromise = algoFunc(rom, task.region.offset, task.region.length, progressCallback);
            var hashDonePromise = hashPromise.then(hash => {
                var matches = this.hashlist.filter(item => item.region.isSameRegion(task.region) && item.algoName === task.algoName);
                if (matches.length === 0) console.warn("task to result error");
                matches.forEach(match => match.value = hash || match.value);
            });
            
            // Keep references to the cancel function for each hash operation so we can abort
            this._cancelList.push(hashPromise.cancel);
            return hashDonePromise;
        });

        return Promise.all(hashPromises)
            .then(() => {
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

export default RomHasher;