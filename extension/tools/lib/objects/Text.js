"use strict";

const util = require('util');
const Renderable = require('./Renderable');

/**
 * The text object
 * @class Text
 * @extends Renderable
 * @constructor
 * @param {Object} data The bitmap data
 * @param {int} data.id The resource id
 * @param {String} data.txt The text content
 */
const Text = function(data)
{
    // Add the data to this object
    Renderable.call(this, data);
};

// Reference to the prototype
util.inherits(Text, Renderable);
const p = Text.prototype;

/**
 * Render the element
 * @method renderInstance
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.renderInstance = function(renderer)
{
    const style = this.paras[0].textRun[0].style;
    return renderer.template('text-instance', {
        text: this.txt,
        fontSize: style.fontSize,
        fontName: style.fontName,
        fontColor: style.fontColor.substr(1)
    });
}

module.exports = Text;