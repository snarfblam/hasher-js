// @ts-check

import gbaUtil from './gbaUtil';
import { parseAscii } from '../util';

/**
 * Parses a GBA header
 * @param {Uint8Array} romImage 
 * @param {number} [headerOffset] 
 * @constructor
 */
function GbaHeader(romImage, headerOffset) {
    if (headerOffset == null) headerOffset = 0;

    if (romImage.length < headerOffset + 0x100) throw Error("Buffer too small to parse header");

    /** Indicates whether the logo cartidge bitmap is valid */
    this.validGbaLogo = gbaUtil.verifyLogo(romImage, headerOffset);
    /** Game title */
    this.title = parseAscii(romImage, headerOffset + 0xa0, 12);
    /** Product code */
    this.gameCode = parseAscii(romImage, headerOffset + 0xac, 4);
    /** Game maker code */
    this.makerCode = parseAscii(romImage, headerOffset + 0xb0, 2);
    /** ROM version */
    this.romVersion = romImage[headerOffset + 0xbc];
    /** Header checksum, as it appears in the header */
    this.headerChecksum = romImage[headerOffset + 0xbd];
    /** Header checksum, as calcluated */
    this.calculatedHeaderChecksum = gbaUtil.calculateHeaderChecksum(romImage, headerOffset);
    /** Whether the header checksum appears to be valid */
    this.headerChecksumValid = this.headerChecksum === this.calculatedHeaderChecksum;
}


export default GbaHeader;