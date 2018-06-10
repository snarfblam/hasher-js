const fs = require('fs');
const platform = require('./platform');
const RomData = require('./RomData');
const sha1 = require('./hasher').sha1;
const getDB = require('./romDb');

const filePath = process.argv[2] || 'd:\\emu\\nes\\metroid (u) [!].nes';
// console.log(filePath);

{
    fs.readFile(filePath, (err, data) => {

        if (err) {
            console.error(err);
        } else {
            var romData = new RomData(data);
            var regions = romData.hashRegions.map(reg => ({
                name: reg.name,
                data: data.slice(reg.start, reg.start + reg.length),
            }));

            // regions.forEach(reg => {
            //     var x = data;
            //     console.log(reg.name, sha1(reg.data));
            // })
            romData.hashes.forEach(hash => {
                console.log(hash.name.replace('_', '/'), hash.value);
            });

            var ass = platform.getAssociatedPlatform(data);
            console.log(ass.method, ass.platform.name);

            getDB(romData.platform.name).then(db => {
                return db.getTitle(romData.hashes.find(hash => hash.name == 'rom_sha1').value);
            }).then(title => console.log(title));
        }
    });
}

// console.log(platform);
