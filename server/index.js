/*

    small test server to debug hasher-js

*/
const path = require('path');
const express = require('express');

const PORT = 8000;

var app = express();

// localhost/test/...
var testDir = path.join(__dirname, '../test');
console.log(testDir);
app.use('/test', express.static(testDir));
// localhost/...
app.use(express.static(__dirname));

app.listen(PORT , function () {
    console.log("listening on " + PORT);
})