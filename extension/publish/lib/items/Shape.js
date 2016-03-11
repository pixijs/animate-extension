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
 * @param {int} data.assetId The resource id
 * @param {int} data.paths The resource paths
 */
const Shape = function(library, data)
{
    // Add the data to this object
    LibraryItem.call(this, library, data);

    /**
     * The name of this shape
     * @property {string} name
     */
    this.name = "";

    let draw = [];

    // Conver the data into drawing commands
    for(let j = 0, len = this.paths.length; j < len; j++) 
    {
        let path = this.paths[j];

        // Adding a stroke
        if (path.stroke) 
        {
            draw.push("f", 0, 0); // transparent fill
            draw.push("s", path.thickness, path.color, path.alpha);
        } 
        else 
        {
            draw.push("f", 
                path.color === undefined ? 0 : path.color, 
                path.alpha === undefined ? 1 : path.alpha
            );
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

    /**
     * The list of draw commands
     * @property {Array} draw
     */
    this.draw = draw;
};

// Reference to the prototype
util.inherits(Shape, LibraryItem);
const p = Shape.prototype;

/**
 * Create a instance of this
 * @method create
 * @return {ShapeInstance} The new instance
 * @param {int} id Instance id
 */
p.create = function(id)
{
    return new ShapeInstance(this, id);
};

/**
 * @method toString
 * @return {string} the string of this
 */
p.toString = function()
{
    return this.name + " " + this.draw.join(" ");
};

module.exports = Shape;