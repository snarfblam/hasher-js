# Hasher-js
Hasher-js is the javascript counterpart to the C# application *ROM Hasher*. It calculates checksums to validate ROMs and performs a database lookup.

## What It Consists Of
The primary component of hasher-js is a javascript library that accepts a file and returns platform and rom database identification. Additional platform-specific "extended data" may also be provided, e.g. internal header decoding, or layout information for multipart ROMs such as iNES. Hasher-js also includes an HTML user interface (see "Web Page / Server" below).

Hasher-js is currently being developed and tested with current versions of Chrome and Firefox. Compatability with IE11 and Edge are short-term future goals.

## Web Page / Sever

Hasher-js includes a page that can be used as a front-end. Additionally, a very simple server is included to run the page locally. A build is required to use these features. (A)

When the `npm run build` command is run, the page, server, and database files are copied into the same directory as the bundle: `/dist`. Run `node index.js` from this directory to start the test server. Access the page at `http://localhost:8000`.

To host the page on a web server, simply copy the contents of the `/dist` directory, omitting `/dist/index.js`.

## Files

* `/server` - Web page and server. Do not run from here.
* `/src` - Main source for the hasher-js library.
* `/dist` - Created when the bundle is built. Run the test server from here.
* `/dist/hasher.js` - Compiled Hasher script.

## Usage

You can include the hasher bundle in your HTML or include the module via javascript.

* `<script src='hasher.js'></script>`
* `const Hasher = require('hasher-js');`
* `import * as Hasher from 'hasher-js`;

Hasher-js exposes a constructor, `Hasher()`, which accepts a `File` object. The returned object has two methods:

* **`getRomData()`** - begins processing the file and returns a Promise that resolves to a `RomData` object. `getRomData()` accepts an optional callback (`function(number)`) that is called with a value between 0 and 1 to report progress.
* **`cancel()`** - can be called to cancel the file hashing. (The promise will still resolve and return any decoded data). 

```javascript
/*
    new Hasher(rom: File):
    {
        getRomData: function(progressCallback?: function(number): void): Promise<RomData>,
        cancel: function(): void
    }
*/

var hashObj = new Hasher(myFile);

// Output progress to the console
var progressCallback = function(progress) { 
    var percent = Math.floor(progress * 100);
    console.log("% done: " + percent);
};

// Allow the user to cancel long operations
document.getElementById('cancel-button').onclick = function() { 
    hashObj.cancel(); 
};

// Display our ROM database match on the console
hashObj.getRomData(progressCallback)
    .then(function(romData) {
        // Display the name of the game to the console
        console.log("No-Intro name: " + romData.dbMatch);
    });
```

Below is a complete listing of the `RomData` type.

```javascript
// Any properties not outlined here are subject to change in future versions

{
    platformIdent: "none" | "contents" | "extension" | "contents extension",
    platform: {
        name: string,
        knownExtensions: string[]
    },
    hashRegions: {
            name: string, // typically "file" and "rom", but can include 
                          // platform specific regions like "PRG" and "CHR"
            start: number,
            length: number
    } [],
    hasExternalHeader: boolean,
    dbInfo: {
        name: string,
        version: string
    },
    dbMatch: string,
    extendedData: {
        category?: string, 
        label: string, 
        value: string
    } [],
    format: string,
    hashes: {
            name: string, // name is a concatenation of a hash region name and
                          // algorithm identifier, e.g. rom_sha1 or file_md5
            value: string // hex string
    } [],
}
```

Note that although the items in the `hashes` array contain `offset` and `length` properties, these values may not refer to the file itself. They may (or may not) refer to a location withing an extracted and/or converted ROM image, e.g. unheadered and/or de-interleaved ROM.
## Notes

### Databases

After identifying the platform of a ROM image, the software attempts to request the appropriate database at the relative URL `db/*platform-name*.json`. The default databases are No-Intro databases, converted to JSON. The JSON objects contain a property, `meta`, with additional information about the database.

The following regexs are used to convert the No-Intro databases to json (using VSCode) (additional massaging will be required):

``` regex
Clr-Mame-Pro format
replace:
    game \(.*\n\Wname\W"(.*)\".*\n.*\n?.*\n.*sha1 ([a-zA-Z0-9]*).*\n\W?\)\W\n
with:
    "$2": "$1",\n

CLR MAME Pro XML - 
replace:
    <game name="(.*)">\n.*\n.*sha1="([A-Z0-9]+)".*\n\W</game>\n
with:
    "$2": "$1",\n
```