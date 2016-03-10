"use strict";

const Place = require('../commands/Place');
const Remove = require('../commands/Remove');
const Move = require('../commands/Move');

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
     * The collection of animation commands
     * @property {Array} commands
     */
    this.commands = [];

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
     * @property {Object} initPlace
     */
    this.initPlace = null;

    /**
     * The collection of keyframes
     * @property {Object} frames
     * @private
     */
    this.frames = {};

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
 * @method addCommand
 * @param {Object} command
 */
p.addCommand = function(command)
{
    if (!this.initPlace && command instanceof Place)
    {
        this.initPlace = command;
        this.startFrame = command.frame;
        this.instanceName = command.instanceName;
    }
    if (command instanceof Remove) {
        this.endFrame = command.frame;
    }

    let frame = this.frames[command.frame];
    if (!frame)
    {
        frame = this.frames[command.frame] = {};
    }

    // Implement the place and move command
    if (command instanceof Place || command instanceof Move)
    {
        let frame = this.frames[command.frame];
        if (!frame)
        {
            frame = this.frames[command.frame] = {};
        }
        Object.assign(frame, command.transform.toTween());
    }

    // Remove empty frames
    if (!Object.keys(frame).length) 
    {
        delete this.frames[command.frame];
    }

    // Check to see if this is animated
    if (Object.keys(this.frames).length > 1)
    {
        this.isAnimated = true;
    }

    this.commands.push(command);
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

    let initFrame, initFrameNum;
    let prevFrame = {
        a: 1,
        r: 0,
        x: 0,
        y: 0,
        sx: 1,
        sy: 1,
        kx: 0,
        ky: 0,
        v: true
    };

    const allKeys = [
        'a', // alpha
        'r', // rotation
        'x', // x position
        'y', // y position
        'sx', // scale x
        'sy', // scale y
        'kx', // skew x
        'ky', // skew y
        'v' // visibility
    ];

    let animProps = [];
    for (let index in this.frames)
    {
        let frame = this.frames[index];
        let cloneFrame = Object.assign({}, prevFrame, frame);
        
        // Copy the first frame so we can prune after we figure
        // all the properties that animate
        if (!initFrame) {
            initFrame = cloneFrame;
            initFrameNum  = index;
        }

        // De-duplicate the animated properties
        for (let i = 0, len = allKeys.length; i < len; i++) 
        {
            let k = allKeys[i];
            if (prevFrame[k] === frame[k]) 
            {
                delete frame[k];
            }
        }
        // Remove frames with no properties
        let keys = Object.keys(frame);
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

    // Update the initial frame with all the properites that are animated
    for (let k in initFrame)
    {
        // If not in the properties we're animate
        // then mreove
        if (animProps.indexOf(k) == -1)
        {
            delete initFrame[k];
        }
        this.frames[initFrameNum] = initFrame;
    }

    // No keyframes are animated
    if (!Object.keys(initFrame).length) {
        return null;
    }

    if (compress)
    {
        let result = [];
        for (let i in this.frames)
        {
            result.push(i + this.serializeFrame(this.frames[i]));
        }
        return `"${result.join(',')}"`;
    }
    else 
    {
        // Clean up the keys to reduce overhead
        return JSON.stringify(this.frames, null, '  ')
            .replace(/\"([^(\")"\d]+)\":/g,"$1:");
    }    
};

/**
 * Serialize the frame properties
 * @method serializeFrame
 * @param {Object} frame properties
 * @return {string} buffer out
 */
p.serializeFrame = function(frame)
{
    let buffer = "";
    for(let k in frame)
    {
        buffer += k + frame[k];
    }
    return buffer.replace(/([a-z])0\./g, "$1.");
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
    let buffer = "";
    const matrix = this.initPlace.transform;
    if (matrix)
    {
        const func = renderer.compress ? 'tr' : 'setTransform';
        const args = matrix.toTransform();
        if (args.length)
        {
            buffer = `.${func}(${args.join(', ')})`; 
        }
    }
    return buffer;
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