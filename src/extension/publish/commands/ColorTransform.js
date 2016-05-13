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
 * Add the property to the current frames
 * @method toFrame
 * @param {Frame} frame
 */
p.toFrame = function(frame)
{
    frame.c = [
        this.r,
        round(this.rA),
        this.g,
        round(this.gA),
        this.b,
        round(this.bA)
    ];
    frame.a = Math.max(0, Math.min(1, this.a + this.aA))
};

function round(val)
{
    return DataUtils.toPrecision(val);
}

module.exports = ColorTransform;