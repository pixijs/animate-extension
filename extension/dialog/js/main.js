(function(document, cep){

    var $ = document.querySelector.bind(document);

    var csInterface;
    var im_folder;
    var globalColor = 'colorThemeCSS';

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

    function minmax(value, min, max) 
    {
        if(parseInt(value) < 1 || isNaN(value)) 
            return 1; 
        else if(parseInt(value) > 100) 
            return 100; 
        else return value;
    }

    function scripttime_minmax(value, min, max) 
    {
        if(parseInt(value) < 1 || isNaN(value)) 
            return 1; 
        else if(parseInt(value) > 65535) 
            return 65535; 
        else return value;
    }

    function checkvalue() { 
        var mystring = document.getElementById('of').value; 
        if(!mystring.match(/\S/)) {
            alert ('Output file path cannot be empty');
            return false;
        } else {
            return true;
        }
    }

    function setUI(uiState)
    {
        //alert(JSON.stringify(uiState.data["PublishSettings.PixiJS.OutFile"]));
        if(uiState.data["PublishSettings.PixiJS.OutFile"] !=null && uiState.data["PublishSettings.PixiJS.OutFile"] != undefined)
        {
            $("#of").value = uiState.data["PublishSettings.PixiJS.OutFile"];
            
            if (uiState.data["PublishSettings.IncludeInvisibleLayer"] == "true")
            {
                $("#HiddenLayer").checked = true;
            }
            else
            {
                $("#HiddenLayer").checked = false;
            }

            if (uiState.data["PublishSettings.PixiJS.Minify"] == "true")
            {
                $("#Minify").checked = true;
            }
            else
            {
                $("#Minify").checked = false;
            }     

            if (uiState.data["PublishSettings.PixiJS.CompactData"] == "true")
            {
                $("#CompactData").checked = true;
                $("#CompactDataOptions").disabled = false;
            }
            else
            {
                $("#CompactData").checked = false;
                $("#CompactDataOptions").disabled = true;
            }             
            val = uiState.data["PublishSettings.PixiJS.CompactDataOptions"];
            $("#CompactDataOptions").value = val;
        }
    }

    function publish_callback()
    {
        //csInterface.closeExtension();
    }
        
    function populate_textfield(val)
    {
        $("#of").value = val;
    }
        
    function open_callback(pathVal)
    {
        evalScript("FLfile.uriToPlatformPath('"+pathVal+"');",populate_textfield);
    }

    function evalScript(script, callback) 
    {
        csInterface.evalScript(script, callback);
    }

    function serializeUI()
    {
        var event = new CSEvent();

        var pubSettings = new Object();
        pubSettings["PublishSettings.PixiJS.OutFile"] = $("#of").value.toString();
            
        if($("#HiddenLayer").checked == true)
        {
            pubSettings["PublishSettings.IncludeInvisibleLayer"] = "true";
        }
        else
        {
            pubSettings["PublishSettings.IncludeInvisibleLayer"] = "false";
        }

        
        if($("#Minify").checked == true)
        {
            pubSettings["PublishSettings.PixiJS.Minify"] = "true";
        }
        else
        {
            pubSettings["PublishSettings.PixiJS.Minify"] = "false";
        }
        
        if($("#CompactData").checked == true)
        {
            pubSettings["PublishSettings.PixiJS.CompactData"] = "true";
        }
        else
        {
            pubSettings["PublishSettings.PixiJS.CompactData"] = "false";
        }

        var compactVal = $("#CompactDataOptions");
        pubSettings["PublishSettings.PixiJS.CompactDataOptions"] = compactVal.value;
        
        event.scope = "APPLICATION";
        event.type = "com.adobe.events.flash.extension.savestate";
        event.data = JSON.stringify(pubSettings);
        event.extensionId = "PixiAnimate.PublishSettings";
        csInterface.dispatchEvent(event);

        evalScript("fl.getDocumentDOM().publish();",publish_callback);
    }

    function onLoaded() {
        im_folder = "";
        csInterface = new CSInterface();
        //Light and dark theme change
        
        var skinInfo = JSON.parse(cep.getHostEnvironment()).appSkinInfo;
        
        ChangePanelTheme(skinInfo);
        
        csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
        
        csInterface.addEventListener("com.adobe.events.flash.extension.setstate", setUI);
        var event = new CSEvent();
        event.scope = "APPLICATION";
        event.type = "com.adobe.events.flash.extensionLoaded";
        event.data = "Test Event";
        event.extensionId = "PixiAnimate.PublishSettings";
        csInterface.dispatchEvent(event);
    }
        
    function ChangePanelTheme(skinInfo){
        var darkTheme = (skinInfo.appBarBackgroundColor.color.blue < 128)
        var head  = document.getElementsByTagName('head')[0];
            //load the CSS for App theme
        var loadedCSS = document.getElementById(globalColor);
        if (loadedCSS)
            loadedCSS.parentNode.removeChild(loadedCSS);
        var link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.media = 'all';
        if(darkTheme)
            link.href = 'css/panel-dark.css';
        else
            link.href = 'css/panel-light.css';
        link.id = globalColor;
        head.appendChild(link);
        
        var styleSheets= document.styleSheets;
        if(styleSheets.length > 0)
        {
            for(var i=0;i<styleSheets.length;i++)
            {
                styleSheets.item(i).addRule("*",'font-family: "' + skinInfo.baseFontFamily + '";font-size:11px',0);
            }
        }
    }

    function onAppThemeColorChanged(event) {
        // Should get a latest HostEnvironment object from application.
        //var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
        // Gets the style information such as color info from the skinInfo, 
        // and redraw all UI controls of your extension according to the style info.
        var skinInfo = JSON.parse(cep.getHostEnvironment()).appSkinInfo;
        ChangePanelTheme(skinInfo);
    }

    function onPublish() {
        var retVal = checkvalue();
        if(retVal)
        serializeUI();
    }

    function opsd() {
       evalScript("fl.browseForFileURL('save','Publish to HTML','HTML','html');",open_callback);
    }


    function compactDataChanged()
    {
        if ($("#CompactData").checked == true)
        {
            $("#CompactDataOptions").disabled = false;
        }
        else
        {
            $("#CompactDataOptions").disabled = true;
        }
    }

    // Bind the DOM elements to handlers
    $("body").onload = onLoaded;
    $("#publish").onclick = onPublish;
    $("#OPShowOpenDialog").onclick = opsd;
    $("#CompactData").onchange = compactDataChanged;

}(document, window.__adobe_cep__));