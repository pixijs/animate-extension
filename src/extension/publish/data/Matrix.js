"use strict";

const DataUtils = require('../utils/DataUtils');

/**
 * The matrix object
 * @class Matrix
 * @constructor
 * @param {Object} matrix The transform matrix data
 * @param {Boolean} compress If we should compress
 */
const Matrix = function(matrix)
{
    /**
     * The x position
     * @property {Number} x
     */
    this.x = round(matrix.tx);

    /**
     * The y position
     * @property {Number} y
     */
    this.y = round(matrix.ty);

    /**
     * The scaleX amount
     * @property {Number} scaleX
     */
    this.scaleX = round(Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b));
    
    /**
     * The scaleY amount
     * @property {Number} scaleY
     */
    this.scaleY = round(Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d));
    
    const rawSkewX = (Math.atan2(matrix.d, matrix.c) - Math.PI / 2) * -1
    /**
     * The skewX amount in radians
     * @property {Number} skewX
     */
    if (rawSkewX > Math.PI)
    {
        // Sometimes skew is published with values between 180° and 360°.
        // Let's force them all to range -180° to 180°
        this.skewX = round(rawSkewX - Math.PI * 2);
    }
    else if (rawSkewX < -Math.PI)
    {
        this.skewX = round(rawSkewX + Math.PI * 2);
    }
    else
    {
        this.skewX = round(rawSkewX);
    }

    const rawSkewY = Math.atan2(matrix.b, matrix.a);
    /**
     * The skewY amount in radians
     * @property {Number} skewY
     */
    if (rawSkewY > Math.PI)
    {
        this.skewY = round(rawSkewY - Math.PI * 2);
    }
    else if (rawSkewY < -Math.PI)
    {
        this.skewY = round(rawSkewY + Math.PI * 2);
    }
    else
    {
        this.skewY = round(rawSkewY);
    }
    
    /**
     * The rotation amount in radians
     * @property {Number} rotation
     */
    this.rotation = 0;

    // if the skew x and y are the same, this is rotation
    if (this.skewX + this.skewY === 0 || (this.skewX === this.skewY && Math.abs(this.skewX) === round(Math.PI)))
    {
        this.rotation = this.skewY;
        this.skewX = 0;
        this.skewY = 0;
    }
};

// Extends the prototype
const p = Matrix.prototype;

/**
 * Render the object as a string
 * @method toObject
 * @return {object} Json representation of this class with pruned out arguments
 */
p.toTween = function()
{
    return {
        x: this.x,
        y: this.y,
        sx: this.scaleX,
        sy: this.scaleY,
        kx: this.skewX,
        ky: this.skewY,
        r: this.rotation
    };
};

function round(val)
{
    return DataUtils.toPrecision(val, 3);
}

module.exports = Matrix;