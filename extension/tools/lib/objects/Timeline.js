"use strict";

const util = require('util');
const Renderable = require('./Renderable');

/**
 * The bitmap object
 * @class Timeline
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.id The resource id
 */
const Timeline = function(data)
{
    // Add the data to this object
    Renderable.call(this, data);
};

// Reference to the prototype
util.inherits(Timeline, Renderable);
const p = Timeline.prototype;

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.render = function(renderer)
{
    return renderer.template('timeline', {
        id: this.name,
        labels: this.getLabels(),
        contents: this.getInstances(renderer)
    });
};

/**
 * Render the object as a string
 * @method renderInstance
 * @param {Renderer} renderer
 * @return {string} buffer
 */
p.renderInstance = function(renderer, mode, startPosition, loop)
{
    return renderer.template('timeline-instance', {
        id: this.name,
        mode: mode,
        startPosition: startPosition,
        loop: loop
    });
};

/**
 * Get the collection of labels
 * @method getLabels
 * @return {object} The frame labels
 */
p.getLabels = function()
{
    let labels = {};

    this.frames.forEach(function(frame)
    {
        let label = frame["label:name"];
        if (label)
        {
            labels[label] = frame.frame;
        }
    });
    return labels;
};

/**
 * Get the collection of children to place
 * @method getInstances
 * @return {string} 
 */
p.getInstances = function(renderer)
{
    let instances = [];
    let foundItems = [];
    this.frames.forEach(function(frame)
    {
        frame.commands.forEach(function(cmd)
        {
            if (cmd.cmdType == "Place")
            {
                let libraryItem = renderer.library.getById(cmd.id);

                // Get only the unique children
                if (foundItems.indexOf(cmd.objectId) == -1)
                {
                    foundItems.push(cmd.objectId);
                    instances.push({
                        libraryItem: libraryItem,
                        cmd: cmd
                    });
                }
            }
        });
    });

    let buffer = "";

    // We have children to place
    if (instances.length)
    {
        let children = [];
        instances.forEach(function(instance)
        {
            let libraryItem = instance.libraryItem;
            let cmd = instance.cmd;
            let instanceName = "instance" + cmd.objectId;
            
            // Add the local instance name
            children.push(instanceName);

            // We have an instance name for this, probably movieclip
            if (cmd.instanceName)
            {
                instanceName += " = this." + cmd.instanceName;
            }

            // Add the instance name line
            buffer += "var " + instanceName + " = ";

            if (libraryItem instanceof Timeline)
            {
                buffer += libraryItem.renderInstance(renderer, 0, 0, cmd.loop);
                buffer += libraryItem.transform(cmd.transformMatrix);
            }
            else
            {
                buffer += libraryItem.renderInstance(renderer);
                buffer += libraryItem.transform(cmd.transformMatrix);
            }
            buffer += ";";
        });
        let func = renderer.library.meta.compressJS ? "ac" : "addChildren";
        buffer += "this." + func + "(" + children.join(', ') + ");";
    }
    return buffer;
};

module.exports = Timeline;