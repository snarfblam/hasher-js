import util from './util';


const externalHeaderSize = 0x200;
const interleaveChunkSize = 0x4000;
const interleaveHalfChunkSize = 0x2000;

/** strings found in ROMs used to identify layout */
const romIdentifiers = [
    {
        sega32X: false,
        interleaved: false,
        knownNames: ["SEGA GENESIS", "SEGA MEGADRIVE", "SEGA MEGA DRIVE"],
        offset: 0x100,
        headeredOffset: 0x200,
    },
    {
        sega32X: true,
        interleaved: false,
        knownNames: ["SEGA 32X"],
        offset: 0x100,
        headeredOffset: 0x200,
    },
    {
        sega32X: false,
        interleaved: true,
        knownNames: ["SG EEI", "SG EARV", "SG EADIE", "EAGNSS", "EAMGDIE", "EAMG RV"],
        offset: 0x80,
        headeredOffset: 0x280,
    },
    {
        sega32X: true,
        interleaved: true,
        knownNames: ["SG 2", "EA2"],
        offset: 0x80,
        headeredOffset: 0x280,
    },
];


/**
 * Gets ROM layout and platform (gen vs. 32x) information based on internal header.
 * @param {Uint8Array} romImage
 * @returns {{interleaved: boolean, internalHeader: boolean, externalHeader: boolean, sega32X: boolean}}
 */
function getRomInfo(romImage) {
    if (romImage.length >= 0x400) {

        for (var i = 0; i < romIdentifiers.length; i++) {
            var identifier = romIdentifiers[i];

            // Check at locations for both with and without external header
            var unheaderedText = util.parseAscii(romImage, identifier.offset, 0x10).replace('_', ' ').trim();
            var headeredText = util.parseAscii(romImage, identifier.headeredOffset, 0x10).replace('_', ' ').trim();

            for (var iKnownName = 0; iKnownName < identifier.knownNames.length; iKnownName++) {
                var knownName = identifier.knownNames[iKnownName];

                var unheaderedMatch = unheaderedText.startsWith(knownName);
                var headeredMatch = headeredText.startsWith(knownName);

                if (headeredMatch || unheaderedMatch) {
                    return {
                        interleaved: identifier.interleaved,
                        sega32X: identifier.sega32X,
                        internalHeader: true,
                        externalHeader: headeredMatch
                    };
                }
            }
        }
    }
    
    return {
        interleaved: false,
        sega32X: false,
        internalHeader: false,
        externalHeader: false
    };
}

/**
 * Gets the ROM in BIN format (not interleaved or headered) if it is not already.
 * @param {Uint8Array} romImage 
 * @returns {Uint8Array}
 */
function getBinFormat(romImage) {
    // If ROM is already in BIN format, or has already been converted, we don't need to convert
    if (romImage.binFormatted) return romImage.binFormatted;
    var {externalHeader, interleaved} = getRomInfo(romImage);
    if (!externalHeader && !interleaved) return romImage;

    var binRom;
    var readOffset = 0;
    var writeOffset = 0;

    // Create a buffer. Exclude header if necessary.
    if (externalHeader) {
        binRom = new Uint8Array(romImage.length - externalHeaderSize);
        readOffset = externalHeaderSize;
    } else {
        binRom = new Uint8Array(romImage.length);
    }

    while (readOffset + interleaveChunkSize <= romImage.length) {
        deinterleaveChunk(romImage, readOffset, binRom, writeOffset);
        readOffset += interleaveChunkSize;
        writeOffset += interleaveChunkSize;
    }

    // Cache the converted ROM
    romImage.binFormatted = binRom;
    return binRom;
}

function deinterleaveChunk(sourceRom, sourceOffset, destRom, destOffset) {
    var writeOffset = destOffset;
    for (var readOffset = 0; readOffset < interleaveHalfChunkSize; readOffset++) {
        // Read even byte from even block
        destRom[writeOffset + 1] = sourceRom[sourceOffset + readOffset];
        // Read odd byte from odd block
        destRom[writeOffset] = sourceRom[sourceOffset + readOffset + interleaveHalfChunkSize];

        writeOffset += 2;
    }
}

var genUtil = {

    /** Gets ROM layout and platform (gen vs. 32x) information based on internal header. */
    getRomInfo: getRomInfo,

    /** Gets the ROM in a raw ROM image (not interleaved or headered) if it is not already. */
    getBinFormat: getBinFormat,

    hasValidSmdHeader: function(romImage) {
        // todo: remove?
    },

    externalHeaderSize: externalHeaderSize,
};

export default genUtil;