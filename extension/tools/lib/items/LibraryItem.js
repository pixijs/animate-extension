"use strict";

/**
 * The abstarct library object
 * @class LibraryItem
 * @constructor
 * @param {Object} data The bitmap data
 */
const LibraryItem = function(data)
{
    // Add the data to this object
    Object.assign(this, data);
};

// Reference the prototype
const p = LibraryItem.prototype;

/**
 * Render the object as a string
 * @method render
 * @param {Renderer} renderer
 * @return {string} buffer
 */
p.render = function()
{
    throw "Must override";
};

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