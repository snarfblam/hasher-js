import getDB from '../src/romDb';
import RomRegion from '../src/RomRegion';
import RomHasher from '../src/RomHasher';

import testfiles from './testfiles';
var files = testfiles.files;

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
    it('identifies regions that reference the same span of the same buffer', function () {
        var rgnA = new RomRegion("cheese", files.ambiguous, 1, 266);
        var rgnB = new RomRegion("fried_dough", files.ambiguous, 1, 266);
        expect(rgnA.isSameRegion(rgnB)).to.equal(true);
    });

    it('identifies regions that dont reference the same span of the same buffer', function () {
        var rgnC = new RomRegion("cheese", files.ambiguous, 1, 266);
        var rgnD = new RomRegion("cheese", files.ambiguous, 0, 266);
        expect(rgnC.isSameRegion(rgnD)).to.equal(false);
    });

});

describe('RomHasher', function () {
    var rgnJunk = new RomRegion('junk', files.ambiguous, 0, 0x10);
    var rgnStuff = new RomRegion('stuff', files.ambiguous, 1, 0x10);
    const junkSha = "56178b86a57fac22899a9964185c2cc96e7da589";
    const stuffMd5 = "190c4c105786a2121d85018939108a6c";

    it('should produce hashes with names in the form of regionName_algoName', function () {
        var hasher = new RomHasher(files.ambiguous, [rgnJunk, rgnStuff], ['junk_sha1', 'junk_crc32', 'stuff_sha1', 'stuff_crc32']);
        hasher.performHashes()
            .then(hashes => {
                expect(hashes.find(hash => hash.name === 'junk_sha1')).to.exist;
                expect(hashes.find(hash => hash.name === 'junk_crc32')).to.exist;
                expect(hashes.find(hash => hash.name === 'stuff_sha1')).to.exist;
                expect(hashes.find(hash => hash.name === 'stuff_crc32')).to.exist;
            });
    });

    
    it('should produce proper hash for file, range, and algo specified', function () {
        var hasher = new RomHasher(files.ambiguous, [rgnJunk, rgnStuff], ['junk_sha1', 'stuff_md5']);
        hasher.performHashes()
            .then(hashes => {
                expect(hashes.find(hash => hash.name === 'junk_sha1').value).to.equal(junkSha);
                expect(hashes.find(hash => hash.name === 'stuff_md5').value).to.equal(stuffMd5);
            });
    });

});


describe('hasher bundle', function () {
    it('process a file', function () {
        var hasher = new Hasher(files.nes);
        return hasher.getRomData()
            .then(function (data) {
                romData = data;
            });
    });

    it('produces correct ROM/file hashes', function () {
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

    })

    it('prefers platform heuristic over extension', function () {
        expect(romData.platform.name).to.equal('NES');
    });

    it('falls back on extension for disambiguation', function () {
        var hasher = new Hasher(files.ambiguous);
        return hasher.getRomData()
            .then(function (data) {
                expect(data.platform.name).to.equal('GEN');
            });
    });

});