"use strict";

let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
let BISON = require('bisonjs');


module.exports = function(data, library, assets)
{
    if (!data.Shapes.length) return;

    // Convert all the shapes into a lookup
    let map = {};
    for(let i = 0, len = data.Shapes.length; i < len; i++)
    {
        let name = "Shape" + i;
        let shape = data.Shapes[i];
        library[shape.id] = name;
        let draw = [];
        for(let j = 0, len = shape.paths.length; j < len; j++) {
            if (j > 0) {
                draw.push("cp");
            }
            let p = shape.paths[j];

            // Adding a stroke
            if (p.stroke) {
                draw.push("s", p.color, p.thickness, p.alpha);
            } else {
                draw.push("f", p.color, p.alpha);
            }

            p.d.forEach(function(command, k, commands) {
                if (typeof command == "number") {
                    commands[k] = Math.round(command * 100) / 100;
                }
            });

            // Add the draw commands
            draw = draw.concat(p.d);
        }
        map[name] = draw;
    }

    // Create the directory
    let dir = path.join(process.cwd(), data._meta.imagesPath);
    let stat = fs.statSync(dir);

    if (!stat.isDirectory()) {
        mkdirp.sync(dir);
    }

    // save the file
    let url;
    let graphics; 

    // Check to see if we should compact the shapes (use BSON file insetad)
    if (data._meta.compactShapes) {
        graphics = BISON.encode(map);
        url = path.join(data._meta.imagesPath, data._meta.stageName + "_graphics_.bson");
    } else {
        graphics = JSON.stringify(map, null, '  ');
        url = path.join(data._meta.imagesPath, data._meta.stageName + "_graphics_.json");
    }

    // Save the file data
    fs.writeFileSync(path.join(process.cwd(), url), graphics);

    // Update the assets path
    assets.push(url);
};