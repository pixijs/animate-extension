"use strict";

let path = require('path');
let fs = require('fs');

// Get the assets and convert to loading assets
module.exports = function(assets, htmlPath)
{
    let url = path.join(process.cwd(), htmlPath);
    let html = fs.readFileSync(url, 'utf8');

    // Convert individuals images 
    assets.forEach(function(asset, i, assets) {
        if (Array.isArray(asset)) {
            assets[i] = asset.join("', '");
        }
    })

    let split = "')\n                .add('";
    html = html.replace('${assets}', ".add('" + assets.join(split) + "')");
    fs.writeFileSync(url, html);
};