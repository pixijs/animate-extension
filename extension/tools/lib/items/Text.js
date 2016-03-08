"use strict";

const util = require('util');
const LibraryItem = require('./LibraryItem');
const TextInstance = require('../instances/TextInstance');

/**
 * The text object
 * @class Text
 * @extends LibraryItem
 * @constructor
 * @param {Object} data
 */
const Text = function(library, data)
{
    // Add the data to this object
    LibraryItem.call(this, library, data);
};

// Reference to the prototype
util.inherits(Text, LibraryItem);
const p = Text.prototype;

/**
 * Create a instance of this
 * @method create
 * @return {ShapeInstance} The new instance
 * @param {int} id Instance id
 */
p.create = function(id)
{
    return new TextInstance(this, id);
};

module.exports = Text;