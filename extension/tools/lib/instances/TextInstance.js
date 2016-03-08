"use strict";

const util = require('util');
const Instance = require('./Instance');

/**
 * The text object
 * @class TextInstance
 * @extends Instance
 * @constructor
 * @param {Text} libraryItem
 * @param {int} id
 */
const TextInstance = function(libraryItem, id)
{
    // Add the data to this object
    Instance.call(this, libraryItem, id);
};

// Reference to the prototype
util.inherits(TextInstance, Instance);
const p = TextInstance.prototype;

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.renderContent = function(renderer)
{
    const style = this.paras[0].textRun[0].style;
    return renderer.template('text-instance', {
        text: this.txt,
        fontSize: style.fontSize,
        fontName: style.fontName,
        fontColor: style.fontColor.substr(1)
    });
}

module.exports = TextInstance;