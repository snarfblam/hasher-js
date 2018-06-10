/*

    small test server to debug hasher-js

*/

const express = require('express');

const PORT = 8000;

var app = express();

app.use(express.static(__dirname));

app.listen(PORT , function () {
    console.log("listening on " + PORT);
})