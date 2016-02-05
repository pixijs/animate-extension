"use strict";

const util = require('util');
const Renderable = require('./Renderable');

/**
 * The bitmap object
 * @class Bitmap
 * @extends Renderable
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.id The resource id
 * @param {int} data.height The resource id
 * @param {int} data.width The resource id
 * @param {string} data.src The source file
 * @param {string} data.name The bitmap name
 */
const Bitmap = function(data)
{
    Renderable.call(this, data);
};

// Extends the prototype
util.inherits(Bitmap, Renderable);
const p = Bitmap.prototype;

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.render = function(renderer)
{
    return renderer.template('bitmap', this.name);
};

/**
 * Render the object as a string
 * @method renderInstance
 * @param {Renderer} renderer
 * @return {string} buffer
 */
p.renderInstance = function(renderer)
{
    return renderer.template('bitmap-instance', this.name);
};

/** 
 * The path to load with the load
 * @property {string} loadPath
 * @readOnly
 */
Object.defineProperty(p, "loadPath", 
{
    get: function()
    {
        return "'" + this.name + "', '" + this.src + "'";
    }
});

module.exports = Bitmap;