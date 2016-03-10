"use strict";

const util = require('util');
const Instance = require('./Instance');

/**
 * The bitmap object
 * @class BitmapInstance
 * @extends Instance
 * @constructor
 * @param {LibraryItem} libraryItem The bitmap data
 * @param {int} id
 */
const BitmapInstance = function(libraryItem, id)
{
    Instance.call(this, libraryItem, id);
};

// Extends the prototype
util.inherits(BitmapInstance, Instance);
const p = BitmapInstance.prototype;

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.renderContent = function(renderer)
{
    return renderer.template('bitmap-instance', this.libraryItem.name);
};

module.exports = BitmapInstance;