"use strict";

const DataUtils = require('../utils/DataUtils');

/**
 * The rectangle object
 * @class Rectangle
 * @constructor
 * @param {Object} matrix The transform matrix data
 * @param {Boolean} compress If we should compress
 */
const Rectangle = function(rect)
{
    /**
     * The x position
     * @property {Number} x
     */
    this.x = round(rect.x);

    /**
     * The y position
     * @property {Number} y
     */
    this.y = round(rect.y);

    /**
     * The width amount
     * @property {Number} width
     */
    this.width = round(rect.width);
    
    /**
     * The height amount
     * @property {Number} height
     */
    this.height = round(rect.height);
};

function round(val)
{
    return DataUtils.toPrecision(val, 2);
}

module.exports = Rectangle;