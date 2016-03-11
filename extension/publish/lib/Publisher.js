"use strict";

// Node modules
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const Library = require('./Library');
const Renderer = require('./Renderer');

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

    /**
     * The collection of assets to inject in the HTML page
     * @property {Array} _assetsToLoad
     * @private
     */
    let assetsToLoad = this._assetsToLoad = [];

    // Load the bitmaps
    this.library.bitmaps.forEach(function(bitmap)
    {
        assetsToLoad.push(bitmap.render());
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
        buffer = JSON.stringify(results)
            // Custom render for pretty graphics lib
            .replace("{", "{\n  ")
            .replace("]}", "\n  ]\n}")
            .replace(/\:/g, ': ')
            .replace(/,/g, ', ')
            .replace(/(\"[a-z])/g, "\n    $1")
            .replace(/\],/g, "],\n  ");
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
    this.exportGraphics();
    this.updateLoader();
    this.publish();
    this.destroy();
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

    console.log(buffer);
};

module.exports = Publisher;