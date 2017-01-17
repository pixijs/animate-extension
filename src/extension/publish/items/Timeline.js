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

    /**
     * Buffer to end with like addChild and addTimedChild
     * @property {String} postBuffer
     * @private
     */
    this.postBuffer = '';
};

// Reference to the prototype
util.inherits(Timeline, Container);
const p = Timeline.prototype;

/**
 * The stage type identifier
 * @property {String} STAGE
 * @static
 * @final
 * @readOnly
 * @default "stage"
 */
Timeline.STAGE = "stage";

/**
 * The graphic type identifier
 * @property {String} GRAPHIC
 * @static
 * @final
 * @readOnly
 * @default "graphic"
 */
Timeline.GRAPHIC = "graphic";

/**
 * The movieclip type identifier
 * @property {String} MOVIE_CLIP
 * @static
 * @final
 * @readOnly
 * @default "movieclip"
 */
Timeline.MOVIE_CLIP = "movieclip";

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

/**
 * Override, get the contents
 * @method getContents
 * @param {Renderer} renderer
 * @return {string}
 */
p.getContents = function(renderer)
{
    const buffer = Container.prototype.getContents.call(this, renderer);

    this.getFrameScripts(renderer);

    if (this.postBuffer)
    {
        this.postBuffer = `this${this.postBuffer};`;
    }
    return buffer + this.postBuffer;
};

/**
 * Render either a mask or normal instance
 * @method renderInstance
 */
p.renderInstance = function(renderer, instance)
{
    const compress = renderer.compress;
    const totalFrames = this.totalFrames;

    // Get the masks for this instance
    let masks = this.getMaskFrames(instance);

    // If we only have one mask and it covers everything
    let isSingleMask = (masks instanceof Instance);
    let maskInstance = null;

    // Add the mask instance for this
    if (isSingleMask)
    {
        maskInstance = masks.localName;
    }

    // Add multiple masks for this instance
    if (masks && !isSingleMask)
    {
        let maskFunc = compress ? 'am' : 'addTimedMask';
        this.postBuffer += `.${maskFunc}(${instance.localName}, {\n`
        for(let i in masks)
        {
            let name = masks[i] !== null ? masks[i].localName : null;
            this.postBuffer += `"${i}": ${name},`;
        }
        // Remove the comma-dangle!
        this.postBuffer = this.postBuffer.slice(0, -1);
        this.postBuffer += `})`;
    }

    // Get the duration of the instance (how long it's on stage)
    let duration = instance.getDuration(totalFrames);           
    let frames = instance.getFrames(renderer.compress);
    const func = compress ? 'at' : 'addTimedChild';

    // If the child doesn't change
    if (!frames && instance.startFrame === 0 && duration == totalFrames)
    {
        // Don't mix addChild and addTimedChild, z-index gets all messed
        if (totalFrames > 1)
        {
            this.postBuffer += `.${func}(${instance.localName})`;
        }
        else
        {
            this.addChildren.push(instance.localName);
        }
    }
    else
    {
        this.postBuffer += `.${func}(${instance.localName}, ${instance.startFrame}, ${duration}`;
        this.postBuffer += !frames ? `)` : `, ${frames})`;
    }
    return instance.render(renderer, maskInstance);
};

/**
 * Get the mask frames for an instance
 * @method getMaskFrames
 * @param {Instance} instance
 * @return {Instance|Object|null} Either the single mask instance, or the object
 */
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
 * Get all the frame scripts
 * @method getFrameScripts
 * @param {Renderer} renderer
 * @return {string} buffer
 */
p.getFrameScripts = function(renderer)
{
    const library = this.library;
    let scriptFrames = [];

    this.frames.forEach(function(f)
    {
        if (f.scripts)
        {
            scriptFrames.push(f);
        }

        if (f.commands && f.commands.length)
        {
            const playSound = renderer.compress ? 'ps' : 'playSound';

            f.commands.filter((command) => command.type === 'SoundPlace')
                .forEach((command) => {
                    const sound = library.createInstance(
                        command.assetId,
                        command.instanceId
                    );
                    scriptFrames.push({
                        frame: f.frame,
                        scripts: [
                            `this.${playSound}('${sound.libraryItem.name}'${sound.loop ? ', true' : ''});`
                        ]
                    });
                });
        }
    });

    if (scriptFrames.length)
    {
        let addAction = renderer.compress ? 'aa' : 'addAction';

        for(let i = 0; i < scriptFrames.length; i++)
        {
            let frame = scriptFrames[i];
            let scripts = frame.scripts;
            for (let j = 0; j < scripts.length; j++)
            {
                let script = scripts[j].replace(/\\n/g, "\n");
                this.postBuffer += `.${addAction}(function(){\n${script}}, ${frame.frame})`;
            }
        }
    }
};

/**
 * Get the collection of labels
 * @method getLabels
 * @return {object} The frame labels
 */
p.getLabels = function()
{
    let result = {};

    this.frames.forEach(function(frame)
    {
        if (frame.labels)
        {
            frame.labels.forEach(function(label)
            {
                result[label] = frame.frame;
            });
        }
    });
    return result;
};

/**
 * Get the collection of sounds
 * @method getSounds
 * @return {object} The sound objects
 */
p.getSounds = function()
{
    const library = this.library;
    let result = {};

    this.frames.forEach(function(f)
    {
        if (f.commands) {
            f.commands
                .filter((cmd) => cmd.type === 'SoundPlace')
                .forEach((cmd) => {
                    const instance = library.createInstance(cmd.assetId, cmd.instanceId);
                    const {name, src} = instance.libraryItem;
                    result[name] = src;
                });
        }
    });
    return result;
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