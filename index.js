// optional packages
// let crypto = null; // native, preferred method
// let sha1 = null; // possible fallback
// required packages
const fs = require('fs');
const platform = require('./platform');
const RomData = require('./RomData');
const sha1 = require('./Hasher').sha1;
// try {
//     crypto = require('crypto');
// } catch (err) {
//     console.log('crypto support is disabled!');
// }
// crypto.createHash('donut'); //.update("spice").digest('hex'));

// try {
//     sha1 = require('sha1');
// } catch (err) {
//     console.log('sha1 package not installed!');
// }

const filePath = process.argv[2];
console.log(filePath);

{
    fs.readFile(filePath, (err, data) => {
        // console.log(data.toString());
        // console.log(data.constructor.name);
        // console.log(data.slice(0, 10).buffer === data.buffer);

        if (err) {
            console.error(err);
        } else {
            var romData = new RomData(data);
            var regions = romData.hashRegions.map(reg => ({
                name: reg.name,
                data: data.slice(reg.start, reg.start + reg.length),
            }));

            // console.log(sha1Hash.digest('hex'));
            // console.log(sha1(data));
            regions.forEach(reg => {
                var x = data;
                console.log(reg.name, sha1(reg.data));

                // var sha1Hash = crypto.createHash('sha1');
                // sha1Hash.update(data);
                // sha1Hash.update(reg.data);
                // console.log(reg.name, sha1Hash.digest('hex'));
            })

            var ass = platform.getAssociatedPlatform(data);
            console.log(ass.method, ass.platform.name);
        }
    });
}

console.log('yo, erf');