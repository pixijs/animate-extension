"use strict";

const util = require('util');
const Container = require('./Container');
const TimelineInstance = require('../instances/TimelineInstance');

/**
 * The bitmap object
 * @class Timeline
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.assetId The resource id
 */
const Timeline = function(library, data)
{
    // Add the data to this object
    Container.call(this, library, data);
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
    const options = {
        duration: this.totalFrames
    };
    const labels = this.getLabels();
    if (Object.keys(labels).length) 
    {
        options.labels = labels;
    }
    return renderer.template('timeline', {
        id: this.name,
        options: options,
        contents: this.getContents(renderer)
    });
};

/** 
 * Convert instance to add child calls
 * @method getChildren
 * @return {string} Buffer of add children calls
 */
p.getChildren = function(renderer)
{
    const compress = renderer.compress;
    const totalFrames = this.totalFrames;
    let buffer = "";
    let postBuffer = "";

    // We have children to place
    if (this.instances.length)
    {
        postBuffer += "this";
        this.instances.forEach(function(instance)
        {
            buffer += instance.render(renderer);

            // Get the duration of the instance (how long it's on stage)
            let duration = instance.endFrame > 0 ? 
                instance.endFrame - instance.startFrame : 
                totalFrames - instance.startFrame;

            let func = compress ? 'af' : 'addChildFrames';
            let frames = JSON.stringify(instance.getFrames(), null, compress ? '' : '  ')
                .replace(/\"([^(\")"\d]+)\":/g,"$1:");
            postBuffer += `.${func}(${instance.localName}, ${instance.startFrame}, ${duration}, ${frames})`;
        });
        postBuffer += ';';
    }
    return buffer + postBuffer;
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
 * @param {int} id Instance id
 */
p.create = function(id)
{
    return new TimelineInstance(this, id);
};

module.exports = Timeline;