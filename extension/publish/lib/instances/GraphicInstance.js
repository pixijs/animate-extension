"use strict";

const util = require('util');
const Instance = require('./Instance');

// const INDEPENDENT = 0;
const SINGLE_FRAME = 1;
const SYNCHED = 2;

/**
 * The bitmap object
 * @class GraphicInstance
 * @extends Instance
 * @constructor
 * @param {LibraryItem} libraryItem The bitmap data
 * @param {int} id
 */
const GraphicInstance = function(libraryItem, id)
{
    Instance.call(this, libraryItem, id);

    this.mode = this.libraryItem.frames.length > 1 ? SYNCHED : SINGLE_FRAME;
};

// Extends the prototype
util.inherits(GraphicInstance, Instance);
const p = GraphicInstance.prototype;

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.renderContent = function(renderer)
{
    let mode = this.mode;
    if (!renderer.compress)
    {
        mode = mode == SYNCHED ? "MovieClip.SYNCHED" : "MovieClip.SINGLE_FRAME";
    }
    return renderer.template('graphic-instance', {
        id: this.libraryItem.name,
        mode: mode
    });
};

module.exports = GraphicInstance;