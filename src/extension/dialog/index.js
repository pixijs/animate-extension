/*global CSEvent:true, CSInterface:true */
(function(document, cep)
{
    // Convenience wrappers for the querySelector, poor-man's jQuery
    var $ = document.querySelector.bind(document);
    var $$ = document.querySelectorAll.bind(document);

    // Interface for interaction with the CEP API
    var csInterface;

    // The root parent of the FLA
    var parentPath;

    // UI Elements
    var $body = $('body');
    var $outputFile = $('#outputFile');
    var $htmlPath = $("#htmlPath");
    var $imagesPath = $("#imagesPath");
    var $soundsPath = $("#soundsPath");
    var $libsPath = $("#libsPath");
    var $compactShapes = $("#compactShapes");
    var $compressJS = $("#compressJS");
    var $commonJS = $("#commonJS");
    var $namespace = $("#namespace");
    var $stageName = $("#stageName");
    var $html = $("#html");
    var $libs = $("#libs");
    var $images = $("#images");
    var $sounds = $("#sounds");
    var $loopTimeline = $("#loopTimeline");
    var $hiddenLayers = $("#hiddenLayers");
    var $publishButton = $("#publishButton");
    var $browseButton = $("#browseButton");
    var $cancelButton = $("#cancelButton");
    var $okButton = $("#okButton");
    var $spritesheets = $("#spritesheets");
    var $spritesheetSize = $("#spritesheetSize");
    var $spritesheetScale = $("#spritesheetScale");

    // Execute JSFL scripts
    function exec(script, callback)
    {
        var args = [];
        for (var arg, i = 1; i < arguments.length; i++)
        {
            arg = arguments[i];
            if (typeof arg == "function")
            {
                callback = arg;    
            }
            else
            {
                args.push(JSON.stringify(arg));
            }
        }
        var cmd = script + "(" + args.join(',') + ")";
        csInterface.evalScript(cmd, function(data)
        {
            if (data && callback)
            {
                if (data == "null") data = null;
                else if (data == "true") data = true;
                else if (data == "false") data = false;
                else if (data == "undefined") data = undefined;
                else if (/^\{/.test(data)) data = JSON.parse(data);
                callback(data);
            }
            else if (callback)
            {
                callback();
            }
        });
    }

    // Filters based
    function isValidInput(input) {
        var disabled = input.className.indexOf('disabled') > -1;
        if (disabled) return true;
        var regex = new RegExp(input.dataset.validate, 'i');
        var success = regex.test(input.value);
        if (!success) {
            input.className += ' focus';
            exec('alert', input.dataset.error || 'Validation error');
        }
        return success;
    }

    // Remove focus style on click
    document.addEventListener('mouseup', function(){
        var inputs = $$('input');
        for (var n = 0; n < inputs.length; n++)
        {
            var input = inputs[n];
            input.className = input.className.replace('focus', '');
        }
    });

    function isReadyToPublish() { 
        return isValidInput($outputFile)
            && isValidInput($htmlPath)
            && isValidInput($namespace)
            && isValidInput($stageName)
            && isValidInput($spritesheetScale);
    }

    // The prepend name of the settings object keys
    var SETTINGS = "PublishSettings.PixiJS.";

    function ifBoolOr(arg, defaultValue)
    {
        return typeof arg !== "undefined" ? arg == "true" : defaultValue;
    }

    function restoreState(event)
    {
        var data = event.data;

        if (data[SETTINGS + "OutputFile"])
        {
            // Booleans options
            $compactShapes.checked = ifBoolOr(data[SETTINGS + "CompactShapes"], true);
            $compressJS.checked = ifBoolOr(data[SETTINGS + "CompressJS"], true);
            $commonJS.checked = data[SETTINGS + "CommonJS"] == "true";
            $html.checked = ifBoolOr(data[SETTINGS + "HTML"], true);
            $libs.checked = ifBoolOr(data[SETTINGS + "Libs"], true);
            $images.checked = ifBoolOr(data[SETTINGS + "Images"], true);
            $sounds.checked = ifBoolOr(data[SETTINGS + "Sounds"], true);
            $loopTimeline.checked = ifBoolOr(data[SETTINGS + "LoopTimeline"], true);
            $spritesheets.checked = ifBoolOr(data[SETTINGS + "Spritesheets"], true);

            onToggleInput.call($html);
            onToggleInput.call($images);
            onToggleInput.call($libs);
            onToggleInput.call($sounds);

            // String options
            $htmlPath.value = data[SETTINGS + "HTMLPath"];
            $libsPath.value = data[SETTINGS + "LibsPath"];
            $imagesPath.value = data[SETTINGS + "ImagesPath"];
            $soundsPath.value = data[SETTINGS + "SoundsPath"];
            $namespace.value = data[SETTINGS + "Namespace"];
            $outputFile.value = data[SETTINGS + "OutputFile"];
            $stageName.value = data[SETTINGS + "StageName"];
            $spritesheetSize.value = data[SETTINGS + "SpritesheetSize"] || 1024;
            $spritesheetScale.value = data[SETTINGS + "SpritesheetScale"] || 1.0;

            // Global options
            $hiddenLayers.checked = data["PublishSettings.IncludeInvisibleLayer"] == "true";
        }
        else
        {
            // put in the default values
            exec('getDocumentName', function(name)
            {
                $htmlPath.value = name + '.html';
                $outputFile.value = name + '.js';
                $stageName.value = name.replace(/[^A-Za-z0-9_]/g, '_');
            });
        }

        isLoaded();
    }

    function saveState()
    {
        var data = {};

        // Booleans
        data[SETTINGS + "CompactShapes"] = $compactShapes.checked.toString();
        data[SETTINGS + "CompressJS"] = $compressJS.checked.toString();
        data[SETTINGS + "CommonJS"] = $commonJS.checked.toString();
        data[SETTINGS + "HTML"] = $html.checked.toString();
        data[SETTINGS + "Libs"] = $libs.checked.toString();
        data[SETTINGS + "Images"] = $images.checked.toString();
        data[SETTINGS + "Sounds"] = $sounds.checked.toString();
        data[SETTINGS + "LoopTimeline"] = $loopTimeline.checked.toString();
        data[SETTINGS + "Spritesheets"] = $spritesheets.checked.toString();

        // Strings
        data[SETTINGS + "OutputFile"] = $outputFile.value.toString();
        data[SETTINGS + "HTMLPath"] = $htmlPath.value.toString();
        data[SETTINGS + "LibsPath"] = $libsPath.value.toString();
        data[SETTINGS + "ImagesPath"] = $imagesPath.value.toString();
        data[SETTINGS + "SoundsPath"] = $soundsPath.value.toString();
        data[SETTINGS + "Namespace"] = $namespace.value.toString();
        data[SETTINGS + "StageName"] = $stageName.value.toString();
        data[SETTINGS + "SpritesheetSize"] = $spritesheetSize.value.toString();
        data[SETTINGS + "SpritesheetScale"] = $spritesheetScale.value.toString();

        // Global options
        data["PublishSettings.IncludeInvisibleLayer"] = $hiddenLayers.checked.toString();
        
        console.log(data);

        var event = new CSEvent();
        event.scope = "APPLICATION";
        event.type = "com.adobe.events.flash.extension.savestate";
        event.data = JSON.stringify(data);
        event.extensionId = "com.jibo.PixiAnimate.PublishSettings";
        csInterface.dispatchEvent(event);
    }

    function isLoaded()
    { 
        $body.className = $body.className.replace('loading', '');
    }

    // Handle the toggles
    function onToggleInput()
    {
        var toggle = $(this.dataset.toggle);
        toggle.disabled = !this.checked;
        toggle.className = toggle.className.replace('disabled', '');
        if (toggle.disabled) {
            toggle.className += " disabled";
        }
    }
        
    function refreshColorTheme()
    {
        var skinInfo = JSON.parse(cep.getHostEnvironment()).appSkinInfo;
        var darkTheme = (skinInfo.appBarBackgroundColor.color.blue < 128)
        $body.className = darkTheme ? 'dark' : 'light';
    }

    function close()
    {
        csInterface.closeExtension();
    }

    $publishButton.onclick = function()
    {
        if (isReadyToPublish())
        {
            saveState();
            exec("publish");
        }
    };

    $browseButton.onclick = function()
    {
        exec("browseOutputFile", function(output)
        {
            if (output)
            {
                var path = require('path');
                $outputFile.value = path.relative(parentPath, output);
            } 
        });
    }

    $cancelButton.onclick = close;

    $okButton.onclick = function()
    {
        if (isReadyToPublish())
        {
            saveState();
            close();
        }
    };

    // Handle the toggle buttons which disable
    var toggles = $$('.toggle');
    for(var i = 0, len = toggles.length; i < len; i++)
    {
        toggles[i].onchange = onToggleInput.bind(toggles[i]);
    }

    if (!cep)
    {
        isLoaded();
        return;
    } 

    csInterface = new CSInterface();

    // Gets the style information such as color info from the skinInfo, 
    // and redraw all UI controls of your extension according to the style info.
    refreshColorTheme();
    csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, refreshColorTheme);

    // Check for the parent document
    exec('getParentPath', function(parent)
    {
        var path = require('path');
        parentPath = path.dirname(parent);
        if (path.extname(parent).toLowerCase() == ".xfl")
        {
            parentPath = path.dirname(parentPath);
        }

        // Restory the state from the saved settings
        csInterface.addEventListener("com.adobe.events.flash.extension.setstate", restoreState);
        var event = new CSEvent();
        event.scope = "APPLICATION";
        event.type = "com.adobe.events.flash.extensionLoaded";
        event.data = "Test Event";
        event.extensionId = "com.jibo.PixiAnimate.PublishSettings";
        csInterface.dispatchEvent(event);
    });

}(document, window.__adobe_cep__));