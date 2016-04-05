"use strict";

const util = require('util');
const LibraryItem = require('./LibraryItem');
const BitmapInstance = require('../instances/BitmapInstance');

/**
 * The bitmap object
 * @class Bitmap
 * @extends LibraryItem
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.assetId The resource id
 * @param {int} data.height The resource id
 * @param {int} data.width The resource id
 * @param {string} data.src The source file
 * @param {string} data.name The bitmap name
 */
const Bitmap = function(library, data)
{
    LibraryItem.call(this, library, data);
};

// Extends the prototype
util.inherits(Bitmap, LibraryItem);
const p = Bitmap.prototype;

/**
 * Create a instance of this
 * @method create
 * @return {BitmapInstance} The new instance
 * @param {int} id Instance id
 */
p.create = function(id)
{
    return new BitmapInstance(this, id);
};

/** 
 * The path to load with the load
 * @method render
 * @return {Array} buffer
 */
// p.render = function()
// {
//     return "'" + this.name + "', '" + this.src + "'";
// };

module.exports = Bitmap;