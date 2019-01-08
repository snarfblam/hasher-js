// @ts-check

/*
    Represents an internal snes header
*/

import snesUtil from './snesUtil';

class SnesHeader{
    /**
     * 
     * @param {Uint8Array} romImage 
     * @param {boolean} hasExternalHeader 
     */
    constructor(romImage, hasExternalHeader) {
        /** Location of the internal header within the file */
        this.internalHeaderOffset = 0;
        /** Memory mapping used be the cartridge. */
        this.mapping = "unknown";
        /** Size of the external header. Zero for no header. */
        this.externalHeaderSize = hasExternalHeader ? snesUtil.externalHeaderSize : 0;
        /** Indicates whether a valid header could be found and decoded */
        this.valid = true;
    
        if (romImage.length >= SnesHeader.minimumRomSize) {
            
            var layout = snesUtil.checkHiromOrLorom(romImage);
    
            if (layout.exhirom) {
                this.internalHeaderOffset = this.externalHeaderSize + SnesHeader.exhiromHeaderOffset;
                this.mapping = "exhirom";
            } else if (layout.lorom && !layout.hirom) {
                this.internalHeaderOffset = this.externalHeaderSize + SnesHeader.loromHeaderOffset;
                this.mapping = "lorom";
            } else if (layout.hirom && !layout.lorom) {
                this.internalHeaderOffset = this.externalHeaderSize + SnesHeader.hiromHeaderOffset;
                this.mapping = "hirom";
            } else {
                // in the event that the hirom/lorom heuristic gives us an ambiguous result, we guess
                this.internalHeaderOffset = this.externalHeaderSize + SnesHeader.loromHeaderOffset;
            }
    
            /** A 16-bit internal checksum */
            this.checksum = (0xFFFF & (
                (romImage[this.internalHeaderOffset + 0x1F] << 8) |
                (romImage[this.internalHeaderOffset + 0x1e])
            ));
            /** A 16-bit complement to the internal checksum */
            this.checksumComplement = (0xFFFF & (
                (romImage[this.internalHeaderOffset + 0x1D] << 8) |
                (romImage[this.internalHeaderOffset + 0x1C])
            ));
        } else {
            this.internalHeaderOffset = this.externalHeaderSize;
            this.mapping = "none";
            this.checksum = 0;
            this.checksumComplement = 0;
            this.valid = false;
        }
    
    
    }
}

SnesHeader.loromHeaderOffset = 0x7fc0;
SnesHeader.hiromHeaderOffset = 0xffc0;
SnesHeader.exhiromHeaderOffset = 0x40ffc0;
SnesHeader.minimumRomSize = 0x10000;

export default SnesHeader;