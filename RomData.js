var platform = require('./platform');

/**
 * @constructor
 * @param {Uint8Array} romImage ROM image to examine
 */
function RomData(romImage) {
    var plat = platform.getAssociatedPlatform(romImage);
    this.platformIdent = plat.method;
    this.platform = plat.platform;
    this.hashRegions = plat.platform.getHashRegions(romImage);
    
}

module.exports = RomData;