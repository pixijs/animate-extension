"use strict";

const DataUtils = require('../utils/DataUtils');

const TweenProp = function(data)
{
    this.start = round(data.start);
    this.end = round(data.end);
    this.easeType = data.easeType;
    this.easeStrength = data.easeStrength;
}

/**
 * An object describing a single geometric tween
 * @class Tween
 * @constructor
 * @param {Object} tween The data for an individual tween.
 */
const Tween = function (tween) {

    /**
     * The start frame for the tween
     * @property {number} startFrame
     */
    this.startFrame = tween.start;

    /**
     * The end frame for the tween
     * @property {number} endFrame
     */
    this.endFrame = tween.end;

    /**
     * The x position tween data
     * @property {Object} x
     */
    this.x = tween.x ? new TweenProp(tween.x) : null;

    /**
     * The y position tween data
     * @property {Object} y
     */
    this.y = tween.y ? new TweenProp(tween.y) : null;

    /**
     * The scaleX tween data
     * @property {Object} scaleX
     */
    this.scaleX = tween.scaleX ? new TweenProp(tween.scaleX) : null;

    /**
     * The scaleY tween data
     * @property {Object} scaleY
     */
    this.scaleY = tween.scaleY ? new TweenProp(tween.scaleY) : null;

    /**
     * The skewX tween data
     * @property {Object} skewX
     */
    this.skewX = tween.skewX ? new TweenProp(tween.skewX) : null;

    /**
     * The skewY tween data
     * @property {Object} skewY
     */
    this.skewY = tween.skewY ? new TweenProp(tween.skewY) : null;

    /**
     * The rotation tween data
     * @property {Object} rotation
     */
    this.rotation = tween.rotation ? new TweenProp(tween.rotation) : null;
};

// Extends the prototype
const p = Tween.prototype;

p.toJSON = function()
{
    const output = {
        d: this.endFrame - this.startFrame,
        p: {},
        // TODO: set up this
        e: null,
    };
    if (this.x) output.p.x = this.x.end;
    if (this.y) output.p.y = this.y.end;
    if (this.scaleX) output.p.sx = this.scaleX.end;
    if (this.scaleY) output.p.sy = this.scaleY.end;
    if (this.rotation) output.p.r = this.rotation.end;
    if (this.skewX) output.p.kx = this.skewX.end;
    if (this.skewY) output.p.ky = this.skewY.end;
    return output;
};

/**
 * Checks if a transform matches the start of the tween.
 * @method transformMatchesStart
 * @param {Frame} frame The matrix to compare against.
 * @return {boolean} If there is a match
 */
p.transformMatchesStart = function(frame)
{
    if (this.x && this.x.start !== frame.x) return false;
    if (this.y && this.y.start !== frame.y) return false;
    if (this.scaleX && this.scaleX.start !== frame.sx) return false;
    if (this.scaleY && this.scaleY.start !== frame.sy) return false;
    if (this.rotation && this.rotation.start !== frame.r) return false;
    if (this.skewX && this.skewX.start !== frame.kx) return false;
    if (this.skewY && this.skewY.start !== frame.ky) return false;
    return true;
};

/**
 * Checks if a transform matches the end of the tween.
 * @method transformMatchesEnd
 * @param {Matrix} matrix The matrix to compare against.
 * @return {boolean} If there is a match
 */
p.matrixMatchesEnd = function(matrix)
{
    if (this.x && this.x.end !== matrix.x) return false;
    if (this.y && this.y.end !== matrix.y) return false;
    if (this.scaleX && this.scaleX.end !== matrix.scaleX) return false;
    if (this.scaleY && this.scaleY.end !== matrix.scaleY) return false;
    if (this.rotation && this.rotation.end !== matrix.rotation) return false;
    if (this.skewX && this.skewX.end !== matrix.skewX) return false;
    if (this.skewY && this.skewY.end !== matrix.skewY) return false;
    return true;
};

function round(val) {
    return DataUtils.toPrecision(val, 3);
}

module.exports = Tween;