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
const Stage = function(data)
{
    // Add the data to this object
    Timeline.call(this, data);
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
    return renderer.template('stage', {
        id: this.name,
        labels: this.getLabels(),
        contents: this.getContents(renderer),
        loop: renderer.loopTimeline
    });
};

module.exports = Stage;