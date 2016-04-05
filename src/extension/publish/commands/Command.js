/**
 * The command object
 * @class Command
 * @constructor
 * @param {Object} data The command data
 * @param {string} data.type The type of command
 * @param {int} frame
 */
const Command = function(data)
{
    Object.assign(this, data);
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
 * Add values to a frame
 * @method toFrame
 * @param {Frame} frame
 */
p.toFrame = function()
{
    // override to have animation support this command
};

/** 
 * Create a command
 * @static
 * @method create
 * @param {Object} data Command data
 * @return {Command} new command instance
 */
Command.create = function(data)
{
    const commands = {
        BlendMode: require('./BlendMode'),
        ColorTransform: require('./ColorTransform'),
        Command: require('./Command'),
        Filter: require('./Filter'),
        Mask: require('./Mask'),
        Move: require('./Move'),
        Place: require('./Place'),
        Remove: require('./Remove'),
        Visibility: require('./Visibility'),
        ZOrder: require('./ZOrder')
    };

    var ClassRef = commands[data.type];
    if (!ClassRef)
    {
        throw new Error(`${data.type} is not a valid timeline command`);
    }
    return new ClassRef(data);
};

module.exports = Command;