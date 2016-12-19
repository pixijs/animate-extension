module.exports = {
    pluginTempDebug: 'project/mac/lib/debug/PixiAnimate.fcm.plugin',
    pluginTempRelease: 'project/mac/lib/release/PixiAnimate.fcm.plugin',
    pluginFile: 'com.jibo.PixiAnimate/plugin/lib/mac/PixiAnimate.fcm.plugin',
    installFolder: '/Library/Application Support/Adobe/CEP/extensions/com.jibo.PixiAnimate',
    
    // ZXP plugin packaging options
    packager: './build/bin/ZXPSignCmd',

    // XCode project for building the plugin
    projectFile: 'project/mac/PixiAnimate.mp.xcodeproj',

    // Command to uncompress to local install folder
    installCmd: 'tar -xzf "${output}" -C "${installFolder}"',

    // List of gulp task to run when creating plugins
    pluginTasks: ['plugin-mac-debug', 'plugin-mac']
};