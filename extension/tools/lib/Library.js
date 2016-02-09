"use strict";

const Bitmap = require('./items/Bitmap');
const Shape = require('./items/Shape');
const Text = require('./items/Text');
const Timeline = require('./items/Timeline');
const Container = require('./items/Container');
const Stage = require('./items/Stage');

/**
 * Handle the converting of data assets to typed objects
 * @class Library
 */
const Library = function(data)
{
    /**
     * The collection of Bitmap objects
     * @property {Array} bitmaps
     */
    const bitmaps = this.bitmaps = [];

    /**
     * The collection of Shape objects
     * @property {Array} shapes
     */
    const shapes = this.shapes = [];

    /**
     * The collection of Text objects
     * @property {Array} texts
     */
    const texts = this.texts = [];

    /**
     * The collection of Timeline objects
     * @property {Array} timelines
     */
    const timelines = this.timelines = [];

    /**
     * The look-up of the asset by ID
     * @property {Object} _mapById
     * @private
     */
    const map = this._mapById = {};

    /**
     * The build settings
     * @property {Object} meta
     */
    this.meta = data._meta;

    // Convert the bitmaps
    data.Bitmaps.forEach(function(bitmapData)
    {
        const bitmap = new Bitmap(bitmapData);
        bitmaps.push(bitmap);
        map[bitmap.assetId] = bitmap;
    });

    // Convert the shapes
    data.Shapes.forEach(function(shapeData)
    {
        const shape = new Shape(shapeData);
        shapes.push(shape);
        map[shape.assetId] = shape;
    });

    // Convert the shapes
    data.Texts.forEach(function(textData)
    {
        const text = new Text(textData);
        texts.push(text);
        map[text.assetId] = text;
    });

    data.Timelines.forEach(function(timelineData)
    {
        let timeline;
        if (timelineData.totalFrames <= 1)
            timeline = new Container(timelineData);
        if (timelineData.type == "stage")
            timeline = new Stage(timelineData);
        else
            timeline = new Timeline(timelineData);
        timelines.push(timeline);
        map[timeline.assetId] = timeline;
    });
};

// Reference to the prototype
const p = Library.prototype;

/**
 * Get an object by id
 * @method getInstanceByCommands
 * @param {Array} commands The collection of commands
 * @return {Instance} The instance object
 */
p.getInstanceByCommands = function(commands)
{
    const id = commands[0].assetId; // first place command
    const libraryItem = this._mapById[id];
    return libraryItem.create(commands);
};

/**
 * Don't use after this
 * @method destroy
 */
p.destroy = function()
{
    this.shapes.length = 0;
    this.shapes = null;

    this.bitmaps.length = 0;
    this.bitmaps = null;
    
    this._mapById = null;
};

module.exports = Library;