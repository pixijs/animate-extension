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
const Text = function(data)
{
    // Add the data to this object
    LibraryItem.call(this, data);
};

// Reference to the prototype
util.inherits(Text, LibraryItem);
const p = Text.prototype;

/**
 * Create a instance of this
 * @method create
 * @return {ShapeInstance} The new instance
 */
p.create = function(commands)
{
    return new TextInstance(this, commands);
};

module.exports = Text;