/*
    
*/

import Rom from './Rom';

class RomRegion{
    /**
     * @param {string} name 
     * @param {Blob | Uint8Array | Rom} rom 
     * @param {number} offset 
     * @param {number} length 
     */
    constructor(name, rom, offset, length) {
        /** Name of the region. */
        this.name = name;
        /** Location of the region. */
        this.offset = offset;
        /** Size of the region. */
        this.length = length;
        /** Data this region refers to.
         * @type {Uint8Array | Blob | Rom}
         */
        this.rom = rom;
    
        Object.defineProperty(this, 'rom', { value: rom, enumerable: false });
    }

    /**
     * Compares whether two RomRegion objects refer to the same region of
     * memory on the same ROM image
     * @param {RomRegion} romRegion 
     */
    isSameRegion(romRegion) {
        return this.rom === romRegion.rom && this.offset === romRegion.offset && this.length === romRegion.length;
    }
}

export default RomRegion;