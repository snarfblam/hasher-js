# Hasher-js
Hasher-js is the javascript counterpart to ROM Hasher. It calculates checksums to validate ROMs and performs a database lookup.

## Test Server

When the `npm run build` command is run, the test server and database files are copied into the same directory as the bundle: `/dist`. Run `node index.js` from this directory to start the test server. Access the page at `http://localhost:8000`.

## Files

* `/server` - Test server. Do not run from here
* `/src` - Main source for the hasher-js library
* `/dist` - Created when the bundle is built. Run the test server from here.