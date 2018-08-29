/*
 *  platform
 *  
 *  Provides 'platform' objects that can be used to obtain
 *  platform-specific information about a ROM.
 */

import plats from './platforms';
import RomRegion from './RomRegion';
import Platform from './platforms/Platform';
import Rom from './Rom';
import UnknownPlatform from './platforms/unknown';

// // Platform interface
// /**
//  * @typedef {Object} Platform
//  * @property {string} name
//  * @property {string[]} knownExtensions
//  * @property {function(Uint8Array): boolean} isPlatformMatch
//  * @property {function(Uint8Array): boolean} hasExternalHeader
//  * @property {function(Uint8Array): RomRegion[]} getHashRegions
//  * @property {function(Uint8Array): {{label: string, category: string, value: string}[]}} getExtendedData
//  * @property {function(Uint8Array): string} getFormatName
//  * 
//  */

var platform = {
    /** @type {Platform[]} */
    platformList: [],

    /** The platform used when  */
    unknownPlatform: new UnknownPlatform(),

    /**
     * @param {Rom} rom ROM to be examined
     * @param {string} ext File extension, not including the dot, or null if not applicable.
     * @returns {{method: string, platform: Platform}} - The associated platform, and the method used 
     * to identify the platform ('contents' = ROM contents alone, 'extension' = file extension,
     * 'contents extension' = by ROM contents first, then by file extension to disambiguate
     * multiple platform matches, 'none' = platform could not be identified, 'ambiguous'
     * means there were multiple platforms matched no single best candidate could be selected).
     */
    getAssociatedPlatform: function (rom, ext) {
        // TODO: return unknown platform object when no match is found
        var platformMatches = [];

        // Match by contents
        this.platformList.forEach(plat => {
            if (plat.isPlatformMatch(rom)) {
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
        
        return {
            method: platformMatches.length >= 1 ? 'ambiguous' : 'none',
            platform: this.unknownPlatform
        };
        
    }
};

// Load platform objects from platforms dir
{
    plats.forEach(platformObj => {
        if (platform.hasOwnProperty(platformObj.name) || platform[platformObj.name]) {
            console.error("Invalid platform name: \"" + platformObj.name + "\" conflicts with reserved name and will be excluded.")
        } else {
            platform[platformObj.name] = platformObj;
            platform.platformList.push(platformObj);
        }
    });
}




export default platform;