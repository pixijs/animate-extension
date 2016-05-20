"use strict";

const fs = require('fs');
const path = require('path');
const Spritesheet = require('./Spritesheet');
const ipc = require('electron').ipcRenderer;

ipc.on('settings', (ev, data) => {

    const images = [];
    const results = {};
    const response = JSON.parse(data);
    const assets = response.assets;
    const size = response.size;
    const debug = response.debug;

    for(let id in assets) {

        let src = assets[id];

        // Ignore non png files
        if (!/\.(png)$/i.test(src)) {
            results[id] = src;
            continue;
        }

        const img = new Image();
        img.src = "data:image/png;base64," + fs.readFileSync(src, 'base64');
        const width = img.width + Spritesheet.PADDING * 2;
        const height = img.height + Spritesheet.PADDING * 2;

        // Ignore oversized images
        if (width > size || height > size) {
            results[id] = src;
            continue;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.id = id;
        canvas.dataset.src = src;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(
            img, 
            Spritesheet.PADDING,
            Spritesheet.PADDING,
            img.width,
            img.height
        );
        images.push(canvas);
    }

    images.reverse();

    let current = 0;
    while(images.length) {

        let output = response.output + (++current);
        let atlas = new Spritesheet(size, debug);
        atlas.addImages(images);
        atlas.save(output);
        atlas.destroy();
        let json = output + '.json';
        results[path.parse(json).name] = json;
    }
    
    ipc.sendSync('done', JSON.stringify(results));
});