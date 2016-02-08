"use strict";

const util = require('util');
const Container = require('./Container');
const TimelineInstance = require('../instances/TimelineInstance');

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
    Container.call(this, data);
};

// Reference to the prototype
util.inherits(Timeline, Container);
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
        contents: this.getContents(renderer)
    });
};

/**
 * Get all contents
 * @method getContents 
 * @param {Renderer} renderer
 * @return {string} buffer
 */
p.getContents = function(renderer)
{
    return this.getChildren(renderer) + this.getFrameScripts(renderer);
};

/**
 * Get all the frame scripts
 * @method getFrameScripts 
 * @param {Renderer} renderer
 * @return {string} buffer
 */
p.getFrameScripts = function(renderer)
{
    let buffer = "";
    let scriptFrames = [];
    this.frames.forEach(function(f)
    {
        if (f.scripts)
        {
            scriptFrames.push(f);
        }
    });

    if (scriptFrames.length)
    {
        let addAction = renderer.compress ? 'aa' : 'addAction';

        buffer += "this";
        scriptFrames.forEach(function(f)
        {
            f.scripts.forEach(function(s)
            {
                let script = s.script.replace(/\\n/g, "\n");
                buffer += "." + addAction + "(function(){\n" + script + "}, " + f.frame + ")";
            });
        });
        buffer += ";";
    }
    return buffer;
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
 * Create a instance of this
 * @method create
 * @return {TimelineInstance} The new instance
 */
p.create = function(commands)
{
    return new TimelineInstance(this, commands);
};

module.exports = Timeline;