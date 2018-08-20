var globalUtil = {
/**
 * Parses ASCII-encoded text from a ROM image. Character values above 0x7F are undefined.
 * @param {Uint8Array} rom 
 * @param {number} offset 
 * @param {number} length 
 * @param {boolean} ignoreTerminator optional - If true, the returned string will not be truncated at the first null terminator character
 * @returns {string}
 */
    parseAscii: function (rom, offset, length, ignoreTerminator) {
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
    },

    /**
     * Converts an integer value to a hex string
     * @param {number} value
     * @param {number} digits
     * @returns {string}
     */
    toHex: function (value, digits) {
        var result = value.toString(16);
        while (result.length < digits) result = "0" + result;
        return result;
    },
}

export default globalUtil;
