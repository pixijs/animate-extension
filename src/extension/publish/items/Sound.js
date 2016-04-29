"use strict";

const util = require('util');
const LibraryItem = require('./LibraryItem');
const SoundInstance = require('../instances/SoundInstance');

/**
 * The bitmap object
 * @class Sound
 * @extends LibraryItem
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.assetId The resource id
 * @param {int} data.height The resource id
 * @param {int} data.width The resource id
 * @param {string} data.src The source file
 * @param {string} data.name The bitmap name
 */
const Sound = function(library, data)
{
    LibraryItem.call(this, library, data);
};

// Extends the prototype
util.inherits(Sound, LibraryItem);
const p = Sound.prototype;

/**
 * Create a instance of this
 * @method create
 * @return {BitmapInstance} The new instance
 * @param {int} id Instance id
 */
p.create = function(id)
{
    return new SoundInstance(this, id);
};

module.exports = Sound;