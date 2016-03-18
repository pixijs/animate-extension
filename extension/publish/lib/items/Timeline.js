"use strict";

const util = require('util');
const Container = require('./Container');
const TimelineInstance = require('../instances/TimelineInstance');
const Instance = require('../instances/Instance');

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
    let hasLabels = !!Object.keys(labels).length;
    if (hasLabels) 
    {
        options.labels = labels;
    }
    return renderer.template(renderer.compress ? 'timeline-tiny' : 'timeline', {
        id: this.name,
        options: options,
        duration: this.totalFrames,
        labels: hasLabels ? ', ' + JSON.stringify(labels) : '',
        contents: this.getContents(renderer)
    });
};

p.getMaskFrames = function(instance)
{
    const result = {};
    this.masks.forEach(function(entry)
    {
        if (entry.instance === instance)
        {
            const duration = entry.duration || 0;
            const startFrame = entry.frame;
            const endFrame = startFrame + duration;
            result[startFrame] = entry.mask;
            if (duration && !result[endFrame])
            {
                result[endFrame] = null;
            }
        }
    });
    const len = Object.keys(result).length;
    if (len === 1)
    {
        return result[0];
    }
    else if (len > 1)
    {
        return result;
    }
    else
    {
        return null;
    }
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
    const isAnimated = totalFrames > 1;
    let buffer = "";
    let postBuffer = "";

    // We have children to place
    if (this.instances.length)
    {
        let addChildren = [];
        postBuffer += "this";

        // Add the frame scripts frame scripts cannot be added without
        // instances
        postBuffer += this.getFrameScripts(renderer);

        this.instances.forEach(function(instance)
        {
            let masks = this.getMaskFrames(instance);
            let isSingleMask = (masks instanceof Instance);
            let maskInstance = null;
            if (isSingleMask)
                maskInstance = masks.localName;
            buffer += instance.render(renderer, maskInstance);

            // Get the duration of the instance (how long it's on stage)
            let duration = instance.getDuration(totalFrames);           
            let frames = instance.getFrames(compress);
            const func = compress ? 'at' : 'addTimedChild';

            // If the child doesn't change
            if (!frames && instance.startFrame === 0 && duration == totalFrames)
            {
                // Don't mix addChild and addTimedChild, z-index gets all messed
                if (isAnimated)
                {
                    postBuffer += `.${func}(${instance.localName})`;
                }
                else
                {
                    addChildren.push(instance.localName);
                }
            }
            else
            {
                postBuffer += `.${func}(${instance.localName}, ${instance.startFrame}, ${duration}`;
                postBuffer += !frames ? `)` : `, ${frames})`;
            }

            if (masks && !isSingleMask)
            {
                let maskFunc = compress ? 'am' : 'addTimedMask';
                postBuffer += `.${maskFunc}(${instance.localName}, {\n`
                for(let i in masks)
                {
                    let name = masks[i] ? masks[i].localName : null;
                    postBuffer += `"${i}": ${name},`;
                }
                // Remove the comma-dangle!
                postBuffer = postBuffer.slice(0, -1);
                postBuffer += `})`;
            }
        }
        .bind(this));

        // Add static children this needs to happen at the end
        // because addChild doesn't return the instance of the container
        // it returns the first instance
        if (addChildren.length)
        {
            addChildren.reverse();
            const func = compress ? 'ac' : 'addChild';
            postBuffer += `.${func}(${addChildren.join(', ')})`;
        }

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
    return this.getChildren(renderer);
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

        scriptFrames.forEach(function(f)
        {
            f.scripts.forEach(function(s)
            {
                let script = s.replace(/\\n/g, "\n");
                buffer += "." + addAction + "(function(){\n" + script + "}, " + f.frame + ")";
            });
        });
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