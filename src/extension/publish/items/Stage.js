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
const Stage = function(library, data, framerate)
{
    // Add the data to this object
    Timeline.call(this, library, data);

    /**
     * The default framerate
     * @property {int} framerate
     */
    this.framerate = framerate;

    /**
     * The list of assets to load
     * @property {Array} assets
     */
    this.assets = {};
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
    let options = {
        duration: this.totalFrames,
        framerate: this.framerate
    };
    const labels = this.getLabels();

    if (!renderer.loopTimeline) {
        options.loop = false;
    }

    let hasLabels = !!Object.keys(labels).length;
    if (hasLabels) {
        options.labels = labels;
    }

    return renderer.template(renderer.compress ? 'stage-tiny': 'stage', {
        id: this.name,
        options: options,
        duration: this.totalFrames,
        framerate: this.framerate,
        loop: renderer.loopTimeline,
        assets: JSON.stringify(this.assets, null, '  '),
        labels: hasLabels ? ', ' + JSON.stringify(labels) : '',
        contents: this.getContents(renderer)
    });
};

module.exports = Stage;