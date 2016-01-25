var gulp = require('gulp');

// The name of the project
var name = 'PixiAnimate';

// The bundle id for the extension
var id = 'com.jibo.PixiAnimate';

// Options for the load-gulp-tasks
var options = {

    // Name
    name: name,

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
    pluginFile:  id + '/plugin/lib/mac/PixiAnimate.fcm.plugin',
    
    // Temporary staging folder
    bundleId: id,
    
    // Local location to install the plugin for Adobe CEP
    installFolder: '/Library/Application Support/Adobe/CEP/extensions/' + id,
    
    // The name of the ZXP file
    outputName: name + '.zxp',
    outputFile: 'dist/' + name + '.zxp',
    
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