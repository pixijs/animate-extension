"use strict";

const util = require('util');
const Command = require('./Command');
const Matrix = require('../data/Matrix');
const Rectangle = require('../data/Rectangle');

/**
 * The command object
 * @class Place
 * @extends Command
 * @constructor
 * @param {Object} data The command data
 * @param {string} data.type The type of command
 * @param {int} frame
 */
const Place = function(data, frame)
{
    Command.call(this, data, frame);

    // Convert to matrix
    this.transform = new Matrix(this.transform);

    // Check for bounds and convert to rectangle
    if (this.bounds)
    {
        this.bounds = new Rectangle(this.bounds);
    }

    // Default to null for the instance name
    this.instanceName = this.instanceName || null;
};

util.inherits(Place, Command);

const p = Place.prototype;

/**
 * Add values to a frame
 * @method toFrame
 * @param {Frame} frame
 */
p.toFrame = function(frame)
{
    Object.assign(frame, this.transform.toTween());
    frame.bounds = this.bounds;
};

module.exports = Place;