import getDB from '../src/romDb';
import RomRegion from '../src/RomRegion';

import testfiles from './testfiles';
var files = testfiles.files;

// function createTestFile(name, descriptor) {
//     var parts = [];

//     descriptor.forEach(entry => {
//         if (entry[0] == 'raw') {
//             parts.push(new Uint8Array(entry[1]));
//         } else if (entry[0] == 'repeat') {
//             var repeatLen = entry[1];
//             var repeatValue = entry[2];

//             if (repeatValue instanceof Array) {
//                 var data = new Uint8Array(repeatLen * repeatValue.length);

//                 for (var i = 0; i < data.length; i += repeatValue.length) {
//                     for (var iByte = 0; iByte < repeatValue.length; iByte++) {
//                         data[i + iByte] = repeatValue[iByte];
//                     }
//                 }
//                 parts.push(data);
//             } else {
//                 var data = new Uint8Array(repeatLen);
//                 data.fill(repeatValue);
//                 parts.push(data);
//             }
//         } else {
//             throw Error('Unknown data in file descriptor: ' + entry[0]);
//         }
//     });

//     var result = new Blob(parts);
//     result.name = name;
//     return result;
// }

// var nesRom = createTestFile("test.n64",
//     [
//         ["raw", [0x4e, 0x45, 0x53, 0x1A]], // "INES"
//         ["raw", [0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]], // Most basic possible INES header
//         ["repeat", 0x4000, 0xFF], // PRG
//         ["repeat", 0x2000, 0xFF], // CHR
//     ]);
// var ambiguousRom = createTestFile("test.smd",
//     [
//         ["repeat", 0x1000, 0x00]
//     ]);

var expect = chai.expect;
var romData;

describe('romDB', function () {
    it('should retrieve a file by DB name', function () {
        return getDB('NES')
            .then(db => {
                expect(db.meta).to.exist;
            })
    });
});


describe('romDB.getTitle', function () {
    var dbPromise = getDB('GB');
    it('should retrieve a title by hash', function () {
        return dbPromise
            .then(db => db.getTitle("D9CB1721854709BE7667F5DBCE0ADF2488C0919B"))
            .then(title => {
                expect(title).to.equal("4 in 1 (Europe) (4B-002, Sachen) (Unl)");
            })
    });

    it('should return null for unknown hash', function () {
        return dbPromise
            .then(db => db.getTitle("B9CB1721854709BE7667F5DBCE0ADF2488C0919B"))
            .then(title => {
                expect(title).to.equal(null);
            })
    });
});


describe('RomRegion.isSameRegion', function () {
    it('should identify regions that reference the same span of the same buffer', function () {
        var rgnA = new RomRegion("cheese", files.ambiguous, 1, 266);
        var rgnB = new RomRegion("fried_dough", files.ambiguous, 1, 266);
        expect(rgnA.isSameRegion(rgnB)).to.equal(true);
    });

    it('should identify regions that dont reference the same span of the same buffer', function () {
        var rgnC = new RomRegion("cheese", files.ambiguous, 1, 266);
        var rgnD = new RomRegion("cheese", files.ambiguous, 0, 266);
        expect(rgnC.isSameRegion(rgnD)).to.equal(false);
    });

});


describe('hasher bundle', function () {
    it('should process a file', function () {
        var hasher = new Hasher(files.nes);
        return hasher.getRomData()
            .then(function (data) {
                romData = data;
            });
    });

    it('should produce correct ROM/file hashes', function () {
        var hashChecks = [
            { name: "file_sha1", value: "59f5993874a83eec67f3fa14b1feec1d19551c62" },
            { name: "file_md5", value: "c9b2fee3f8455f419beb08c148a429e6" },
            { name: "file_crc32", value: "d7c7392c" },
            { name: "rom_sha1", value: "bf3e74e1d7157bd3cff3201b3e8271f15c43877a" },
            { name: "rom_md5", value: "5c65ae66b72ed07bba39174eb31762ed" },
            { name: "rom_crc32", value: "5c5ba736" },
        ];

        hashChecks.forEach(check => {
            var value = romData.hashes.find(item => item.name === check.name).value;
            expect(value).to.equal(check.value);
        })
        // do a foreach on hashchecks
        // var file_sha1 = romData.hashes.find(item => item.name == "file_sha1").value;

    })

    it('should prefer platform heuristic over extension', function () {
        expect(romData.platform.name).to.equal('NES');
    });

    it('should fall back on extension for disambiguation', function () {
        var hasher = new Hasher(files.ambiguous);
        return hasher.getRomData()
            .then(function (data) {
                expect(data.platform.name).to.equal('GEN');
            });
    });

});