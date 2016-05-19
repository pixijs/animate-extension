"use strict";

const Rect = function(x, y, w, h)
{
    this.x = x; this.y = y;
    this.w = w; this.h = h;
}

const p = Rect.prototype;

p.fitsIn = function(outer) 
{
    return outer.w >= this.w && outer.h >= this.h;
};

p.sameSizeAs = function(other) 
{
    return this.w === other.w && this.h === other.h;
};

module.exports = Rect;