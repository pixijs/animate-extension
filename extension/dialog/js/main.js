/*global CSEvent:true, CSInterface:true */
(function(document, cep) {

    var $ = document.querySelector.bind(document);
    var $$ = document.querySelectorAll.bind(document);

    var csInterface;

    function exec(script, callback) {
        var args = [];
        for (var arg, i = 1; i < arguments.length; i++) {
            arg = arguments[i];
            if (typeof arg == "function") {
                callback = arg;    
            } else {
                args.push(JSON.stringify(arg));
            }
        }
        var cmd = script + "(" + args.join(',') + ")";
        csInterface.evalScript(cmd, function(data) {
            if (data && callback) {
                if (data == "null") data = null;
                else if (data == "true") data = true;
                else if (data == "false") data = false;
                else if (data == "undefined") data = undefined;
                else if (/^\{/.test(data)) data = JSON.parse(data);
                callback(data);
            } else if (callback) {
                callback();
            }
        });
    }

    // function isNumber(event) {
    //   if (event) {
    //     var charCode = (event.which) ? event.which : event.keyCode;
    //     if (charCode != 190 && charCode > 31 && 
    //        (charCode < 48 || charCode > 57) && 
    //        (charCode < 96 || charCode > 105) && 
    //        (charCode < 37 || charCode > 40) && 
    //         charCode != 110 && charCode != 8 && charCode != 46 )
    //        return false;
    //   }
    //   return true;
    // }

    function isReadyToPublish() { 
        var success = true;
        var error;

        var outFile = $('#outputFile').value;

        if (!outFile.match(/\S/)) {
            error = 'Output file path cannot be empty.';
            success = false;
        }
        else if (!outFile.match(/\.js$/)) {
            error = 'Output file must be an JavaScript file.';
            success = false;
        }

        // Show the error message
        if (!success) exec("alert", error);
        return success;
    }

    // The prepend name of the settings object keys
    var SETTINGS = "PublishSettings.PixiJS.";

    function restoreState(event) {
        var data = event.data;

        if (data[SETTINGS + "OutputFile"])
        {
            // Booleans options
            $("#compactShapes").checked = data[SETTINGS + "CompactShapes"] == "true";
            $("#compressJS").checked = data[SETTINGS + "CompressJS"] == "true";
            $("#html").checked = data[SETTINGS + "HTML"] == "true";
            $("#libs").checked = data[SETTINGS + "Libs"] == "true";
            $("#images").checked = data[SETTINGS + "Images"] == "true";
            $("#loopTimeline").checked = data[SETTINGS + "LoopTimeline"] == "true";
            $("#electron").checked = data[SETTINGS + "Electron"] == "true";

            // String options
            $("#HTMLPath").value = data[SETTINGS + "HTMLPath"];
            $("#LibsPath").value = data[SETTINGS + "LibsPath"];
            $("#ImagesPath").value = data[SETTINGS + "ImagesPath"];
            $("#namespace").value = data[SETTINGS + "Namespace"];
            $("#outputFile").value = data[SETTINGS + "OutputFile"];
            $("#stageName").value = data[SETTINGS + "StageName"];
            
            // Global options
            $("#hiddenLayers").checked = data["PublishSettings.IncludeInvisibleLayer"] == "true";
        }
    }

    function saveState() {

        var data = {};

        // Booleans
        data[SETTINGS + "CompactShapes"] = $("#compactShapes").checked.toString();
        data[SETTINGS + "CompressJS"] = $("#compressJS").checked.toString();
        data[SETTINGS + "HTML"] = $("#html").checked.toString();
        data[SETTINGS + "Libs"] = $("#libs").checked.toString();
        data[SETTINGS + "Images"] = $("#images").checked.toString();
        data[SETTINGS + "LoopTimeline"] = $("#loopTimeline").checked.toString();
        data[SETTINGS + "Electron"] = $("#electron").checked.toString();

        // Strings
        data[SETTINGS + "OutputFile"] = $("#outputFile").value.toString();
        data[SETTINGS + "HTMLPath"] = $("#HTMLPath").value.toString();
        data[SETTINGS + "LibsPath"] = $("#LibsPath").value.toString();
        data[SETTINGS + "ImagesPath"] = $("#ImagesPath").value.toString();
        data[SETTINGS + "Namespace"] = $("#namespace").value.toString();
        data[SETTINGS + "StageName"] = $("#stageName").value.toString();

        // Global options
        data["PublishSettings.IncludeInvisibleLayer"] = $("#hiddenLayers").checked.toString();
        
        var event = new CSEvent();
        event.scope = "APPLICATION";
        event.type = "com.adobe.events.flash.extension.savestate";
        event.data = JSON.stringify(data);
        event.extensionId = "com.jibo.PixiAnimate.PublishSettings";
        csInterface.dispatchEvent(event);
    }

    function onInit() {

        $("#publishButton").onclick = function() {
            if (isReadyToPublish()) {
                saveState();
                exec("publish");
            }
        };

        $("#browseButton").onclick = function() {
            exec("browseOutputFile", function(path) {
                var outFile = $("#outputFile");
                if (path) {
                    outFile.value = path;
                } 
            });
        }

        $("#cancelButton").onclick = close;

        $("#okButton").onclick = function() {
            if (isReadyToPublish()) {
                saveState();
                close();
            }
        };

        // Handle the toggle buttons which disable
        var toggles = $$('.toggle');
        for(var i = 0, len = toggles.length; i < len; i++) {
            toggles[i].onchange = onToggleInput.bind(toggles[i]);
        }

        // Handle the toggles
        function onToggleInput() {
            var toggle = $(this.dataset.toggle);
            toggle.disabled = !this.checked;
            toggle.className = toggle.className.replace('disabled', '');
            if (toggle.disabled) {
                toggle.className += " disabled";
            }
        }

        if (!cep) return;

        csInterface = new CSInterface();

        exec('getParentURI', function(parent) {
            if (!parent) {
                exec('alert', 'Save document first!');
                close();
            }
        });

        //Light and dark theme change
        refreshColorTheme();
        
        // Gets the style information such as color info from the skinInfo, 
        // and redraw all UI controls of your extension according to the style info.
        csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, function(){
            refreshColorTheme();
        });
        csInterface.addEventListener("com.adobe.events.flash.extension.setstate", restoreState);
        var event = new CSEvent();
        event.scope = "APPLICATION";
        event.type = "com.adobe.events.flash.extensionLoaded";
        event.data = "Test Event";
        event.extensionId = "com.jibo.PixiAnimate.PublishSettings";
        csInterface.dispatchEvent(event);
    }
        
    function refreshColorTheme() {
        var skinInfo = JSON.parse(cep.getHostEnvironment()).appSkinInfo;
        var darkTheme = (skinInfo.appBarBackgroundColor.color.blue < 128)
        $('body').className = darkTheme ? 'dark' : 'light';
    }

    function close() {
        csInterface.closeExtension();
    }

    // Bind the DOM elements to handlers
    $("body").onload = onInit;

}(document, window.__adobe_cep__));