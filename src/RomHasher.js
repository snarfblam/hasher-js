"use strict";

import RomRegion from './RomRegion';
import * as hasher from './hash';
import Rom from './Rom';

class RomHasher {
    /**
     * @param {Blob | Uint8Array} romImage 
     * @param {RomRegion[]} regions
     * @param {string[]} hashAlgos 
     */
    constructor(romImage, regions, hashAlgos) {
        this.hashRegions = regions;
        this.hashAlgos = hashAlgos;

        /** @type {{algoName: string, region: RomRegion, value: string}[]} */
        this.hashlist = [];
        
        /** @type {{algoName: string, region: RomRegion}[]} */
        this.hashTasks = [];

        this._parseHashlist();
        this._queueHashTasks();

      

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
                value: null, // to be filled in when result is calculated
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
        console.log(this.hashTasks);
        var hashPromises = this.hashTasks.map(task => {
            /** @type {function(): Promise<string>} */
            console.log("Performing " + task.algoName);
            var algoFunc = hasher[task.algoName + 'Async'];
            if (!algoFunc) return Promise.reject("Hash algorithm " + task.algoName + " is not available");
    
            // return { name: algo, value: algoFunc(romToHash.slice(region.start, region.length + region.start)) };
            var rom = task.region.rom;
            if (rom instanceof Rom) rom = rom.file;
            return algoFunc(rom, task.region.offset, task.region.length)
                .then(hash => {
                    var matches = this.hashlist.filter(item => item.region.isSameRegion(task.region) && item.algoName === task.algoName);
                    if (matches.length === 0) console.warn("task to result error");
                    matches.forEach(match => match.value = hash);
                })
        });

        return Promise.all(hashPromises)
            .then(() => {
                return this.hashlist;
            });
    }
}

export default RomHasher;