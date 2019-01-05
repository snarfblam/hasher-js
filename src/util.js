import { resolve } from "path";

/**
 * Reads bytes from a blob into a Uint8Array
 * @param {Blob} blob 
 * @param {number} [offset] 
 * @param {number} [length]
 * @returns {Promise<Uint8Array>}
 */
function readBytesFromBlob(blob, offset, length) {
    return new Promise((resolve, reject) => {
        if (length == null) length = blob.size;
        if (offset == null) offset = 0;
        var actualBlob = blob;
        
        var reader = new FileReader();
        if (offset != 0 || length != blob.size) {
            var actualLength = Math.min(blob.size - offset, length - offset);
            actualBlob = blob.slice(offset, offset + actualLength);
        }

        reader.onload = function () {
            resolve(new Uint8Array(reader.result)); 
        };
        reader.onerror = function () {
            reject(reader.error || Error("Unknown error"));
        }

        reader.readAsArrayBuffer(actualBlob);
    });

}

/**
 * Gets the file extension for the given filename
 * @param {string} filename 
 */
function getFileExtension(filename) {
    if (!filename) filename = '';

    var index = filename.lastIndexOf('.');
    if (index >= 0) {
        return filename.substr(index + 1);
    } else {
        return '';
    }
}

/**
 * Parses ASCII-encoded text from a ROM image. Character values above 0x7F are undefined.
 * @param {Uint8Array} rom 
 * @param {number} offset 
 * @param {number} length 
 * @param {boolean} [ignoreTerminator] - If true, the returned string will not be truncated at the first null terminator character
 * @returns {string}
 */
function parseAscii(rom, offset, length, ignoreTerminator) {
    // Create a view into the rom
    var buffer = rom.buffer;
    var start = Math.min(rom.byteOffset + offset, buffer.byteLength); // no further than end of buffer
    var len = Math.min(buffer.byteLength - start, length); // no longer than to end of buffer 
    
    var view = new Uint8Array(buffer, start, len);

    // Use this view as an array of character codes
    var result = String.fromCharCode.apply(null, view);

    // Truncate the string at the first null terminator, if applicable
    if (!ignoreTerminator) {
        var indexOfNull = result.indexOf("\x00");
        if (indexOfNull >= 0) return result.substr(0, indexOfNull);
    }

    return result;
}

/**
 * Converts an integer value to a hex string
 * @param {number} value
 * @param {number} digits
 * @returns {string}
 */
function toHex (value, digits) {
    var result = value.toString(16);
    while (result.length < digits) result = "0" + result;
    return result;
}

/**
 * Represents a value in extended ROM data.
 */    
class HexValue { 
    /**
     * Creates an Extended
     * @param {string} [prefix] - Prefix to be appended to the formatted string. Should include a trailing space if a space between the prefix and value is desired.
     * @param {number} value - Numeric value to be displayed
     * @param {string} format - Preferred method of formatting the value. Should be a value from ExtendedData.Formats
     */
    constructor(value, prefix, preferredFormat) { 
        this.prefix = prefix || "";
        this.value = value || 0;
        this.preferredFormat = preferredFormat;
        /** Specifies the minimum number of digits to display a hex value with. */
        this.hexLength = 0;
    }

    /**
     * Gets a formatted string
     * @param {string} format? - Optional. A value from ExtendedData.Formats may be specified.
     */
    format(format) {
        format = format || this.preferredFormat;
        switch (format) { 
            case HexValue.formats.Decimal:
                return this.prefix + this.value.toString();
            case HexValue.formats.Hexadecimal:
                return this.prefix + HexValue.hexSymbol + this.valueAsHex();
            case HexValue.formats.JustHex:
                return this.valueAsHex();
            case HexValue.formats.DecAndHexParen:
                return this.prefix + this.value.toString() + " (" + HexValue.hexSymbol + this.valueAsHex() + ")";
            case HexValue.formats.DecAndHexSlash:
                return this.prefix + this.value.toString() + "/" + HexValue.hexSymbol + this.valueAsHex() + "";
            default:
                console.warn("Invalid prefix type: " + this.preferredFormat);
                return this.prefix + HexValue.hexSymbol + this.valueAsHex();
        }

    }

    valueAsHex() { 
        var result = this.value.toString(16);
        if (HexValue.upperCaseHex) {
            result = result.toUpperCase();
        }

        while (result.length < this.hexLength) {
            result = "0" + result;
        }
        return result;
    }

    toString() { 
        return this.format();
    }
}

/** Contains constant values to specify formatting styles. */
HexValue.formats = {
    /** Decimal number */
    "Decimal": "Decimal",
    /** Hex number with hex value specifier (see HexValue.hexSymbol) */
    "Hexadecimal": "Hexadecimal",
    /** Hex number without hex value specifier (see HexValue.hexSymbol) */
    "JustHex": "JustHex",
    /** Decimal with hex in parens */
    "DecAndHexParen": "DecAndHexParen",
    /** Decimal with hex with slash between */
    "DecAndHexSlash": "DecAndHexSlash",
}

/** Application-wide setting to set casing of formatted strings. */
HexValue.upperCaseHex = true;

/** Application-wide setting to specify the symbol used to denote hexadecimal, e.g. "$" or "0x". */
HexValue.hexSymbol = "$";

/**
 * Convenience method that gets a hex-formatted object.
 * @param {string} [prefix]
 * @param {number} value 
 * @param {number} [len]
 */
HexValue.hex = function (value, len, prefix) { 
    var result = new HexValue(value, prefix, HexValue.formats.Hexadecimal);
    if (len || len === 0)
        result.hexLength = len;
    return result;
}

/**
 * Convenience method that gets a hex-formatted object without a hexadecimal specifier.
 * @param {string} [prefix]
 * @param {number} value 
 * @param {number} [len]
 */
HexValue.justHex = function (value, len, prefix) { 
    var result = new HexValue(value, prefix, HexValue.formats.JustHex);
    if (len || len === 0)
        result.hexLength = len;
    return result;
}


/**
 * Convenience method that gets a hex-formatted object.
 * @param {string} [prefix]
 * @param {number} value 
 * @param {number} [len]
 */
HexValue.hexSlash = function (value, len, prefix) { 
    var result =  new HexValue(value, prefix, HexValue.formats.DecAndHexSlash);
    if (len || len === 0)
        result.hexLength = len;
    return result;
}

/**
 * Convenience method that gets a hex-formatted object.
 * @param {string} [prefix]
 * @param {number} value 
 * @param {number} [len]
 */
HexValue.hexParen = function (value, len, prefix) { 
    var result = new HexValue(value, prefix, HexValue.formats.DecAndHexParen);
    if (len || len === 0)
        result.hexLength = len;
    return result;
}

// /**
//  * Returns a number as a hexadecimal string with the casing specified by HexValue.upperCaseHex
//  * @param {number} value 
//  */
// HexValue.toHex = function (value) { 
//     var result = (value || 0).toString(16);
//     if (HexValue.upperCaseHex) result = result.toUpperCase();
//     return result;
// }

export { readBytesFromBlob, getFileExtension, toHex, parseAscii, HexValue };
