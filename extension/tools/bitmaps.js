"use strict";

module.exports = function(data, library, assets)
{
    if (!data.Bitmaps.length) return;

    for(let i = 0, len = data.Bitmaps.length; i < len; i++)
    {
        let bitmap = data.Bitmaps[i];
        library[bitmap.id] = bitmap.name;
        assets.push([bitmap.name, bitmap.src]);
    }
};