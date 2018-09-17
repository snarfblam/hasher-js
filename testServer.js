/*

    Small test server to debug hasher-js.

    Launch by running the command "npm start" from the project root.

*/
const path = require('path');
const express = require('express');
const fs = require('fs');

const PORT = 8000;

if (fs.existsSync(path.join(__dirname, 'dist', 'hasher.js'))) {
    var app = express();

    // localhost/test/...
    const testDir = path.join(__dirname, '/test');
    app.use('/test', express.static(testDir));

    // localhost/...
    const distDir = path.join(__dirname, '/dist');
    app.use(express.static(distDir));

    app.listen(PORT, function () {
        console.log("listening on " + PORT);
    })
} else {
    console.log("Can not find build output. Make sure you 'npm run build' before you 'npm start'.");
}
