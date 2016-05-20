"use strict";

const fs = require('fs');
const path = require('path');
const Atlas = require('./Atlas');

const Spritesheet = function(size, debug) {

    /**
     * Writing images to canvas
     * @property {HTMLCanvasElement} canvas
     */
    this.canvas = document.createElement('canvas');

    /**
     * If we should delete source images added.
     * @property {Boolean} debug
     */
    this.debug = !!debug;

    this.size = size = size || 1024;

    // Create a new atlas
    this.canvas.width = size;
    this.canvas.height = size;
    
    /**
     * The atlas of images (atlaspack)
     * @property {Atlas} atlas
     */
    this.atlas = new Atlas(this.canvas);

    /**
     * Spritesheet data
     * @property {Object} data
     */
    this.data = {
        frames: {},
        meta: {
            // app: "PixiAnimate Extension",
            // version: "1.0.0",
            // format: "RGBA8888",
            image: '',
            size: {w: size, h: size},
            scale: 1
        }
    };
};

const p = Spritesheet.prototype;

/**
 * Padding around each image.
 * @property {int} PADDING
 * @static
 * @default 1
 */
Spritesheet.PADDING = 1;

/**
 * Push additional images, images that are packed, are removed.
 * @method addImages
 * @param {Array<HTMLElement>} images
 */
p.addImages = function(images)
{
    let count = 0;

    // Got in reverse order so we can splice off images
    for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i];
        const node = this.atlas.pack(img);
        if (node !== false) {
            count++;
            images.splice(i, 1);
            if (!this.debug)
            {
                fs.unlinkSync(img.dataset.src);
            }
        }
    }

    // Get the UVs for the added images
    const uvs = this.atlas.uv();

    // Create data for images on this spritesheet
    for(let id in uvs) {
        let x = uvs[id][0][0] * this.size + Spritesheet.PADDING;
        let y = uvs[id][0][1] * this.size + Spritesheet.PADDING;
        let w = uvs[id][2][0] * this.size - x - Spritesheet.PADDING;
        let h = uvs[id][2][1] * this.size - y - Spritesheet.PADDING;
        this.data.frames[id] = {
            frame: {x:x, y:y, w:w, h:h},
            // rotate: false,
            // trimmed: false,
            // spriteSourceSize: {x:0, y:0, w:w, h:h},
            sourceSize: {w:w, h:h}//,
            // pivot: {x:0.5,y:0.5}
        };
    }
};

/**
 * Save the data and image files.
 * @method save
 */
p.save = function(output)
{
    const image = this.canvas.toDataURL()
        .replace(/^data:image\/png;base64,/, '');

    const outputName = path.parse(output).name;

    // Add the image name to the meta data
    this.data.meta.image = outputName + '.png';

    // Write data as string
    const data = JSON.stringify(this.data, null, this.debug ? '  ' : '');

    fs.writeFileSync(output + '.png', image, 'base64');
    fs.writeFileSync(output + '.json', data, 'utf8');
};

/**
 * Save the data and image files.
 * @method destroy
 */
p.destroy = function()
{
    this.atlas = null;
    this.data = null;
    this.canvas = null;
};

module.exports = Spritesheet;