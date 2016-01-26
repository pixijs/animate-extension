(function(document, cep, undefined) {

    var $ = document.querySelector.bind(document);
    var $$ = document.querySelectorAll.bind(document);

    var csInterface;

    function isNumber(event) {
      if (event) {
        var charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 190 && charCode > 31 && 
           (charCode < 48 || charCode > 57) && 
           (charCode < 96 || charCode > 105) && 
           (charCode < 37 || charCode > 40) && 
            charCode != 110 && charCode != 8 && charCode != 46 )
           return false;
      }
      return true;
    }

    function isReadyToPublish() { 
        var success = true;
        var error;

        var outputFile = $('#outputFile').value;

        if (!outputFile.match(/\S/)) {
            error = 'Output file path cannot be empty';
            success = false;
        }
        else if (!outputFile.match(/\.html$/)) {
            error = 'Output file must be an HTML file';
            success = false;
        }

        // Show the error message
        if (!success) alert(error);
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
            val = data["PublishSettings.PixiJS.CompactDataOptions"];
            $("#compactDataOptions").value = val;
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
        // var styleSheets= document.styleSheets;
        // if(styleSheets.length > 0)
        // {
        //     for(var i=0;i<styleSheets.length;i++)
        //     {
        //         styleSheets.item(i).addRule("*",'font-family: "' + skinInfo.baseFontFamily + '";font-size:11px',0);
        //     }
        // }
    }

    function onBrowseDone(uri)
    {
        csInterface.evalScript("FLfile.uriToPlatformPath('"+uri+"');", function(path) {
            $("#outputFile").value = path;
        });
    }

    function close()
    {
        csInterface.closeExtension();
    }

    function compactDataChanged(e) {
        $("#compactDataOptions").disabled = !$("#compactData").checked;
    }

    // Bind the DOM elements to handlers
    $("body").onload = onInit;

    $("#publishButton").onclick = function() {
        if (isReadyToPublish()) {
            serialize();
            var script = "fl.getDocumentDOM().publish();";
            csInterface.evalScript(script, close);
        }
    };

    $("#browseButton").onclick = function onBrowse() {
        var script = "fl.browseForFileURL('save','Publish to HTML','HTML','html');";
        csInterface.evalScript(script, onBrowseDone);
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