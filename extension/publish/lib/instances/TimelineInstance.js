"use strict";

const util = require('util');
const Instance = require('./Instance');

const INDEPENDENT = 0;
const SINGLE_FRAME = 1;
const SYNCHED = 2;

/**
 * The bitmap object
 * @class TimelineInstance
 * @extends Instance
 * @constructor
 * @param {LibraryItem} libraryItem The bitmap data
 * @param {int} id
 */
const TimelineInstance = function(libraryItem, id)
{
    Instance.call(this, libraryItem, id);

    this.mode = INDEPENDENT;

    if (libraryItem.type == 'graphic')
    {
        this.mode = this.libraryItem.frames.length > 1 ? SYNCHED : SINGLE_FRAME;
    }
};

// Extends the prototype
util.inherits(TimelineInstance, Instance);
const p = TimelineInstance.prototype;

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.renderContent = function(renderer)
{
    const options = {};

    if (this.mode != INDEPENDENT) {
        options.mode = this.mode;
    }
    if (!this.initPlace.loop) {
        options.loop = false;
    }

    return renderer.template('timeline-instance', {
        id: this.libraryItem.name,
        options: Object.keys(options).length ? options : ''
    });
};

module.exports = TimelineInstance;