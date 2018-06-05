const path = require('path');
const fs = require('fs');

// Exported object
var platform = {
    platformList: [],

    /**
     * @param {Uint8Array} romImage ROM to be examined
     * @param {string} ext File extension, not including the dot, or null if not applicable.
     * @returns {{method: string, platform: Platform}} - The associated platform, and the method used 
     * to identify the platform ('contents' = ROM contents alone, 'extension' = file extension,
     * 'contents extension' = by ROM contents first, then by file extension to disambiguate
     * multiple platform matches, 'none' = platform could not be identified).
     */
    getAssociatedPlatform: function (romImage, ext) {
        // TODO: return unknown platform object when no match is found
        var platformMatches = [];

        // Match by contents
        this.platformList.forEach(plat => {
            if (plat.isPlatformMatch(romImage)) {
                platformMatches.push(plat);
            }
        });
        var noContentMatches = platformMatches.length === 0;

        if (platformMatches.length === 1) return { method: 'contents', platform: platformMatches[0] };

        // If there isn't exactly one content match, and no extension is provided, we can't disambiguate
        if (!ext) return { method: 'none', platform: null };

        // If there are no candidates, we'll check ALL platforms by extention
        if (noContentMatches) platformMatches = this.platformList.slice(0);

        // filter by extension
        platformMatches = platformMatches.filter(plat =>
            plat.knownExtensions.find(platExt => platExt.toUpperCase() === ext.toUpperCase())
        );

        var matchMethod = noContentMatches ? 'extension' : 'contents extension';
        if (platformMatches.length === 1) return { method: matchMethod, platform: platformMatches[0] };
        return { method: 'none', platform: null };
    }
};

// Load platform objects from platforms dir
{
    var platformsDir = require("path").join(__dirname, "platforms");

    fs.readdirSync(platformsDir).forEach(file => {
        var platformObj = require(path.join(platformsDir, file));
        
        if (platform.hasOwnProperty(platformObj.name) || platform[platformObj.name]) {
            console.error("Invalid platform name: \"" + platformObj.name + "\" conflicts with reserved name and will be excluded.")
        } else {
            platform[platformObj.name] = platformObj;
            platform.platformList.push(platformObj);
        }
    });
}


// Interface implemented by modules in /platforms
/**
 * @typedef {Object} Platform
 * @property {string} name
 * @property {string[]} knownExtensions
 * @property {function(Uint8Array): boolean} isPlatformMatch
 * @property {function(Uint8Array): boolean} hasExternalHeader
 * @property {function(Uint8Array): {name: string, start: number, length: number}[]} getHashRegions
 * 
 */


module.exports = platform;