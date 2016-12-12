module.exports = {
    pluginTempDebug: 'src/PixiAnimate/lib/win/debug/PixiAnimate.fcm',
    pluginTempRelease: 'src/PixiAnimate/lib/win/release/PixiAnimate.fcm',
    pluginFile: 'com.jibo.PixiAnimate/plugin/lib/win/PixiAnimate.fcm',
    installFolder: 'C:\\Program Files\\Common Files\\Adobe\\CEP\\extensions\\com.jibo.PixiAnimate',
    outputName: 'PixiAnimate-win.zxp',
    outputDebugName: 'PixiAnimate-win-debug.zxp',
    
    // ZXP plugin packaging options
    packager: '.\\build\\ZXPSignCmd.exe',

    // VS2015 Solution file for building the win32 plugin
    vs2015: './project/win/pixi-animate-vs2015',

    // Command to uncompress to local install folder
    installCmd: '.\\build\\7za.exe x -y -bb0 -o "${installFolder}" "${output}"',

    // List of gulp task to run when creating plugins
    pluginTasks: ['vsvars', 'plugin-win32-debug', 'plugin-win32'],

    // Task to do after staging plugin
    // For windows, copy the dll into the stage folder, very important
    postStage: 'dllcopy'
};