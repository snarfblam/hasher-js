/*
    Provides a base class for common functionality 
*/

import RomRegion from '../RomRegion';
import Rom from '../Rom';
import ExtendedData from '../ExtendedData';

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
    isPlatformMatch(rom) {
        throw Error("Function is not implemented.")
    }

    /**
     * Determines whether the specified ROM contains an external (non-embedded) header using platform-specific logic
     * @param {Rom} rom ROM image to examine
     * @returns {boolean} Boolean indicating whether the ROM contains an external header
     */
    hasExternalHeader(rom) {
        return false
    }

    /**
         * (Abstract) Promise. Returns an array of region descriptors for sections of the ROM to be hashed
         * @param {Rom} rom ROM image to examine
         * @returns {Promise<RomRegion[]>} Array of region descriptors
         */
    getHashRegions(rom) {
        throw Error("Function is not implemented.")
    }

    /**
     * (Virtual) Promise. Returns an array of extended information for the ROM image. Inheritors 
     * should call the base class method and update the returned object.
     * @param {Rom} rom ROM image to examine
     * @returns {Promise<ExtendedData>} Array of details
     */
    getExtendedData(rom) {
        return Promise.resolve(new ExtendedData());
    }

    /**
     * (Abstract) Gets a display name for the ROM file format.
     * @param {Rom} rom ROM image to examine
     * @returns {string}
     */
    getFormatName(rom) {
        throw Error("Function is not implemented.")
    }

    /**
     * (Final) Promise. Returns a BIN-formatted version of the ROM.
     * @param {Rom} rom ROM image to examine
     * @returns {Promise<Rom>}
     */
    getBinFormat(rom) {
        if (rom.binFormat) return Promise.resolve(rom.binFormat);

        return this._convertToBin(rom)
            //@ts-ignore
            .then(binRom => {
                if (binRom instanceof Blob) {
                    rom.binFormat = new Rom(binRom);
                } else if (rom instanceof Rom) {
                    rom.binFormat = binRom;
                } else {
                    return Promise.reject("BIN ROM invalid type");
                }

                return rom.binFormat;
            });
    }

    /**
     * (Virtual/Private) Promise. Converts a ROM to BIN format. Default implementation
     * returns the original ROM. Should return a Blob.
     * @param {Rom} rom ROM image to examine
     * @returns {Promise<Blob | Rom>}
     */
    _convertToBin(rom) {
        return Promise.resolve(rom);
    }

    /**
     * (Virtual) Returns decoded header, if applicable.
     * @param {Rom} rom ROM image to examine
     * @returns {Promise<any>}
     */
    getHeader(rom) {
        if (rom.decodedHeader) return Promise.resolve(rom.decodedHeader);

        return Promise.resolve(this._decodeHeader(rom));
    }

    /**
     * (Virtual/Private) Promise. Override to add header decoding logic. Return either
     * a header or a promise that resolves to a header.
     * @param {Rom} rom ROM image to examine
     * @returns {Promise<any> | any}
     */
    _decodeHeader(rom) {
        return null;
    }
}

Platform.exDataCategories = {
    "Header": "Header",
    "Hashes": "Hashes",
    "ROM": "ROM",
};


export default Platform;