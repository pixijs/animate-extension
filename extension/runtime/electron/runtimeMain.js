/**
 * Created by mbittarelli on 11/23/15.
 */

import Pixi from '../vendor/pixi.min';
import PixiFlash from '../vendor/pixi-flash.min';
import Player from './player';

module.exports = function(flash_json_file, fps) {
    let loader = Pixi.loader;
    loader.add('PixiAnimate', flash_json_file);
    loader.once("complete", handleComplete);
    loader.load();
    function handleComplete(loader, args) {
        var canvas = document.getElementById("canvas");
        var stage = new Pixi.Container();
        var renderer = new Pixi.autoDetectRenderer(canvas.width, canvas.height, {
            view: document.getElementById("canvas"),
            antialias: true
        });

        //pass FPS and use that in the player
        var player = new Player(stage, renderer, args.PixiAnimate.data, fps);
        player.play();
    }
}
