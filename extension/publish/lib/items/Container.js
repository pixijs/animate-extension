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
const Container = function(library, data)
{
    // Add the data to this object
    LibraryItem.call(this, library, data);

    /**
     * Get the instances by id
     * @property {Object} instancesMap
     */
    this.instancesMap = {};

    /**
     * The collection of masks
     * @property {Array} masks
     */
    this.masks = [];

    /**
     * Collection of instances to render
     * @property {Array} instances
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
 * Handler for the mask added event
 * @method onMaskAdded
 * @param {Mask} command Mask command
 * @param {int} frame index
 */
p.onMaskAdded = function(command, frame)
{
    const mask = this.instancesMap[command.instanceId];
    const instance = this.instancesMap[command.maskTill];
    // console.log("maskAdded", instance, mask, frame);
    this.masks.push({
        instance: instance,
        mask: mask,
        frame: frame
    });
};

/**
 * Handler for the mask removed event
 * @method onMaskRemoved
 * @param {Mask} command Mask command
 * @param {int} frame index
 */
p.onMaskRemoved = function(command, frame)
{
    const mask = this.instancesMap[command.instanceId];
    // console.log("maskRemoved", command, frame);
    this.masks.forEach(function(entry)
    {
        if (entry.mask === mask)
        {
            entry.duration = frame - entry.frame;
        }
    });
};

/**
 * Get the collection of children to place
 * @method getInstances
 * @return {array<Instance>} Collection of instance objects 
 */
p.getInstances = function()
{
    const library = this.library;
    const instancesMap = this.instancesMap;
    const instances = [];
    const onMaskAdded = this.onMaskAdded.bind(this);
    const onMaskRemoved = this.onMaskRemoved.bind(this);
    this.frames.forEach(function(frame)
    {
        frame.commands.forEach(function(command)
        {
            let instance = instancesMap[command.instanceId];

            if (!instance)
            {
                instance = library.createInstance(command.assetId, command.instanceId);
                instancesMap[command.instanceId] = instance;

                instance.on('maskAdded', onMaskAdded);
                instance.on('maskRemoved', onMaskRemoved); 
            }

            // Add to the list of commands for this instance
            instance.addToFrame(frame.frame, command);

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
    let buffer = "";

    // We have children to place
    if (this.instances.length)
    {
        let children = [];
        this.instances.forEach(function(instance)
        {
            // Add the static child instance
            children.push(instance.localName);

            // Render the instance
            buffer += instance.render(renderer);
        });

        children.reverse(); // reverse add child order
        let func = compress ? "ac" : "addChild";
        buffer += `this.${func}(${children.join(', ')});`;
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