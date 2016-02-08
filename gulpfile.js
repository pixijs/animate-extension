var gulp = require('gulp');

// Options for the load-gulp-tasks
var options = {

    // Name
    name: 'PixiAnimate',

    // Pattern for loading tasks
    pattern: ['build/tasks/*.js'],

    // Contains the project folder
    projectContent: ['extension/**/*'],

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
    runtimeOutput: 'com.jibo.PixiAnimate/runtime',
    runtimeResources: [
        'node_modules/pixi.js/bin/pixi.min.js',
        'node_modules/pixi-animate/dist/pixi-animate.min.js'
    ], 

    privateOutput: 'com.jibo.PixiAnimate/node_modules',
    privateResources: [
        'node_modules/cep/CEP_6.x/CSInterface.js',
        'node_modules/bson/**',
        'node_modules/mkdirp/package.json',
        'node_modules/mkdirp/index.js',
        'node_modules/mkdirp/node_modules/**',
        'node_modules/bisonjs/package.json',
        'node_modules/bisonjs/lib/**',
        'node_modules/uglify-js/**',
        '!node_modules/uglify-js/bin',
        'node_modules/js-beautify/package.json',
        'node_modules/js-beautify/js/**',
        'node_modules/js-beautify/node_modules/**'
    ],

    // The files to source when running watch
    watchFiles: [
        './**/*.*',
        '!node_modules/**',
        '!com.jibo.PixiAnimate',
        '!extension/bin'
    ],
    
    // The files to include for JS linting
    lintFiles: [
        '**/*.js',
        '!node_modules/**',
        '!extension/bin/**',
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