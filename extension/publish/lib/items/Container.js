"use strict";

const util = require('util');
const LibraryItem = require('./LibraryItem');
const Command = require('../commands/Command');
const ContainerInstance = require('../instances/ContainerInstance');

/**
 * The single frame timeline
 * @class Container
 * @extends LibraryItem
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.assetId The resource id
 */
const Container = function(library, data)
{
    // Add the data to this object
    LibraryItem.call(this, library, data);

    /**
     * Collection of instances to render
     * @property {Array} instance
     */
    this.instances = this.getInstances();
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
p.getInstances = function()
{
    const library = this.library;
    const instancesMap = {};
    const instances = [];
    this.frames.forEach(function(frame)
    {
        frame.commands.forEach(function(command)
        {
            let instance = instancesMap[command.instanceId];

            if (!instance)
            {
                instance = library.createInstance(command.assetId, command.instanceId);
                instancesMap[command.instanceId] = instance;
            }

            // Add to the list of commands for this instance
            instance.addCommand(Command.create(command, frame.frame));

            // Add it if it hasn't been added already
            if (instances.indexOf(instance) == -1) 
            {
                instances.push(instance);
            }
        });
    });

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
    let instances = this.getInstances();
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

        children.reverse(); // reverse add child order
        let func = compress ? "ac" : "addChild";
        buffer += "this." + func + "(" + children.join(', ') + ");";
    }
    return buffer;
};

/**
 * Create a instance of this
 * @method create
 * @return {ContainerInstance} The new instance
 * @param {int} id Instance id
 */
p.create = function(id)
{
    return new ContainerInstance(this, id);
};

module.exports = Container;