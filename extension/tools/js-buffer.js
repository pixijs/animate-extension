"use strict";

let path = require('path');
let fs = require('fs');

module.exports = function(data)
{
    var snippets = {};

    function template(type, vars)
    {
        let buffer = snippets[type] || null;

        if (!buffer)
        {
            // Load the snippet from the file system
            let dir = path.join(__dirname, 'snippets');
            buffer = fs.readFileSync(path.join(dir, type + '.txt'), 'utf8');
            snippets[type] = buffer;
        }

        if (vars)
        {
            // Replace the variables with the map
            for (let prop in vars)
            {
                let search = new RegExp("\\$\\{"+prop+"\\}", 'g');
                buffer = buffer.replace(search, vars[prop]);
            }
        }
        return buffer;
    }

    let buffer = "";
    let classes = "";

    if (data.bitmaps.length)
    {
        classes += "var Sprite = PIXI.Sprite;\n";
        classes += "var fromFrame = PIXI.Texture.fromFrame;\n";
    }

    if (data.text.length)
    {
        classes += "var Text = PIXI.Text;\n";
    }

    if (data.shapes.length)
    {
        classes += "var Graphics = PIXI.Graphics;\n";
        classes += "var graphics = PIXI.animate.GraphicsCache;\n"
    }

    // Get the header
    buffer += template('header', { classes : classes });

    // Write all the bitmaps
    data.bitmaps.forEach(function(bitmap){
        buffer += template('bitmap', { id: bitmap.name });
    });

    buffer += template('movieclip', {
        id: data._meta.stageName,
        contents: ''
    });

    buffer += template('footer', data._meta);

    let outputFile = path.join(process.cwd(), data._meta.outputFile);
    fs.writeFileSync(outputFile, buffer);
};

