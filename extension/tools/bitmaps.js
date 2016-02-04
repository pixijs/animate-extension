"use strict";

module.exports = function(data, library, assets)
{
    if (!data.bitmaps.length) return;

    for(let i = 0, len = data.bitmaps.length; i < len; i++)
    {
        let bitmap = data.bitmaps[i];
        library[bitmap.id] = bitmap.name;
        assets.push([bitmap.name, bitmap.src]);
    }
};