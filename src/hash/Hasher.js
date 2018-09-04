/*
    Defines the Hasher and HasherObject interfaces

    This exists purely for //@ts-check
*/

// @ts-check

/**
 * @typedef {Object} Hasher
 * @property {function(): HasherObject} create
 */

 /**
  * @typedef {Object} HasherObject
  * @property {function(Uint8Array | ArrayBuffer | string | any[]): void} update
  * @property {function(): string} hex
  */


export default null;