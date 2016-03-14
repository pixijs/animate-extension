"use strict";

const util = require('util');
const Command = require('./Command');

/**
 * The command object
 * @class ColorTransform
 * @extends Command
 * @constructor
 * @param {Object} data The command data
 * @param {string} data.type The type of command
 * @param {int} frame
 */
const ColorTransform = function(data, frame)
{
    Command.call(this, data, frame);

    var matrix = this.colorMatrix;

    // Transform
    this.r = matrix[0];
    this.r0 = matrix[1];
    this.b = matrix[2];
    this.b0 = matrix[3];
    this.g = matrix[4];
    this.g0 = matrix[5];
    this.a = matrix[6];
    this.a0 = matrix[7];
};

util.inherits(ColorTransform, Command);

const p = ColorTransform.prototype;

/**
 * Convert the multiplicative color to a tint color
 * @property {String} tint
 */
Object.defineProperty(p, 'tint',
{
    get: function() {
        const max = 255;
        const r = Math.round(this.r * max);
        const b = Math.round(this.g * max);
        const g = Math.round(this.b * max);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
});

/**
 * If we have additive color and should use a ColorFilter
 * @property {Boolean} hasAdditive
 */
Object.defineProperty(p, 'hasAdditive', 
{
    get: function() {
        return this.r0 !== 0 || this.g0 !== 0 || this.b0 !== 0;
    }
});

/**
 * Get the alpha, adds the additive alpha as well
 * @property {Number} alpha from 0 to 1
 */
Object.defineProperty(p, 'alpha', 
{
    get: function() {
        return Math.max(0, Math.min(1, this.a + this.a0));
    }
});

/**
 * Add the property to the current frames
 * @method toFrame
 * @param {Frame} frame
 */
p.toFrame = function(frame)
{
    // if (!this.hasAdditive)
    // {
        frame.a = this.alpha;
    //     frame.t = this.tint;
    // }
    // else
    // {
        // colorTransform
        // frame.c = [
        //     this.r,
        //     this.r0,
        //     this.g,
        //     this.g0,
        //     this.b,
        //     this.b0,
        //     this.a,
        //     this.a0
        // ];
    // }
};

module.exports = ColorTransform;