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
     * @param {string} value 
     */
    addHeader(name, value) {
        this.addAny('header', name, value);
    }

    
    /**
     * Adds data to the header category
     * @param {string} name 
     * @param {string} value 
     */
    addRom(name, value) {
        this.addAny('rom', name, value);
    }


    /**
     * Adds data to the specified category
     * @param {string} category 
     * @param {string} name 
     * @param {string} value  
     */
    addAny(category, name, value) {
        this.data.push({
            category: category,
            label: name,
            value: value
        });
    }

    getData() {
        // return new array of clones        
        return this.data.map(item => Object.assign({}, item));
    }
}

export default ExtendedData;