# PixiAnimate Extension

Creates a custom FLA document which support publishing to [PixiJS](http://pixijs.com) natively in Adobe Animate CC (formerly Flash CC 2015).

## Examples

See [examples](https://github.com/jiborobot/pixi-animate-examples) for sample FLA document to test features of PixiAnimate.


## Dependencies

The following dependencies are required in order to publishing FLA document created with this Plugin.

* Adobe Flash CC 2015+ or Adobe Animate CC
* Mac OS X (Window not currently supported)
* [Node & NPM](http://nodejs.org)
* [Electron](http://electron.atom.io/) `npm install -g electron-prebuilt`

## Building

To get setup, please follow the instructions outlined from [Adobe's documentation](https://helpx.adobe.com/flash/using/enabling-support-custom-platforms.html#Building%20a%20Flash%20custom%20platform%20support%20plug-in). This will enable you to build the project itself and see the plugin exposed from Adobe Animate CC.  

- Some project / file names may be changed due to not wanting to produce a plugin named "SamplePlugin".
- The certificate password is: `password`

### CEP Debug Mode

To setup your platform for development, you must enable debugging in your Adobe preferences for CEP. **_VERY Important to reboot your machine after making this change_** or it will not take effect.

#### Windows

Go to Registry, `regedit` > `HKEY_CURRENT_USER/Software/Adobe/CSXS.6`, then add a new entry `PlayerDebugMode` of type `"string"` with the value of `"1"`.

#### OS X
Add the entry `PlayerDebugMode` of type `"string"` with value set to `1` in the plist file `/Users/<username>/Library/Preferences/com.adobe.CSXS.6.plist`

### Commands

To build and install to Animate CC directly, run the script. This will rebuild the C++ code, copy the plugin go the Eclipse project and then install in the CEP extension's folder (`/Library/Application Support/Adobe/CEP/extensions/com.jibo.PixiAnimate/`)

```bash
gulp
```

To build the extension in debug mode and allow for remote debugging, run this command. Navigate to http://localhost:8008 to get the DevTools for the Publish Settings dialog.

```bash
gulp --debug
```
