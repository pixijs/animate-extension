/**
 * The command object
 * @class Command
 * @constructor
 * @param {Object} data The command data
 * @param {string} data.type The type of command
 * @param {int} frame
 */
const Command = function(data, frame)
{
    Object.assign(this, data);

    /**
     * Zero-based frame number
     * @property {int} frame
     */
    this.frame = frame;
};

const p = Command.prototype;

/**
 * @method toString
 * @return {String}
 */
p.toString = function()
{
    return "[Command (type:" + this.type + ")]";
};

/** 
 * Create a command
 * @static
 * @method create
 */
Command.create = function(data, frame)
{
    var ClassRef = require('./' + data.type);
    return new ClassRef(data, frame);
};

module.exports = Command;