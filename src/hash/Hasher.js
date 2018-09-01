// @ts-check

/**
 * Interface of a hash function provider.
 * @interface
 */
class Hasher {
    constructor() {
        throw Error("Not implemented");
    }

    /**
     * @returns {HasherObject}
     */
    create() {
        throw Error("Not implemented");
    }
}


/**
 * Interface of an object that performs hashing
 * @interface
 */

class HasherObject{
    constructor() {
        throw Error("Not implemented");
    }

    /**
     * 
     * @param {Uint8Array | ArrayBuffer | string | any[]} data 
     */
    update(data) {
        throw Error("Not implemented");
    }

    /**
     * @returns {string}
     */
    hex() {
        throw Error("Not implemented");
    }
}

export { Hasher, HasherObject };