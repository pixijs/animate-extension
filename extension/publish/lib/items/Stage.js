"use strict";

const util = require('util');
const Timeline = require('./Timeline');

/**
 * The bitmap object
 * @class Stage
 * @extends Timeline
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.assetId The resource id
 */
const Stage = function(library, data)
{
    // Add the data to this object
    Timeline.call(this, library, data);
};

// Reference to the prototype
util.inherits(Stage, Timeline);
const p = Stage.prototype;

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.render = function(renderer)
{
    const options = {
        duration: this.totalFrames
    };
    const labels = this.getLabels();

    if (!renderer.loopTimeline) {
        options.loop = false;
    }

    if (Object.keys(labels).length) {
        options.labels = labels;
    }

    return renderer.template('stage', {
        id: this.name,
        options: options,
        contents: this.getContents(renderer)
    });
};

module.exports = Stage;