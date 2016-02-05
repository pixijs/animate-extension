"use strict";

/**
 * The renderable object
 * @class Renderable
 * @constructor
 * @param {Object} data The bitmap data
 */
const Renderable = function(data)
{
    // Add the data to this object
    Object.assign(this, data);
};

// Reference the prototype
const p = Renderable.prototype;

/**
 * Render the object as a string
 * @method render
 * @param {Renderer} renderer
 * @return {string} buffer
 */
p.render = function()
{
    throw "Must override";
};

/**
 * Render the object as a string
 * @method renderInstance
 * @param {Renderer} renderer
 * @return {string} buffer
 */
p.renderInstance = function()
{
    throw "Must override";
};

module.exports = Renderable;