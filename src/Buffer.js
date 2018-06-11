/*
    Buffer Polyfill

    The Buffer class is required by the 'sha1' module to support binary data.
    It also provides useful functionality (.slice returning an object that shares
    memory with the original).

*/

var buffer;

function getBufferPolyfill() {
    function Buffer(x, y, z) {
        var result = new Uint8Array(x, y, z);
        Object.setPrototypeOf(result, Buffer.prototype);
        return result;
    }
    Buffer.prototype = Object.create(Uint8Array.prototype);
    Buffer.prototype.constructor = Buffer;
    Buffer.isBuffer =
    Buffer.prototype.isBuffer = function (obj) {
        return obj instanceof Uint8Array; 
    }
    Buffer.prototype.slice = function (start, end) {
        var s = start, e = end;

        if (arguments.length == 0) {
            s = this.byteOffset;
            e = this.byteLength + this.byteOffset;
        } else if (arguments.length == 1) {
            e = this.byteLength + this.byteOffset;
        }

        return new Uint8Array(this.buffer, s, e - s);
    }

    return Buffer;
}

if (typeof Buffer === 'undefined') {
    buffer = getBufferPolyfill();
} else {
    buffer = Buffer;
}

export default buffer;