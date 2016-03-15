"use strict";

const Command = require('../commands/Command');
const Frame = require('./Frame');
const DataUtils = require('../utils/DataUtils');

/**
 * The instance renderable object
 * @class Instance
 * @constructor
 * @param {LibraryItem} libraryItem
 */
const Instance = function(libraryItem, id)
{
    /**
     * The unique instanceId within a timeline
     * @property {int} id
     */
    this.id = id;

    /** 
     * The name of the item
     * @property {string} name
     */
    this.localName = "instance" + id;

    /** 
     * The instance name, if named
     * @property {string} instanceName
     */
    this.instanceName = null;

    /**
     * The first frame to start showing
     * @property {int} startFrame
     * @default 0
     */
    this.startFrame = 0;

    /**
     * The number of frames to show
     * @property {int} endFrame
     * @default -1
     */
    this.endFrame = -1;

    /**
     * The library reference
     * @property {LibraryItem} libraryItem
     */
    this.libraryItem = libraryItem;

    /** 
     * Initially place the item
     * @property {Frame} initFrame
     */
    this.initFrame = null;

    /**
     * The collection of keyframes
     * @property {Object} frames
     * @private
     */
    this.frames = {};

    /**
     * If this should loop
     * @property {Boolean} loop
     */
    this.loop = false;

    /** 
     * If this instance is animated
     * @property {Boolean} isAnimated
     * @default false
     * @private
     */
    this.isAnimated = false;
};

// Reference the prototype
const p = Instance.prototype;

/**
 * Add an command to the object
 * @method addToFrame
 * @param {int} frame Frame to add to
 * @param {Object} command Current command data
 */
p.addToFrame = function(frameIndex, command)
{
    // Convert into a typed command
    command = Command.create(command);

    if (command.type == "Place")
    {
        this.loop = !!command.loop;
        this.startFrame = frameIndex;
        if (!this.instanceName && command.instanceName)
            this.instanceName = command.instanceName;
    }
    else if (command.type == "Remove")
    {
        this.endFrame = frameIndex;
    }

    let frame = this.frames[frameIndex];
    if (!frame)
    {
        frame = this.frames[frameIndex] = new Frame();
    }

    // The command should add properties to the current frame
    frame.addCommand(command);

    // Remove empty frames
    if (!Object.keys(frame).length) 
    {
        delete this.frames[frameIndex];
    }
    else if (!this.initFrame)
    {
        this.initFrame = frame;
    }

    // Check to see if this is animated
    if (Object.keys(this.frames).length > 1)
    {
        this.isAnimated = true;
    }
};

/**
 * Get the duration of this item on the stage
 * @method getDuration
 * @param {int} totalFrames The total frames of parent
 * @return {int} Duration in frames
 */
p.getDuration = function(totalFrames)
{
    return this.endFrame > 0 ? 
        this.endFrame - this.startFrame : 
        totalFrames - this.startFrame;
};

/**
 * Remove values duplicated from the previous frame
 * @method getFrames
 * @param {Boolean} compress
 * @return {String|null} Either the collection of frames or null if no frames
 */
p.getFrames = function(compress)
{
    // If we're not animated, don't do anything
    if (!this.isAnimated)
    {
        return null;
    }

    let firstFrame;
    let prevFrame = Frame.DEFAULT_VALUES;

    const allKeys = Object.keys(prevFrame);

    let animProps = [];
    for (let index in this.frames)
    {
        let frame = this.frames[index];
        let cloneFrame = Object.assign({}, prevFrame, frame.toJSON());
        
        // Don't touch the first frame
        if (!firstFrame) {
            firstFrame = frame;

            // Check for non-default properties and add to the list of valid
            // animation properties
            frame.validKeys.forEach(function(k)
            {
                if (prevFrame[k] !== frame[k])
                {
                    animProps.push(k);
                }
            });
            prevFrame = cloneFrame;
            continue;
        }

        // De-duplicate the animated properties
        for (let i = 0, len = allKeys.length; i < len; i++) 
        {
            let k = allKeys[i];
            if (prevFrame[k] === frame[k]) 
            {
                frame[k] = null;
            }
        }
        // Remove frames with no properties
        let keys = frame.validKeys;
        if (!keys.length)
        {
            delete this.frames[index];
        } 
        else
        {
            // Add the animated keys
            for (let i = 0; i < keys.length; i++)
            {
                let k = keys[i];
                if (animProps.indexOf(k) == -1)
                {
                    animProps.push(k);
                }
            }
        }

        // Property remember all the values of the current frame
        prevFrame = cloneFrame;
    }

    // Clean props that we don't use
    firstFrame.clean(animProps);

    // No keyframes are animated
    if (!firstFrame.hasValues)
    {
        return null;
    }

    if (compress)
    {
        let result = [];
        for (let i in this.frames)
        {
            result.push(i + this.frames[i].serialize());
        }
        return `"${result.join(' ')}"`;
    }
    else 
    {
        return DataUtils.stringifySimple(this.frames);
    }    
};

/**
 * Render the object as a string
 * @method renderBegin
 * @return {string} buffer
 */
p.renderBegin = function()
{
    let buffer = "";
    let instanceName = this.localName;

    // We have an instance name for this, probably movieclip
    if (this.instanceName)
    {
        instanceName += ` = this.${this.instanceName}`;
    }

    // Add the instance name line
    buffer += `var ${instanceName} = `;
    return buffer;
};

/**
 * Render the object as a string
 * @method renderEnd
 * @param {Renderer} renderer
 * @return {string} buffer
 */
p.renderEnd = function(renderer)
{
    if (!this.isAnimated && this.initFrame)
    {
        return this.initFrame.render(renderer);
    }
    return '';
};  

/**
 * Render the object as a string
 * @method renderContent
 * @param {Renderer} renderer
 * @return {string} buffer
 */
p.renderContent = function()
{
    throw "Must override";
};

/**
 * Render the object as a string
 * @method render
 * @param {Renderer} renderer
 * @param {Boolean} isAnimated
 * @return {string} buffer
 */
p.render = function(renderer)
{
    let buffer = "";
    buffer += this.renderBegin(renderer);
    buffer += this.renderContent(renderer);
    buffer += this.renderEnd(renderer);
    return `${buffer};`;
};

module.exports = Instance;