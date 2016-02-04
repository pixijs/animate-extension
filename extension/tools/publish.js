"use strict";

// Node modules
let fs = require('fs');
let path = require('path');

// Internal modules
let Graphics = require('./graphics');
let Bitmaps = require('./bitmaps');
let Loader = require('./loader');
let JSBuffer = require('./js-buffer');

// Read in the datafile
let args = process.argv;
let dataFile = args[2];
let data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

// Change the current directory
process.chdir(path.dirname(dataFile));

// The look for library assets (graphics and images)
let library = {};

// The list of assets to load in the HTML pages
let assets = [];

// Save the graphics
Graphics(data, library, assets);
Bitmaps(data, library, assets);
Loader(assets, data._meta.htmlPath);
JSBuffer(data, library);

// Cleanup the datafile
fs.unlinkSync(dataFile);