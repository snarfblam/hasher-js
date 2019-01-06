/*
    Rom

    Wraps a File or Blob and provides helper methods.
*/
// @ts-check

import { readBytesFromBlob, getFileExtension } from './util';

class Rom {
    /**
     * @param {File | Blob} romFile
     */
    constructor(romFile) {
        /** The File object that is encapsulated */
        this.file = romFile;

        // @ts-ignore
        if (romFile instanceof File || romFile.name) {
            /** The name of the file */
            // @ts-ignore
            this.filename = romFile.name;
            /** The file extension, not including the dot. */
            this.fileExtension = getFileExtension(this.filename);
        } else {
            this.filename = null;
            this.fileExtension = null;
        }

        /** Size of the ROM file in bytes */
        this.size = this.file.size;

        /** Preview of ROM file. Loaded asyncronously. 
         * Number of bytes loaded can be found at Rom.contentsPreviewSize. 
         * Value will be null until the data is read from the file. See
         * the previewPromise property.
         * @type {Uint8Array}
         * */
        this.preview = null;

        /**
         * Get/set. Stores the BIN format of this ROM, if this object was created
         * from a ROM file.
         * @type {Rom}
         */
        this.binFormat = null;

        /** Get/set. Stores the decoded header for this ROM. */
        this.decodedHeader = null;

        /** Resolves once this object is ready to be accessed. */
        this.loaded = readBytesFromBlob(romFile, 0, Rom.contentsPreviewSize)
            .then(byteArray => {
                this.preview = byteArray;
                return null;
            });
    }

    /**
     * Promise. Gets part of the ROM image as a Uint8Array.
     * @param {number} offset 
     * @param {number} length 
     * @returns {Promise<Uint8Array>}
     */
    getBytes(offset, length) {
        return readBytesFromBlob(this.file, offset, length);
    }

    /**
     * Async. Streams data from the ROM. Recommended for handling large files.
     * 
     * @param {function(Uint8Array, number)} callback
     * @param {number} offset 
     * @param {number} chunkSize 
     * @param {number} [chunkCount] The maximum number of chunks to read. Omit to read to end of file.
     * @param {boolean} [allowPartialChunks] Defaults to true. If false, the last chunk of the file will be omitted if its size does not equal the specified chunk size.
     * @param {function()} [completedCallback] If specified, will be called once streaming is complete.
     * @returns Promise<any>
     */
    streamData(callback, offset, chunkSize, chunkCount, allowPartialChunks, completedCallback) {
        var allowPartials = (allowPartialChunks != null) ? allowPartialChunks : true;
        var remainingChunkCount = (chunkCount != null) ? chunkCount : (1 + Math.floor(this.size / chunkSize));
        var currentOffset = offset;
        var currentSliceSize = Math.min(this.size - currentOffset, chunkSize);

        return new Promise((resolve, reject) => {
            var reader = new FileReader();

            var getChunk = () => {
                var partial = currentSliceSize != chunkSize;
                if (currentOffset < this.size && remainingChunkCount > 0 && (allowPartials || !partial)) {
                    var blob = this.file.slice(currentOffset, currentOffset + currentSliceSize);
                    reader.readAsArrayBuffer(blob);
                } else {
                    // all done
                    resolve();
                    if (completedCallback) completedCallback();
                }
            }

            var serveChunk = () => {
                // @ts-ignore 
                callback(new Uint8Array(reader.result), currentOffset); // result is ArrayBuffer

                currentOffset += chunkSize;
                remainingChunkCount--;
                currentSliceSize = Math.min(this.size - currentOffset, chunkSize);

                getChunk();
            }
            
            reader.onload = serveChunk;
            reader.onerror = () => { reject(reader.error) };

            getChunk();
        });
    }

    
}

/** Number of bytes that will be loaded and readily accessible in the Rom.preview property. */
Rom.contentsPreviewSize = 0x800000;


export default Rom;