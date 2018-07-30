# Hasher-js
Hasher-js is the javascript counterpart to ROM Hasher. It calculates checksums to validate ROMs and performs a database lookup.

## What It Consists Of
The primary component of hasher-js is a javascript library that accepts a file and returns platform and rom database identification. Additional platform-specific "extended data" may also be provided, e.g. internal header decoding, or layout information for multipart ROMs such as iNES.

Hasher-js includes a test page (a build is required), but eventually a more polished page will created for a stand-alone version of hasher-js.

Hasher-js is currently being developed and tested with current versions of Node and Chrome. One all functionality is implemented, compatability testing will be done.

## Test Server

When the `npm run build` command is run, the test server and database files are copied into the same directory as the bundle: `/dist`. Run `node index.js` from this directory to start the test server. Access the page at `http://localhost:8000`.

## Files

* `/server` - Test server. Do not run from here
* `/src` - Main source for the hasher-js library
* `/dist` - Created when the bundle is built. Run the test server from here.

## Output

Using the hasher-js library, you'll be given the following output, as a javascript object:

```javascript
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
    dbMatch: string | null,
    extendedData: any[],
    format: string,
    hashes: {
            name: string, // name is a concatenation of a hash region name and
                          // algo identifier, e.g. rom_sha1 or file_md5
            value: string // hex string
    } [],
}
```
