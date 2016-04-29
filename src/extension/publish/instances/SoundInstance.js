"use strict";

const util = require('util');
const Instance = require('./Instance');

/**
 * The bitmap object
 * @class SoundInstance
 * @extends Instance
 * @constructor
 * @param {LibraryItem} libraryItem The bitmap data
 * @param {int} id
 */
const SoundInstance = function(libraryItem, id)
{
    Instance.call(this, libraryItem, id);
};

// Extends the prototype
util.inherits(SoundInstance, Instance);
const p = SoundInstance.prototype;

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.renderContent = function()
{
    return '';
};

module.exports = SoundInstance;