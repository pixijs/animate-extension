"use strict";

const Renderable = require('./Renderable');

/**
 * The bitmap object
 * @class Timeline
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.id The resource id
 */
const Timeline = function(data)
{
    // Add the data to this object
    Renderable.call(this, data);
};

// Reference to the prototype
const p = Timeline.prototype = Object.create(Renderable.prototype);

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.render = function(renderer)
{
    return renderer.template('movieclip', {
        id: this.name,
        contents: ''
    });
};

module.exports = Timeline;