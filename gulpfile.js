var gulp = require('gulp');

// Options for the load-gulp-tasks
var options = {

    // Name
    name: 'PixiAnimate',

    // Pattern for loading tasks
    pattern: ['build/tasks/*.js'],

    // Contains the project folder
    projectContent: 'extension',

    // XCode project for building the plugin
    xcodeproj: 'project/mac/PixiAnimate.mp.xcodeproj',

    // Temporary build target
    pluginTempDebug:'src/PixiAnimate/lib/mac/debug/PixiAnimate.fcm.plugin',
    pluginTempRelease: 'src/PixiAnimate/lib/mac/release/PixiAnimate.fcm.plugin',
    
    // The target location for the plugin
    pluginFile: 'com.jibo.PixiAnimate/plugin/lib/mac/PixiAnimate.fcm.plugin',
    
    // Temporary staging folder
    bundleId: 'com.jibo.PixiAnimate',
    
    // Local location to install the plugin for Adobe CEP
    installFolder: '/Library/Application Support/Adobe/CEP/extensions/com.jibo.PixiAnimate',
    
    // The name of the ZXP file
    outputName: 'PixiAnimate.zxp',
    outputFile: 'dist/PixiAnimate.zxp',
    
    // ZXP plugin packaging options
    packager: 'build/ZXPSignCmd',
    packagerCert: 'build/certificate.p12',
    packagerPass: 'password'
};

// Gulp plugins for tasks to use
var plugins = {
    del: require('del'),
    colors: require('colors'),
    path: require('path'),
    fs: require('fs'),
    shell: require('gulp-shell'),
    sequence: require('gulp-sequence').use(gulp),
    gutil: require('gulp-util')
};

require('load-gulp-tasks')(gulp, options, plugins);