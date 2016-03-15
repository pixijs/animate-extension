"use strict";

const util = require('util');
const Command = require('./Command');
const DataUtils = require('../utils/DataUtils');

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
    Object.assign(this, this.colorMatrix);
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
 * @property {Boolean} isSimpleTint
 */
Object.defineProperty(p, 'isSimpleTint', 
{
    get: function() {
        return this.rA === 0 && this.gA === 0 && this.bA === 0 &&
            this.r >= 0 && this.g >= 0 && this.b >= 0;
    }
});

/**
 * Get the alpha, adds the additive alpha as well
 * @property {Number} alpha from 0 to 1
 */
Object.defineProperty(p, 'alpha', 
{
    get: function() {
        return Math.max(0, Math.min(1, this.a + this.aA));
    }
});

/**
 * Add the property to the current frames
 * @method toFrame
 * @param {Frame} frame
 */
p.toFrame = function(frame)
{
    if (this.isSimpleTint)
    {
        frame.a = this.alpha;
        frame.t = this.tint;
    }
    else
    {
        frame.c = [
            this.r,
            round(this.rA),
            this.g,
            round(this.gA),
            this.b,
            round(this.bA)
        ];
        frame.a = this.alpha;
    }
};

function round(val)
{
    return DataUtils.toPrecision(val);
}

module.exports = ColorTransform;