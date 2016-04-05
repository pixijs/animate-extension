"use strict";

const util = require('util');
const Command = require('./Command');

/**
 * The command object
 * @class Filter
 * @extends Command
 * @constructor
 * @param {Object} data The command data
 * @param {string} data.type The type of command
 * @param {int} frame
 */
const Filter = function(data, frame)
{
    Command.call(this, data, frame);
};

util.inherits(Filter, Command);

module.exports = Filter;