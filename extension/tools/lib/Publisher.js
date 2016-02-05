"use strict";

// Node modules
const fs = require('fs');
const path = require('path');
const BISON = require('bisonjs');
const mkdirp = require('mkdirp');
const Library = require('./Library');
const Renderer = require('./Renderer');
const UglifyJS = require('uglify-js');

/**
 * The application to publish the JSON data to JS output buffer
 * @class Publisher
 */
let Publisher = function(dataFile, debug)
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

    /**
     * The collection of assets to inject in the HTML page
     * @property {Array} _assetsToLoad
     * @private
     */
    let assetsToLoad = this._assetsToLoad = [];

    // Load the bitmaps
    this.library.bitmaps.forEach(function(bitmap)
    {
        assetsToLoad.push(bitmap.loadPath);
    });
};

// Reference to the prototype
let p = Publisher.prototype;

/**
 * Export the graphics
 * @method exportGraphics
 */
p.exportGraphics = function()
{
    const shapes = this.library.shapes;

    // No shapes, nothing to do here
    if (!shapes.length) return;

    // The output map of graphics
    let graphics = {};

    // Loop through each graphic and add to the map
    shapes.forEach(function(shape)
    {
        graphics[shape.name] = shape.draw;
    });

    const meta = this._data._meta;

    // Create the directory if it doesn't exist
    const baseUrl = path.resolve(process.cwd(), meta.imagesPath);
    mkdirp.sync(baseUrl);

    let filename;

    // Check to see if we should compact the shapes (use BSON file insetad)
    if (meta.compactShapes)
    {
        graphics = BISON.encode(graphics);
        filename = meta.stageName + "_graphics_.bson";
    }
    else
    {
        graphics = JSON.stringify(graphics, null, '  ');
        filename = meta.stageName + "_graphics_.json";
    }

    // Save the file data
    fs.writeFileSync(path.join(baseUrl, filename), graphics);

    // Add to the assets
    this._assetsToLoad.push("'" + meta.imagesPath + filename + "'");
};

/**
 * Update the PixiJS loader in the HTML page
 * @method updateLoader
 */
p.updateLoader = function()
{
    let meta = this._data._meta;

    // Update the html if we have exported it
    if (meta.htmlPath && this._assetsToLoad.length)
    {
        let htmlPath = path.join(process.cwd(), meta.htmlPath);
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Add the indentation to the output HTML file
        let split = ")\n                .add(";

        // Replace the assets token with the assets to load
        htmlContent = htmlContent.replace(
            '${assets}', 
            ".add(" + this._assetsToLoad.join(split) + ")"
        );

        // Overwrite the file
        fs.writeFileSync(htmlPath, htmlContent);
    }
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
    let meta = this._data._meta;

    this.exportGraphics();
    this.updateLoader();
    let buffer = this.renderer.render(meta.nameSpace);

    // If we should compress the output javascript
    if (meta.compressJS)
    {
        let result = UglifyJS.minify(buffer, {
            fromString: true
        });
        buffer = result.code;
    }

    // Save the output file
    let outputFile = path.join(process.cwd(), meta.outputFile);
    fs.writeFileSync(outputFile, buffer);

    console.log(buffer);

    this.destroy();
};

module.exports = Publisher;