
function tryLoad(library) {
    try {
        return require(library);
    } catch (err) {
        return null;
    }
}

function loadSha1() {
    var sha1 = null;
    
    // Get crypto library if present
    var crypto = tryLoad('crypto');

    // Get SHA1 hash from crypto if possible
    if (crypto) {
        var hash;

        try {
            hash = crypto.createHash('sha1');
        } catch (ex) { 
            hash = null;
        } 

        if (hash) {
            sha1 = function (buffer) {
                hash.update(buffer);
                var result = hash.digest('hex');

                hash = crypto.createHash('sha1');
                return result;
            };
        }
    }

    // Fallback on SHA1 optional dependency
    if (!sha1) {
        sha1 = tryLoad('sha1');
    }

    if (sha1 == null) throw Error('Could not load an SHA-1 implementation.');

    return sha1;
}


module.exports = {
    /** @type {function(Buffer | string): string } */
    sha1: loadSha1(),
}