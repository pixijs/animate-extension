var gulp = require('gulp');
var process = require('process');

/* This flag is used to detect windows systems */
var isWin = /^win/.test(process.platform);

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

    // VS2015 Solution file for building the win32 plugin
    vs2015: 'project/win/pixi-animate-vs2015/pixi-animate-vs2015.sln',

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

    // The name of the ZXP file
    outputDebugName: 'PixiAnimate.debug.zxp',

    // Remote debugging for panels in Flash
    remoteDebug: 'build/debug.xml',
    remoteDebugOutput: '.debug',

    // ZXP plugin packaging options
    packager: isWin ? '.\\build\\ZXPSignCmd.exe' : './build/ZXPSignCmd',
    packagerCert: 'build/certificate.p12',
    packagerPass: 'password',

    // Vendor release for the runtime
    runtimeOutput: 'com.jibo.PixiAnimate/runtime',
    runtimeDebugOutput: 'com.jibo.PixiAnimate/runtime-debug',
    runtimeResources: [
        'node_modules/pixi-animate/dist/pixi.min.js',
        'node_modules/pixi-animate/dist/pixi-animate.min.js'
    ],
    runtimeDebugResources: [
        'node_modules/pixi-animate/dist/pixi.js',
        'node_modules/pixi-animate/dist/pixi.js.map',
        'node_modules/pixi-animate/dist/pixi-animate.js',
        'node_modules/pixi-animate/dist/pixi-animate.js.map'
    ],

    // The files to source when running watch
    watchFiles: [
        './**/*.*',
        '!node_modules/**',
        '!extension/node_modules/**',
        '!com.jibo.PixiAnimate',
        '!extension/dialog/cep/**',
        '!extension/bin'
    ],

    // The files to include for JS linting
    lintFiles: [
        'build/**/*.js',
        'src/extension/**/*.js',
        'gulpfile.js'
    ],

    buildPublish: {
        src: 'src/extension/publish',
        dest: 'com.jibo.PixiAnimate/publish'
    },

    buildSpritesheets: {
        src: 'src/extension/publish/spritesheets/',
        name: 'spritesheets.js',
        dest: 'com.jibo.PixiAnimate/publish'
    },

    buildPreview: {
        src: 'src/extension/preview/preview.js',
        name: 'preview.js',
        dest: 'com.jibo.PixiAnimate/preview'
    },

    buildPreviewApp: {
        src: 'src/extension/preview',
        dest: 'com.jibo.PixiAnimate/preview'
    },

    buildDialog: {
        src: 'src/extension/dialog',
        name: 'main.js',
        dest: 'com.jibo.PixiAnimate/dialog'
    }
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
    eslint: require('gulp-eslint'),
    install: require('gulp-install'),
    browserify: require('browserify'),
    buffer: require('vinyl-buffer'),
    strip: require('gulp-strip-comments'),
    whitespace: require('gulp-whitespace'),
    source: require('vinyl-source-stream'),
    build: function(gulp, options, plugins) {
        return plugins.browserify({
                entries: options.src, //'./src/extension/publish/index.js',
                ignoreMissing: true,
                detectGlobals: false,
                bare: true,
                debug: false,
                builtins: false
            })
            .bundle()
            .pipe(plugins.source(options.name || 'index.js'))
            .pipe(plugins.buffer())
            .pipe(plugins.strip())
            .pipe(plugins.whitespace({
                removeLeading: true,
                removeTrailing: true
            }))
            .pipe(gulp.dest(options.dest));
    }
};

require('load-gulp-tasks')(gulp, options, plugins);
