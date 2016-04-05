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

const STYLE_PROPS = {
    font : 'o',
    fill : 'i',
    align : 'a',
    stroke : 's',
    strokeThickness : 't',
    wordWrap : 'w',
    wordWrapWidth : 'd',
    lineHeight : 'l',
    dropShadow : 'h',
    dropShadowColor : 'c',
    dropShadowAngle : 'n',
    dropShadowBlur : 'b',
    padding : 'p',
    textBaseline : 'x',
    lineJoin : 'j',
    miterLimit : 'm',
    letterSpacing : 'e'
};

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.renderContent = function(renderer, undefined)
{
    const style = this.style;
    const options = {};
    const compress = renderer.compress;

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

    // Replace the long names with the shortened names
    if (compress)
    {
        for(var k in STYLE_PROPS)
        {
            if (options[k] !== undefined)
            {
                options[STYLE_PROPS[k]] = options[k];
                delete options[k];
            }
        }
    }

    let buffer = renderer.template('text-instance', {
        text: this.libraryItem.txt || ""
    });

    // Add the style setter
    let setStyle = compress ? 'ss' : 'setStyle';
    buffer += `.${setStyle}(${DataUtils.stringifySimple(options)})`;

    if (this.align != 'left')
    {
        // Add the special alignment
        const isCenter = this.align == 'center';
        const alignValue = isCenter ? 0 : 1;
        const func = compress ? 'g' : 'setAlign';
        const align = compress ? `${alignValue}` : `"${this.align}"`;
        buffer += `.${func}(${align})`;

        // Adjust the x position based on the bounds
        const width = this.initFrame.bounds.width;
        this.initFrame.x += isCenter ? width / 2 : width; 
    }
    return buffer;
}

module.exports = TextInstance;