// @ts-check

const gbHeaderOffset = 0x100;
const gbHeaderSize = 0x50;
const cgbFlagNames = {
    [0x00]: "no GBC support",
    [0x80]: "GBC support",
    [0xC0]: "GBC only",
};


import gbUtil from '../romUtils/gbUtil';
import { parseAscii } from '../util';

/**
 * Decodes a GameBoy ROM internal header
 * @constructor
 * @param {Uint8Array} romImage 
 * @param {number} [headerOffset] must be null or 0x100 to validate ROM checksum.
 */
function GbHeader(romImage, headerOffset) {
    if (headerOffset == null) headerOffset = gbHeaderOffset;
    if (romImage.length < headerOffset + gbHeaderSize) throw Error("Buffer too small to parse header.");

    /** Indicates whether the header contains a valid GameBoy logo */
    this.validGbLogo = gbUtil.verifyLogo(romImage);

    /** Game title */
    this.title = parseAscii(romImage, headerOffset + 0x34, 16);
    /** Cart manufacturer */
    this.manufacturer = parseAscii(romImage, headerOffset + 0x3F, 4);
    /** Color gameboy support flag
     * @type {number}
     */
    this.cgbFlagValue = romImage[headerOffset + 0x43];
    /** Color gameboy support 
     * @type {string}
     */
    this.cgbSupport = cgbFlagNames[this.cgbFlagValue] || 'unknown';
    /** Extended licensee data, not present in all carts. */
    this.lincenseeEx = parseAscii(romImage, headerOffset + 0x44, 2);
    /** Super Game Boy support */
    this.supportsSgb = (romImage[headerOffset + 0x46] == 0x03);
    /** Numeric value of cart type */
    this.cartTypeValue = romImage[headerOffset + 0x47];
    /** Name of cart type
     * @type {string}
     */
    this.cartType = GbHeader.gbCartTypeNames[this.cartTypeValue] || 'unknown';
    /** ROM size value */
    this.romSizeValue = romImage[headerOffset + 0x48];
    /** ROM size, as string
     * @type {string}
     */
    this.romSize = GbHeader.gbCartSizeNames[this.romSizeValue] || 'unknown';
    /** Cart RAM size value */
    this.ramSizeValue = romImage[headerOffset + 0x49];
    /** RAM size, as string
     * @type {string}
     */
    this.ramSize = GbHeader.gbRamSizeNames[this.ramSizeValue] || 'unknown';
    /** Whether the header indicates a Japan region game */
    this.japanRegion = (romImage[headerOffset + 0x4a] == 0);
    /** Licensee data. May be superceded by extended licensee data. */
    this.licensee = romImage[headerOffset + 0x4b];
    /** ROM version number */
    this.romVersion = romImage[headerOffset + 0x4c];
    /** Header checksum value as listed in header */
    this.headerChecksum = romImage[headerOffset + 0x4d];
    /** ROM checksum value as listed in header */
    this.romChecksum = (romImage[headerOffset + 0x4e] << 8) | romImage[headerOffset + 0x4f];

    /** Header checksum, as calculated */
    this.calculatedHeaderChecksum = gbUtil.calculateHeaderChecksum(romImage, headerOffset);
    /** Whether the header checksum is correct */
    this.headerChecksumValid = (this.calculatedHeaderChecksum == this.headerChecksum);

    /** ROM checksum, as calculated. May be null.
     * @type {number?}
     */
    this.calculatedRomChecksum = null;
    /** Whether the ROM checksum is correct. May be null.
     * @type {boolean?}
     */
    this.romChecksumValid = null;

    if (headerOffset = gbHeaderOffset) {
        this.calculatedRomChecksum = gbUtil.calculateRomChecksum(romImage);
        this.romChecksumValid = (this.calculatedRomChecksum == this.romChecksum);
    }

} { // -Methods- //

    // (none)
    
} { // -Static- //

    /** Location of the internal header within a GB ROM */
    GbHeader.gbHeaderOffset = gbHeaderOffset;
    /** Size of a GB internal header */
    GbHeader.gbHeaderSize = gbHeaderSize;

    /** Description of cart types, identified by header codes */
    GbHeader.gbCartTypeNames = {
        [0x00]: "ROM ONLY",
        [0x01]: "MBC1",
        [0x02]: "MBC1 RAM",
        [0x03]: "MBC1 RAM BATTERY",
        [0x05]: "MBC2",
        [0x06]: "MBC2 BATTERY",
        [0x08]: "ROM RAM",
        [0x09]: "ROM RAM BATTERY",
        [0x0B]: "MMM01",
        [0x0C]: "MMM01 RAM",
        [0x0D]: "MMM01 RAM BATTERY",
        [0x0F]: "MBC3 TIMER BATTERY",
        [0x10]: "MBC3 TIMER RAM BATTERY",
        [0x11]: "MBC3",
        [0x12]: "MBC3 RAM",
        [0x13]: "MBC3 RAM BATTERY",
        [0x15]: "MBC4",
        [0x16]: "MBC4 RAM",
        [0x17]: "MBC4 RAM BATTERY",
        [0x19]: "MBC5",
        [0x1A]: "MBC5 RAM",
        [0x1B]: "MBC5 RAM BATTERY",
        [0x1C]: "MBC5 RUMBLE",
        [0x1D]: "MBC5 RUMBLE RAM",
        [0x1E]: "MBC5 RUMBLE RAM BATTERY",
        [0xFC]: "POCKET CAMERA",
        [0xFD]: "BANDAI TAMA5",
        [0xFE]: "HuC3",
        [0xFF]: "HuC1 RAM BATTERY",
    };

    /** Description of cart sizes in number of 16KB banks, identified by header codes */
    GbHeader.gbCartSizeNames = {
        [0x00]: "2 banks",
        [0x01]: "4 banks",
        [0x02]: "8 banks",
        [0x03]: "16 banks",
        [0x04]: "32 banks",
        [0x05]: "64 banks",
        [0x06]: "128 banks",
        [0x07]: "256 banks",
        [0x52]: "72 banks",
        [0x53]: "80 banks",
        [0x54]: "96 banks",
    };

    GbHeader.gbRamSizeNames = {
        0: "0 KByte",
        1: "2 KByte",
        2: "8 KByte",
        3: "32 KByte",
    }
}

export default GbHeader;