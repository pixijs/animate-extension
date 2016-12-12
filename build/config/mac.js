module.exports = {
    pluginTempDebug: 'src/PixiAnimate/lib/mac/debug/PixiAnimate.fcm.plugin',
    pluginTempRelease: 'src/PixiAnimate/lib/mac/release/PixiAnimate.fcm.plugin',
    pluginFile: 'com.jibo.PixiAnimate/plugin/lib/mac/PixiAnimate.fcm.plugin',
    installFolder: '/Library/Application Support/Adobe/CEP/extensions/com.jibo.PixiAnimate',
    outputName: 'PixiAnimate-mac.zxp',
    outputDebugName: 'PixiAnimate-mac-debug.zxp',
    
    // ZXP plugin packaging options
    packager: './build/ZXPSignCmd',

    // XCode project for building the plugin
    xcodeproj: 'project/mac/PixiAnimate.mp.xcodeproj',

    // Command to uncompress to local install folder
    installCmd: 'tar -xzf "${output}" -C "${installFolder}"',

    // List of gulp task to run when creating plugins
    pluginTasks: ['plugin-mac-debug', 'plugin-mac']
};