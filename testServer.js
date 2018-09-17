/*

    small test server to debug hasher-js

*/
const path = require('path');
const express = require('express');

const PORT = 8000;

var app = express();

// localhost/test/...
const testDir = path.join(__dirname, '/test');
console.log(testDir);
app.use('/test', express.static(testDir));
const distDir = path.join(__dirname, '/dist');
// localhost/...
app.use(express.static(distDir));

app.listen(PORT , function () {
    console.log("listening on " + PORT);
})