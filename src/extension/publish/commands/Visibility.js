"use strict";

const util = require('util');
const Command = require('./Command');

/**
 * The command object
 * @class Visibility
 * @extends Command
 * @constructor
 * @param {Object} data The command data
 * @param {string} data.type The type of command
 * @param {int} frame
 */
const Visibility = function(data, frame)
{
    Command.call(this, data, frame);
};

util.inherits(Visibility, Command);

const p = Visibility.prototype;

/**
 * Add values to a frame
 * @method toFrame
 * @param {Frame} frame
 */
p.toFrame = function(frame)
{
    frame.v = this.visibility ? 1 : 0;
};

module.exports = Visibility;