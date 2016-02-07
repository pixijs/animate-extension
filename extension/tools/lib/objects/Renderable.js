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

/**
 * Convert a matrix into a transform call
 * @method transform
 * @return {string} buffer
 */
p.transform = function(matrix, compress)
{
    const func = compress ? 'tr' : 'setTransform';
    const x = round(matrix.tx);
    const y = round(matrix.ty);
    const scaleX = round(Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b));
    const scaleY = round(Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d));
    let skewX = round(Math.atan2(matrix.d, matrix.c) - Math.PI / 2);
    let skewY = round(Math.atan2(matrix.b, matrix.a));
    let rotation = 0;

    // if the skew x and y are the same, this is rotation
    if (skewX - skewY === 0)
    {
        rotation = skewX;
        skewX = 0;
        skewY = 0;
    }

    // Order of arguments for DisplayObject.setTransform
    let args = [x, y, scaleX, scaleY, rotation, skewX, skewY];
    
    // The default values, so we can remove any uncessary arguments
    const defaults = [0, 0, 1, 1, 0, 0, 0];

    let toRemove = 0;
    for (let i = defaults.length - 1; i >= 0; i--)
    {
        if (args[i] == defaults[i])
        {
            toRemove++;
            continue;
        }
        break;
    }
    
    if (toRemove < args.length)
    {
        // Remove the default arguments
        args.splice(args.length - toRemove, toRemove);
        return "." + func + "(" + args.join(', ') + ')'; 
    }
    else
    {
        return "";
    }
};

function round(val)
{
    return Math.round(val * 1000) / 1000;
}

module.exports = Renderable;