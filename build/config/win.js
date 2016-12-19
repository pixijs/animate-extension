module.exports = {
    pluginTempDebug: 'project/win/pixi-animate-vs2015/x64/Debug/pixi-animate-vs2015.dll',
    pluginTempRelease: 'project/win/pixi-animate-vs2015/x64/Release/pixi-animate-vs2015.dll',
    pluginFile: 'com.jibo.PixiAnimate/plugin/lib/win/PixiAnimate.fcm',
    installFolder: 'C:\\Program Files\\Common Files\\Adobe\\CEP\\extensions\\com.jibo.PixiAnimate',
    
    // ZXP plugin packaging options
    packager: '.\\build\\bin\\ZXPSignCmd.exe',

    // VS2015 Solution file for building the win32 plugin
    vs2015: './project/win/pixi-animate-vs2015',

    // Command to uncompress to local install folder
    installCmd: '.\\build\\bin\\7za.exe x -y -bb0 -o"${installFolder}" "${output}"',

    // List of gulp task to run when creating plugins
    pluginTasks: ['vsvars', 'plugin-win-debug', 'plugin-win']
};