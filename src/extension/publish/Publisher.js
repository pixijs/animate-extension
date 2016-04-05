"use strict";

// Node modules
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const Library = require('./Library');
const Renderer = require('./Renderer');
const DataUtils = require('./utils/DataUtils');

/**
 * The application to publish the JSON data to JS output buffer
 * @class Publisher
 */
let Publisher = function(dataFile, compress, debug)
{
    // Change the current directory
    process.chdir(path.dirname(dataFile));

    /**
     * The data file to delete
     * @property {string} _dataFile
     */
    this._dataFile = dataFile;

    /** 
     * The data published from Flash
     * @property {Object} _data
     * @private
     */
    this._data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

    // override the compress
    if (compress)
    {
        this._data._meta.compressJS = true;
    }

    /**
     * The library of assets to publish
     * @property {Library} library
     */
    this.library = new Library(this._data);

    /**
     * The composer to render output
     * @property {Renderer} composer
     */
    this.renderer = new Renderer(this.library);

    /**
     * If we are running in debug mode
     * @property {Boolean} debug
     */
    this.debug = debug == undefined ? false : debug;
};

// Reference to the prototype
let p = Publisher.prototype;

/**
 * Export the graphics
 * @method exportImages
 */
p.exportImages = function()
{
    let assetsToLoad = this.library.stage.assets;

    // Get the images to export
    this.library.bitmaps.forEach(function(bitmap)
    {
        assetsToLoad.push([bitmap.name, bitmap.src]);
    });

    const shapes = this.library.shapes;
    const meta = this._data._meta;

    // No shapes, nothing to do here
    if (!shapes.length || !meta.imagesPath) return;

    // The output map of graphics
    let buffer = "";
    let filename;

    if (!meta.compactShapes)
    {
        filename = meta.stageName + ".shapes.json";
        let results = {};
        shapes.forEach(function(shape)
        {
            results[shape.name] = shape.draw;
        });
        buffer = DataUtils.readableShapes(results);
    }
    else
    {
        filename = meta.stageName + ".shapes.txt";
        shapes.forEach(function(shape, i)
        {
            buffer += shape.toString();

            // Separate each shape with a new line
            if (i < shapes.length - 1)
                buffer += "\n";
        });
    }

    // Create the directory if it doesn't exist
    const baseUrl = path.resolve(process.cwd(), meta.imagesPath);
    mkdirp.sync(baseUrl);

    // Save the file data
    fs.writeFileSync(path.join(baseUrl, filename), buffer);

    // Add to the assets
    assetsToLoad.push(meta.imagesPath + filename);
};

/**
 * Clean the stage
 * @method destroy
 */
p.destroy = function()
{
    if (!this.debug)
    {
        fs.unlinkSync(this._dataFile);
    }
    this._data = null;

    this.library.destroy();
    this.library = null;

    this.renderer.destroy();
    this.renderer = null;
};

/**
 * The main entry point for the publisher
 * @method run
 */
p.run = function()
{
    this.exportImages();
    const buffer = this.publish();
    this.destroy();
    return buffer;
};

/**
 * Save the output stream
 * @method publish
 */
p.publish = function()
{
    const meta = this._data._meta;

    // Get the javascript buffer
    let buffer = this.renderer.render();

    if (meta.compressJS)
    {
        // Run through uglify
        const UglifyJS = require('uglify-js');
        let result = UglifyJS.minify(buffer, {
            fromString: true 
        });
        buffer = result.code;
    }
    else
    {
        // Run through js beautifier
        const beautify = require('js-beautify').js_beautify;
        buffer = beautify(buffer, { 
            indent_size: 4,
            preserve_newlines: true,
            space_after_anon_function: true,
            brace_style: "collapse-preserve-inline",
            break_chained_methods: true
        });
    }

    // Save the output file
    let outputFile = path.join(process.cwd(), meta.outputFile);
    fs.writeFileSync(outputFile, buffer);

    return buffer;
};

module.exports = Publisher;