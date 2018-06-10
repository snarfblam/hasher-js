/*
    This module implements ROM DB logic and can be swapped out as appropriate
    depending on the environment, e.g. it may be possible to use an AJAX function
    that can directly return the title for a hash.

    Usage:
        
        import getDB from 'romDB.js';
        var sha1Value = 'abc123yourHashHere';

        getDB('NES')
            .then(db => db.getTitle(sha1Value))
            .then(title => console.log(title));
*/

import axios from 'axios';

var dbs = {};
var dbNameValidator = /^[a-zA-Z0-9 ]*$/;

/**
 * @typedef {Object} RomDB
 * @property {function(string): Promise<string>} getTitle
 */

/** Returns a promise that resolves to a RomDB.
 *  Throws if the specified name is invalid or not found.
 *  @param {string} name Platform name
 *  @returns {Promise<RomDB>}
 */
function getDB(name) {
    var db = dbs[name];
    if (db) return db;

    if (!dbNameValidator.test(name)) return Promise.reject(Error('Invalid platform database name.'));

    // HACK: for testing in node
    if (typeof window === 'undefined') {
        db = require('./db/' + name + '.json');
        db.getTitle = getTitle;
        return Promise.resolve(db);
    }

    return axios.get('db/' + name + '.json')
        .then(response => {
            if (response.status == 200) {
                db = JSON.parse(response.data);
                db.getTitle = getTitle;
                return db;
            } else {
                return Promise.reject(new Error('Received a status of ' + response.status + ' requesting the database'));
            }
        });
}


/** Method on ROM DB. Returns a promise that
 * resolves to the title associated with the given ROM hash, or null if not found.
 * Does not reject.
 *  @param {*} sha1_hex
 *  @returns {Promise<string>}
 */
function getTitle(sha1_hex) {
    return Promise.resolve(this[sha1_hex.toUpperCase()] || null);
}

// module.exports = getDB;
export default getDB;