"use strict";

const util = require('util');
const Instance = require('./Instance');
const DataUtils = require('../utils/DataUtils');

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

    this.paragraph = libraryItem.paras[0];
    this.style = this.paragraph.textRun[0].style;
    this.align = this.paragraph.alignment;

    /**
     * The name of the text instance
     * @property {String} instanceName
     */
    this.instanceName = libraryItem.behaviour.name || null;
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
    const style = this.style;
    const options = {};

    let fontStyle = style.fontStyle.replace("Style", "");

    // Convert names like "Arial Bold" to just "Arial"
    let fontName = style.fontName.replace(" " + fontStyle, '');

    // If the style is regular, ignore, else convert to "italic" or "bold"
    fontStyle = (fontStyle == "Regular") ? '' : fontStyle.toLowerCase() + " ";

    // If the font name has 
    fontName = fontName.indexOf(' ') > -1 ? `'${fontName}'` : fontName;

    // Construct the font name
    options.font = `${fontStyle}${style.fontSize}px ${fontName}`;
    
    // Check for default color
    if (style.fontColor != "#000000")
        options.fill = style.fontColor;
    
    // Add letterSpacing if we have it
    if (style.letterSpacing)
        options.letterSpacing = style.letterSpacing;

    if (this.align != 'left')
        options.align = this.align;

    return renderer.template('text-instance', {
        text: this.libraryItem.txt || "",
        options: DataUtils.stringifySimple(options)
    });
}

module.exports = TextInstance;