"use strict";

/**
 * The abstarct library object
 * @class LibraryItem
 * @constructor
 * @param {Object} data The bitmap data
 */
const LibraryItem = function(library, data)
{
    if(data.name){
        data.name = data.name.replace(/[^A-Za-z 0-9_]/g, '_');
    }
    // Add the data to this object
    Object.assign(this, data);

    /**
     * Reference to the library
     * @property Library
     */
    this.library = library;
};

// Reference the prototype
const p = LibraryItem.prototype;

/**
 * Render the object as a string
 * @method create
 * @param {Array} commands
 * @return {Instance} The instance to create
 */
p.create = function()
{
    throw "Must override";
};

module.exports = LibraryItem;
