"use strict";

const util = require('util');
const LibraryItem = require('./LibraryItem');
const ContainerInstance = require('../instances/ContainerInstance');

/**
 * The single frame timeline
 * @class Container
 * @extends LibraryItem
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.assetId The resource id
 */
const Container = function(data)
{
    // Add the data to this object
    LibraryItem.call(this, data);
};

// Reference to the prototype
util.inherits(Container, LibraryItem);
const p = Container.prototype;

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.render = function(renderer)
{
    return renderer.template('container', {
        id: this.name,
        contents: this.getChildren(renderer)
    });
};

/**
 * Get the collection of children to place
 * @method getInstances
 * @return {array} Collection of instance objects 
 */
p.getInstances = function(renderer)
{
    let commandsMap = {};
    let foundItems = [];
    this.frames.forEach(function(frame)
    {
        frame.commands.forEach(function(cmd)
        {
            // Get only the unique children for this timeline
            if (foundItems.indexOf(cmd.instanceId) == -1)
            {                    
                foundItems.push(cmd.instanceId);
                let commands = commandsMap[cmd.instanceId];
                if (!commands)
                {
                    commands = commandsMap[cmd.instanceId] = [];
                }
                // Add the frame number to the command
                cmd.frame = frame.frame;

                // Add to the list of commands for this instance
                commands.push(cmd);
            }
            
        });
    });

    let instances = [];

    // Loop through the commands by object
    for (let instanceId in commandsMap)
    {
        let commands = commandsMap[instanceId];
        instances.push(renderer.library.getInstanceByCommands(commands));
    }
    return instances;
};

/** 
 * Convert instance to add child calls
 * @method getChildren
 * @return {string} Buffer of add children calls
 */
p.getChildren = function(renderer)
{
    const compress = renderer.compress;
    let instances = this.getInstances(renderer);
    let buffer = "";

    // We have children to place
    if (instances.length)
    {
        let children = [];
        instances.forEach(function(instance)
        {
            // TODO: replace with frames
            children.push(instance.localName);

            // Render the instance
            buffer += instance.render(renderer);
        });

        let func = compress ? "ac" : "addChild";
        buffer += "this." + func + "(" + children.join(', ') + ");";
    }
    return buffer;
};

/**
 * Create a instance of this
 * @method create
 * @return {ContainerInstance} The new instance
 */
p.create = function(commands)
{
    return new ContainerInstance(this, commands);
};

module.exports = Container;