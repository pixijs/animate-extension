"use strict";

const Matrix = require('../data/Matrix');

/**
 * The instance renderable object
 * @class Instance
 * @constructor
 * @param {LibraryItem} libraryItem
 * @param {Array} commands
 */
const Instance = function(libraryItem, commands)
{
    /**
     * The unique instanceId within a timeline
     * @property {int} id
     */
    this.id = commands[0].instanceId;

    /** 
     * The name of the item
     * @property {string} name
     */
    this.localName = "instance" + this.id;

    /** 
     * The instance name, if named
     * @property {string} instanceName
     */
    this.instanceName = null;

    /** 
     * The collection of animation commands
     * @property {Array} commands
     */
    this.commands = commands;

    /**
     * The library reference
     * @property {LibraryItem} libraryItem
     */
    this.libraryItem = libraryItem;

    /** 
     * Initially place the item
     * @property {Object} initAdd
     */
    this.initAdd = null;

    /** 
     * The initial transform
     * @property {Matrix} initTransform
     */
    this.initTransform = null;

    // Get the first place command
    for(let i = 0, cmd, len = commands.length; i < len; i++)
    {
        cmd = commands[i];
        if (cmd.type == "Add")
        {
            this.initAdd = cmd;
            this.initTransform = new Matrix(cmd.transform);
            this.instanceName = cmd.instanceName || null;
            break;
        }
    }
};

// Reference the prototype
const p = Instance.prototype;

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
        instanceName += " = this." + this.instanceName;
    }

    // Add the instance name line
    buffer += "var " + instanceName + " = ";
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
    const matrix = this.initTransform;
    if (matrix)
    {
        const func = renderer.compress ? 'tr' : 'setTransform';
        const args = matrix.toTransform();
        if (args.length)
        {
            buffer = "." + func + "(" + args.join(', ') + ')'; 
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
 * @return {string} buffer
 */
p.render = function(renderer)
{
    let buffer = "";
    buffer += this.renderBegin(renderer);
    buffer += this.renderContent(renderer);
    buffer += this.renderEnd(renderer);
    return buffer + ";";
};

module.exports = Instance;