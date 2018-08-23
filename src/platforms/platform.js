/*
    Provides a base class for common functionality 
*/

import RomRegion from '../RomRegion';
import Rom from '../Rom';

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
     * @param {Rom} rom ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM appears to belong to this platform based on ROM contents
     */
    isPlatformMatch(rom) { notImplemented(); }

    /**
     * Determines whether the specified ROM contains an external (non-embedded) header using platform-specific logic
     * @param {Rom} rom ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM contains an external header
     */
    hasExternalHeader(rom) { notImplemented(); }

    /**
         * Returns an array of region descriptors for sections of the ROM to be hashed
         * @param {Rom} rom ROM image to examine
         * @returns {RomRegion[]} Array of region descriptors
         */
    getHashRegions(rom) { notImplemented(); }

    /**
     * Promise. Returns an array of extended information for the ROM image.
     * @param {Rom} rom ROM image to examine
     * @returns {Promise<{label: string, category: string, value: any}[]>} Array of details
     */
    getExtendedData(rom) { notImplemented(); }

    /**
     * Gets a display name for the ROM file format.
     * @param {Rom} rom ROM image to examine
     * @returns {string}
     */
    getFormatName(rom) { notImplemented(); }

    /**
     * Promise. Returns a BIN-formatted version of the ROM.
     * @param {Rom} rom ROM image to examine
     * @returns {Promise<Blob>}
     */
    getBinFormat(rom) {
        if (rom.binFormat) return Promise.resolve(rom.binFormat);

        return this._convertToBin(rom)
            .then(rom => {
                if (rom instanceof Blob) {
                    rom.binFormat = new Rom(rom);
                } else if (rom instanceof Rom) {
                    rom.binFormat = rom;
                } else {
                    return Promise.reject("BIN ROM invalid type");
                }

                return rom.binFormat;
            });
    }

    /**
     * Private. Promise. Converts a ROM to BIN format. Default implementation
     * returns the original ROM. Should return a Blob.
     * @param {Rom} rom ROM image to examine
     * @returns {Promise<Blob>}
     */
    _convertToBin(rom) {
        return Promise.resolve(rom);
    }

    /**
     * Promise. Returns decoded header, if applicable.
     * @param {Rom} rom ROM image to examine
     * @returns {Promise<any>}
     */
    getHeader(rom) {
        if (rom.decodedHeader) return Promise.resolve(rom.decodedHeader);
         
        return Promise.resolve(this._decodeHeader(rom));
    }

    /**
     * Private. Promise. Override to add header decoding logic. Return either
     * a header or a promise that resolves to a header.
     * @param {Rom} rom ROM image to examine
     * @returns {Promise<any> | any}
     */
    _decodeHeader(rom) {
        return null;
    }
}


function notImplemented() { throw Error("Function is not implemented.") };

export default Platform;