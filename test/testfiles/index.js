/*
    This module provides test files and related utility functions.

    The test files are constructed from 'descriptors' provided by other files in
    this directory. A descriptor is an array of entries describing a binary file.
    Each entry is, in turn, an array, which can take one of the following forms:

    ["raw", number[]] // Specifies binary data in the form of an array of number values
    ["repeat", count, value] // Specifies a single byte value, repeated _count_  times
    ["repeat", count, number[]] // Specifies a pattern of bytes to repeat _count_ times.
    
    NOTE: Some tests are dependant upon the contents of the files. Modifying these pseudo-
    files should be avoided, and done with care when necessary.

*/

import nesDescriptor from './nes';
import ambiguousDescriptor from './ambiguous';

var nesFile = DescriptorToBlob(nesDescriptor, "nes.nes");
var ambiguousFile = DescriptorToBlob(ambiguousDescriptor, "ambig.smd");
/**
 * 
 * @param {(Blob | File)} pseudoFile 
 * @param {string} name 
 */
function SetFilename(pseudoFile, name) {
    pseudoFile.name = name;
    return pseudoFile;
}

/**
 * 
 * @param {Array<(["raw", number[]] | ["repeat", number, number] | ["repeat", number, number[]])>} descriptor 
 */
function DescriptorToBlob(descriptor, filename) {
    let parts = [];

    descriptor.forEach(entry => {
        if (entry[0] == 'raw') {
            parts.push(new Uint8Array(entry[1]));
        } else if (entry[0] == 'repeat') {
            let repeatLen = entry[1];
            let repeatValue = entry[2];

            if (repeatValue instanceof Array) {
                let data = new Uint8Array(repeatLen * repeatValue.length);

                for (let i = 0; i < data.length; i += repeatValue.length) {
                    for (let iByte = 0; iByte < repeatValue.length; iByte++) {
                        data[i + iByte] = repeatValue[iByte];
                    }
                }
                parts.push(data);
            } else {
                let data = new Uint8Array(repeatLen);
                data.fill(repeatValue);
                parts.push(data);
            }
        } else {
            throw Error('Unknown data in file descriptor: ' + entry[0]);
        }
    });

    var result = new Blob(parts);
    if (filename) result.name = filename;
    return result;
}

export default {
    files: {
        nes: nesFile,
        ambiguous: ambiguousFile
    }
};