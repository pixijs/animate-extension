"use strict";

const util = require('util');
const Renderable = require('./Renderable');

/**
 * The bitmap object
 * @class Shape
 * @extends Renderable
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.id The resource id
 * @param {int} data.paths The resource paths
 */
const Shape = function(data)
{
    // Add the data to this object
    Renderable.call(this, data);

    /**
     * The name of this shape
     * @property {string} name
     */
    this.name = "Shape" + this.id;

    /**
     * The list of draw commands
     * @property {Array} draw
     */
    let draw = this.draw = [];

    // Conver the data into drawing commands
    for(let j = 0, len = this.paths.length; j < len; j++) 
    {
        if (j > 0) 
        {
            draw.push("cp");
        }
        let path = this.paths[j];

        // Adding a stroke
        if (path.stroke) 
        {
            draw.push("s", path.thickness, path.color, path.alpha);
        } 
        else 
        {
            draw.push("f", path.color, path.alpha);
        }

        path.d.forEach(function(command, k, commands) 
        {
            if (typeof command == "number") 
            {
                // round the number
                commands[k] = Math.round(command * 100) / 100;
            }
        });

        // Add the draw commands
        draw.push.apply(draw, path.d)
    }
};

// Reference to the prototype
util.inherits(Shape, Renderable);
const p = Shape.prototype;

/**
 * Render the element
 * @method renderInstance
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.renderInstance = function(renderer)
{
    return renderer.template('shape-instance', {
        name: this.name,
        func: renderer.compress ? "d" : "drawCommands"
    });
};

module.exports = Shape;