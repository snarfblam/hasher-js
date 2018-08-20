/*
    Provides a base class for common functionality 
*/

import RomRegion from '../RomRegion';

class Platform {
    /**
     * 
     * @param {string} name Short name of the platform, typically an acronym
     * @param {string} longname Long name of the platform, for display purposes
     * @param {string[]} knownExts File extensions associated with this platform, not including the dot.
     */
    constructor(name, longname, knownExts) {
        /** Short name of the platform, typically an acronym. */
        this.name = name;
        /** Long name of the platform, for display purposes. */
        this.longName = longname;
        /** Array of extensions associated with this platform. Used to identify
         * file types when contents appear to be ambiguous. 
         */
        this.knownExtensions = knownExts;
    }

    /**
     * Determines whether the specified ROM is for this platform, based on a platform-specific heuristic.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM appears to belong to this platform based on ROM contents
     */
    isPlatformMatch(romImage) { notImplemented(); }

    /**
     * Determines whether the specified ROM contains an external (non-embedded) header using platform-specific logic
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM contains an external header
     */
    hasExternalHeader(romImage) { notImplemented(); }

    
    /**
     * Returns an array of region descriptors for sections of the ROM to be hashed
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {RomRegion[]} Array of region descriptors
     */
    getHashRegions(romImage) { notImplemented(); }

    /**
     * Returns an array of extended information for the ROM image.
     * @param {Uint8Array} romImage ROM image to examine
     * @returns {{label: string, category: string, value: any}[]} Array of details
     */
    getExtendedData(romImage) { notImplemented(); }

    /**
     * 
     * @param {Uint8Array} romImage
     */
    getFormatName(romImage) { notImplemented(); }
}

// Todo: implement a class that encapsulated the rom File object, exposes a 4KB or so "preview" buffer,
// and exposes an interface to traverse the ROM with a chunk based method (obtaining slices of the Blob).
platform.romPreviewSize = 0x1000;

function notImplemented() { throw Error("Function is not implemented.") };

export default Platform;