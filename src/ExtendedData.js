import { HexValue } from "./util";

/*
    Extended Data

    Used to accumulate miscellaneous data about a ROM.
*/
// @ts-check

class ExtendedData {
    constructor() {
        /** @type {{category: string, label: string, value: string}[]} */
        this.data = [];
    }

    /**
     * Adds data to the header category
     * @param {string} name 
     * @param {string | HexValue} value 
     */
    addHeader(name, value) {
        this.addAny('header', name, value.toString());
    }

    
    /**
     * Adds data to the header category
     * @param {string} name 
     * @param {string | HexValue} value 
     */
    addRom(name, value) {
        this.addAny('rom', name, value.toString());
    }


    /**
     * Adds data to the specified category
     * @param {string} category 
     * @param {string} name 
     * @param {string | HexValue} value  
     */
    addAny(category, name, value) {
        this.data.push({
            category: category,
            label: name,
            value: value.toString()
        });
    }

    getData() {
        // return new array of clones        
        return this.data.map(item => Object.assign({}, item));
    }
}

export default ExtendedData;