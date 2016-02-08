"use strict";

const util = require('util');
const LibraryItem = require('./LibraryItem');
const ShapeInstance = require('../instances/ShapeInstance');


/**
 * The bitmap object
 * @class Shape
 * @extends LibraryItem
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.id The resource id
 * @param {int} data.paths The resource paths
 */
const Shape = function(data)
{
    // Add the data to this object
    LibraryItem.call(this, data);

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
util.inherits(Shape, LibraryItem);
const p = Shape.prototype;

/**
 * Create a instance of this
 * @method create
 * @return {ShapeInstance} The new instance
 */
p.create = function(commands)
{
    return new ShapeInstance(this, commands);
};

module.exports = Shape;