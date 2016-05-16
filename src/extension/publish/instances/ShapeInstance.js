"use strict";

const util = require('util');
const Instance = require('./Instance');

/**
 * The bitmap object
 * @class ShapeInstance
 * @extends Instance
 * @constructor
 * @param {LibraryItem} libraryItem The bitmap data
 * @param {int} id
 */
const ShapeInstance = function(libraryItem, id)
{
    Instance.call(this, libraryItem, id);
};

// Extends the prototype
util.inherits(ShapeInstance, Instance);
const p = ShapeInstance.prototype;

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.renderContent = function(renderer)
{
    return renderer.template('shape-instance', {
        id: this.libraryItem.id,
        stageName: renderer.stageName,
        func: renderer.compress ? "d" : "drawCommands"
    });
};

module.exports = ShapeInstance;