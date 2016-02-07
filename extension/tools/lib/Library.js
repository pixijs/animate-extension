"use strict";

const Bitmap = require('./objects/Bitmap');
const Shape = require('./objects/Shape');
const Text = require('./objects/Text');
const Timeline = require('./objects/Timeline');
const Stage = require('./objects/Stage');

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
        map[bitmap.id] = bitmap;
    });

    // Convert the shapes
    data.Shapes.forEach(function(shapeData)
    {
        const shape = new Shape(shapeData);
        shapes.push(shape);
        map[shape.id] = shape;
    });

    // Convert the shapes
    data.Texts.forEach(function(textData)
    {
        const text = new Text(textData);
        texts.push(text);
        map[text.id] = text;
    });

    data.Timelines.forEach(function(timelineData)
    {
        let timeline;
        if (timelineData.type == "stage")
            timeline = new Stage(timelineData);
        else
            timeline = new Timeline(timelineData);
        timelines.push(timeline);
        map[timeline.id] = timeline;
    });
};

// Reference to the prototype
const p = Library.prototype;

/**
 * Get an object by id
 * @method getById
 * @param {int} id The id of the object
 * @return {Object} The object to get by id
 */
p.getById = function(id)
{
    return this._mapById[id] || null;
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