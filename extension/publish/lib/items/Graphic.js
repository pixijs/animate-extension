"use strict";

const util = require('util');
const Timeline = require('./Timeline');
const GraphicInstance = require('../instances/GraphicInstance');

/**
 * The bitmap object
 * @class Graphic
 * @extends Timeline
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.assetId The resource id
 */
const Graphic = function(library, data)
{
    // Add the data to this object
    Timeline.call(this, library, data);
};

// Reference to the prototype
util.inherits(Graphic, Timeline);
const p = Graphic.prototype;

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.render = function(renderer)
{
    return renderer.template(renderer.compress ? 'graphic-tiny' : 'graphic', {
        id: this.name,
        duration: this.totalFrames,
        contents: this.getContents(renderer)
    });
};

/**
 * Create a instance of this
 * @method create
 * @return {GraphicInstance} The new instance
 * @param {int} id Instance id
 */
p.create = function(id)
{
    return new GraphicInstance(this, id);
};

module.exports = Graphic;