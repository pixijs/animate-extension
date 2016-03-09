"use strict";

const Place = require('../commands/Place');

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
     * The library reference
     * @property {LibraryItem} libraryItem
     */
    this.libraryItem = libraryItem;

    /** 
     * Initially place the item
     * @property {Object} initPlace
     */
    this.initPlace = null;
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
        this.instanceName = command.instanceName;
    }
    this.commands.push(command);
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
    const matrix = this.initPlace.transform;
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