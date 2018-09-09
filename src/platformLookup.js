/*
 *  platformLookup
 *
 *  Implements platform identification behavior based on heuristic matches
 *  and falling back to or disambiguating by file extension.
 */

import plats from './platforms';
import Platform from './platforms/Platform';
import Rom from './Rom';
import UnknownPlatform from './platforms/unknown';

var platformLookup = {
    /** @type {Platform[]} */
    platformList: [],

    /** The platform used when  */
    unknownPlatform: new UnknownPlatform(),

    /**
     * @param {Rom} rom ROM to be examined
     * @param {string} ext File extension, not including the dot, or null if not applicable.
     * @returns {{method: string, platform: Platform}} - The associated platform, and the method used 
     * to identify the platform
     */
    getAssociatedPlatform: function (rom, ext) {
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
        if (platformLookup.hasOwnProperty(platformObj.name) || platformLookup[platformObj.name]) {
            console.error("Invalid platform name: \"" + platformObj.name + "\" conflicts with reserved name and will be excluded.")
        } else {
            platformLookup[platformObj.name] = platformObj;
            platformLookup.platformList.push(platformObj);
        }
    });
}




export default platformLookup;