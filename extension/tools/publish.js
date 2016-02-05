"use strict";

// Load the data file
const dataFile = process.argv[2];
const debug = process.argv[3] == "--debug";

if (!dataFile) 
{
    console.log("Error: Second argument must be path to Flash output");
    process.exit(1);
}

// Main entry point for the application
const Publisher = require('./lib/publisher');
const publisher = new Publisher(dataFile, debug);
publisher.run();