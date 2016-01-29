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

    // Remote debugging for panels in Flash
    remoteDebug: 'build/debug.xml',
    remoteDebugOutput: '.debug',
    
    // ZXP plugin packaging options
    packager: 'build/ZXPSignCmd',
    packagerCert: 'build/certificate.p12',
    packagerPass: 'password',

    // Vendor release for the runtime
    vendorOutput: 'com.jibo.PixiAnimate/vendor',
    vendorResources: [
        'node_modules/pixi.js/bin/pixi.min.js',
        'node_modules/pixi-animate/dist/pixi-animate.min.js'
    ],

    // The files to source when running watch
    watchFiles: [
        './**/*.*',
        '!node_modules/**',
        '!com.jibo.PixiAnimate'
    ],
    
    // The files to include for JS linting
    lintFiles: [
        '**/*.js',
        '!node_modules/**',
        '!extension/runtime/**',
        '!extension/templates/**',
        '!src/**'
    ]
};

// Gulp plugins for tasks to use
var plugins = {
    del: require('del'),
    colors: require('colors'),
    path: require('path'),
    fs: require('fs'),
    shell: require('gulp-shell'),
    sequence: require('gulp-sequence').use(gulp),
    gutil: require('gulp-util'),
    rename: require('gulp-rename'),
    eslint: require('gulp-eslint')
};

require('load-gulp-tasks')(gulp, options, plugins);