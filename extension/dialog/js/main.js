/*global CSEvent:true, CSInterface:true */
(function(document, cep) {

    var $ = document.querySelector.bind(document);
    // var $$ = document.querySelectorAll.bind(document);

    var csInterface;

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

        var outputFile = $('#outputFile').value;

        if (!outputFile.match(/\S/)) {
            error = 'Output file path cannot be empty.';
            success = false;
        }
        else if (!outputFile.match(/\.html$/)) {
            error = 'Output file must be an HTML file.';
            success = false;
        }

        // Show the error message
        if (!success) exec("alert", error);
        return success;
    }

    function deserialize(event) {
        var data = event.data;

        if (data["PublishSettings.PixiJS.OutFile"])
        {
            $("#outputFile").value = data["PublishSettings.PixiJS.OutFile"];
            $("#hiddenLayers").checked = data["PublishSettings.IncludeInvisibleLayer"] == "true";
            $("#minify").checked = data["PublishSettings.PixiJS.Minify"] == "true";
            $("#compactData").checked = data["PublishSettings.PixiJS.CompactData"] == "true";
            $("#compactDataOptions").disabled = $("#compactData").checked;
            $("#compactDataOptions").value = data["PublishSettings.PixiJS.CompactDataOptions"];
        }
    }

    function serialize() {
        var event = new CSEvent();
        var settings = {
            "PublishSettings.PixiJS.OutFile": $("#outputFile").value.toString(),
            "PublishSettings.IncludeInvisibleLayer": $("#hiddenLayers").checked.toString(),
            "PublishSettings.PixiJS.Minify": $("#minify").checked.toString(),
            "PublishSettings.PixiJS.CompactDataOptions": $("#compactDataOptions").value
        };
        event.scope = "APPLICATION";
        event.type = "com.adobe.events.flash.extension.savestate";
        event.data = JSON.stringify(settings);
        event.extensionId = "com.jibo.PixiAnimate.PublishSettings";
        csInterface.dispatchEvent(event);
    }

    function onInit() {

        if (!window.CSInterface) return;

        csInterface = new CSInterface();
        //Light and dark theme change
        refreshColorTheme();
        
        // Gets the style information such as color info from the skinInfo, 
        // and redraw all UI controls of your extension according to the style info.
        csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, function(){
            refreshColorTheme();
        });
        csInterface.addEventListener("com.adobe.events.flash.extension.setstate", deserialize);
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

    function compactDataChanged() {
        $("#compactDataOptions").disabled = !$("#compactData").checked;
    }

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
                try {
                    callback(JSON.parse(data));
                }
                catch(e) {
                    callback();
                }
            } else if (callback) {
                callback();
            }
        });
    }


    // Bind the DOM elements to handlers
    $("body").onload = onInit;

    $("#publishButton").onclick = function() {
        if (isReadyToPublish()) {
            serialize();
            exec("publish");
        }
    };

    $("#browseButton").onclick = function onBrowse() {
        exec("browseHTML", function(path) {
            if (path) $("#outputFile").value = path;
        });
    };

    $("#cancelButton").onclick = close;

    $("#okButton").onclick = function() {
        if (isReadyToPublish()) {
            serialize();
            close();
        }
    };

    $("#compactData").onchange = compactDataChanged;

}(document, window.__adobe_cep__));