import platform from './platform';
import hasher from './hasher';

/**
 * @constructor
 * @param {Uint8Array} romImage ROM image to examine
 * @param {string[]} hashAlgos A string specifying the hash in the form 'content_algorithm',
 * where content matches a portion of the ROM identified by Platform.getHashRegions and
 * the algorithm matches the name of a supported hash function in the Hasher module.
 */
function RomData(romImage, hashAlgos) {
    hashAlgos = hashAlgos || ['file_sha1', 'rom_sha1'];
    var plat = platform.getAssociatedPlatform(romImage);
    this.platformIdent = plat.method;
    this.platform = plat.platform;
    this.hashRegions = plat.platform.getHashRegions(romImage);
    this.hasExternalHeader = plat.platform.hasExternalHeader(romImage);

    this.hashes = hashAlgos.map(algo => {
        if (!typeof algo === 'string') throw Error('Invalid value specified for hashAlgos');
        var parts = algo.split('_');
        if (parts.length != 2) throw Error('Invalid value specified for hashAlgos');
        
        var region = this.hashRegions.find(reg => reg.name == parts[0]);
        var algoFunc = hasher[parts[1]];

        if (region && algoFunc) {
            return { name: algo, value: algoFunc(romImage.slice(region.start, region.length + region.start)) };
        } else {
            return null;
        }
    }).filter(item => item); // remove nulls
}


// module.exports = RomData;
export default RomData;