// @ts-check

import genUtil from './genUtil';
import { parseAscii } from '../util';

var ioCodes = {
    "J": "Joypad",
    "6": "6-button Joypad",
    "K": "Keyboard",
    "P": "Printer",
    "B": "Control Ball",
    "F": "Floppy Disk Drive",
    "L": "Activator",
    "4": "Team Play",
    "0": "Joystick for MS",
    "R": "Serial RS232C",
    "T": "Tablet",
    "V": "Paddle Controller",
    "C": "CD-ROM",
    "M": "Mega Mouse",
};

/** @type {string[]} */
var companyCodes = []; {
    companyCodes[10] = "Takara";
    companyCodes[11] = "Taito or Accolade";
    companyCodes[12] = "Capcom";
    companyCodes[13] = "Data East";
    companyCodes[14] = "Namco or Tengen";
    companyCodes[15] = "Sunsoft";
    companyCodes[16] = "Bandai";
    companyCodes[17] = "Dempa";
    companyCodes[18] = "Technosoft";
    companyCodes[19] = "Technosoft";
    companyCodes[20] = "Asmik";
    companyCodes[22] = "Micronet";
    companyCodes[22] = "Micronet & Bignet U.S.A.";
    companyCodes[23] = "Vic Tokai";
    companyCodes[24] = "American Sammy";
    companyCodes[25] = "NCS";
    companyCodes[29] = "Kyugo";
    companyCodes[32] = "Wolfteam";
    companyCodes[33] = "Kaneko";
    companyCodes[35] = "Toaplan";
    companyCodes[36] = "Tecmo";
    companyCodes[40] = "Toaplan";
    companyCodes[42] = "UFL Company Limited";
    companyCodes[43] = "Human";
    companyCodes[45] = "Game Arts";
    companyCodes[47] = "Sage's Creation";
    companyCodes[48] = "Tengen/Time Warner Interactive";
    companyCodes[49] = "Renovation/Telenet";
    companyCodes[50] = "Eletronic Arts";
    companyCodes[56] = "Razorsoft";
    companyCodes[58] = "Mentrix";
    companyCodes[60] = "Victor Musical Industries";
    companyCodes[58] = "Mentrix";
    companyCodes[69] = "Arena/Mirrorsoft";
    companyCodes[70] = "Virgin";
    companyCodes[73] = "Soft Vision";
    companyCodes[74] = "Palsoft";
    companyCodes[76] = "Koei";
    companyCodes[79] = "U.S. Gold";
    companyCodes[81] = "Acclaim/Flying Edge";
    companyCodes[83] = "Gametek";
    companyCodes[86] = "Absolute";
    companyCodes[87] = "Mindscape";
    companyCodes[88] = "Domark";
    companyCodes[89] = "Tonka";
    companyCodes[93] = "Sony";
    companyCodes[95] = "Konami";
    companyCodes[97] = "Tradewest";
    companyCodes[100] = "T*HQ Software";
    companyCodes[101] = "TecMagik";
    companyCodes[103] = "Takara";
    companyCodes[104] = "MicroProse";
    companyCodes[106] = "Electronic Arts Victor";
    companyCodes[112] = "Designer Software";
    companyCodes[113] = "Psygnosis";
    companyCodes[115] = "Core Design";
    companyCodes[119] = "Accolade";
    companyCodes[120] = "Code Masters";
    companyCodes[125] = "Interplay";
    companyCodes[130] = "Activision";
    companyCodes[132] = "Shiny & Playmates";
    companyCodes[133] = "Bandai";
    companyCodes[139] = "Viacom International";
    companyCodes[144] = "Atlus";
    companyCodes[151] = "Infogrames";
    companyCodes[161] = "Fox Interactive";
    companyCodes[164] = "Ocean";
    companyCodes[172] = "Electronic Arts";
    companyCodes[177] = "Ubisoft";
    companyCodes[239] = "Disney Interactive";
}

var companyAltCodes = {
    "ACLD": "Ballistic",
    "ASCI": "Asciiware",
    "RSI": "Razorsoft",
    "TREC": "Treco",
    "VRGN": "Virgin Games",
    "WSTN": "Westone",
}

/**
 * Reads an ascii string (trimmed) from the ROM
 * @param {Uint8Array} rom 
 * @param {number} offset 
 * @param {number} length 
 * @returns {string}
 */
function readString(rom, offset, length) {
    var str = parseAscii(rom, offset, length, true);
    return str.replace('\0', ' ').trim();
}

/**
 * Returns a 32-bit unisgned int read from a ROM
 * @param {Uint8Array} rom 
 * @param {number} offset 
 * @returns {number}
 */
function readUint32(rom, offset) {
    return rom[offset] << 24 | rom[offset + 1] << 16 | rom[offset + 2] << 8 | rom[offset + 3];
}


/**
 * Returns a 16-bit unisgned int read from a ROM
 * @param {Uint8Array} rom 
 * @param {number} offset 
 * @returns {number}
 */
function readUint16(rom, offset) {
    return rom[offset] << 8 | rom[offset + 1];

}

/**
 * Parses the internal header of a Genesis ROM
 * @param {Uint8Array} romImage
 * @constructor 
 */
function GenHeader(romImage) {
    if (romImage.length < 0x200) throw Error('ROM too small to parse header');
    /** Game platform */
    this.platform = readString(romImage, 0x100, 0x10);
    /** Copyright notice */
    this.copyright = readString(romImage, 0x110, 0x10);
    /** Game title */
    this.gameName = readString(romImage, 0x120, 0x30);
    /** Alternate game title */
    this.altName = readString(romImage, 0x120, 0x30);
    /** Product ID */
    this.productID = readString(romImage, 0x180, 0xE);
    /** IO Support codes */
    this.ioSupport = readString(romImage, 0x190, 0x10);
    /** Modem string */
    this.modem = readString(romImage, 0x1bc, 0xc);
    /** Memo */
    this.memo = readString(romImage, 0x1C8, 0x28);
    /** Game region */
    this.region = readString(romImage, 0x1f0, 0x10);

    /** ROM start address */
    this.romStart = readUint32(romImage, 0x1a0);
    /** ROM end address */
    this.romEnd = readUint32(romImage, 0x1a4);
    /** RAM start address */
    this.ramStart = readUint32(romImage, 0x1a8);
    /** RAM end address */
    this.ramEnd = readUint32(romImage, 0x1ac);

    /** ROM checksum, as specified in the header */
    this.checksum = readUint16(romImage, 0x18e);
    
    /** Human-readable description of IO support */
    this.ioSupportFormatted = parseIoString(this.ioSupport);
    this.copyrightFormatted = parseCopyright(this.copyright);
}

/** Parses the ioSupport property into a human readable format 
 * @param {string} ioCodeString An array of characters that represent IO device codes
 * @returns {string}
*/
function parseIoString(ioCodeString) {
    var description = "";
    var unknownCodes = false;

    for (var i = 0; i < ioCodeString.length; i++) {
        var code = ioCodeString[i];
        if (code != ' ') {
            var device = ioCodes[code];
            if (device) {
                if (description.length > 0) description += ", ";
                description += device;
            } else {
                unknownCodes = true;
            }
        }
    }

    if (unknownCodes) {
        if (description.length > 0) description += ", ";
        description += "unknown codes";
    }

    if (description.length > 0) {
        return ioCodeString + " (" + description + ")";
    } else {
        return ioCodeString;
    }
}

/** Parses the copyright property into a human readable format 
 * @param {string} copyrightString
*/
function parseCopyright(copyrightString) {
    if (copyrightString.startsWith("(C)T") && copyrightString.length >= 7) {
        var code = copyrightString.substr(4, 3);
        if(code[0] == '-') code = code.substr(1);

        var codeNum = parseInt(code);
        if (!isNaN(codeNum)) {
            var companyName = companyCodes[codeNum];
            if (companyName) {
                return copyrightString + " (" + companyName + ")";
            }
        }

        var textualCode = copyrightString.substr(3, 4).toUpperCase();
        companyName = companyAltCodes[textualCode];

        switch (copyrightString.substring(3, 4).toUpperCase()) {
            case "ACLD": return copyrightString + " (Ballistic)";
            case "ASCI": return copyrightString + " (Asciiware)";
            case "RSI": return copyrightString + " (Razorsoft)";
            case "TREC": return copyrightString + " (Treco)";
            case "VRGN": return copyrightString + " (Virgin Games)";
            case "WSTN": return copyrightString + " (Westone)";
        }
    }

    return copyrightString;
}


export default GenHeader;