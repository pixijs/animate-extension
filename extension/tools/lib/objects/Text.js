"use strict";

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
const p = Text.prototype = Object.create(Renderable.prototype);

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.render = function(renderer)
{
    const style = this.paras.textRun.style;
    return renderer.template('text', {
        text: this.txt,
        fontSize: style.fontSize,
        fontName: style.fontName,
        fontColor: style.fontColor.substr(1)
    });
}

module.exports = Text;