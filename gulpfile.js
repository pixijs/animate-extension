var gulp = require('gulp');

// Mixin the platform specific options
var platformOptions;

// Window-specific configuration
if (/^win/.test(process.platform)) {
    platformOptions = require('./build/config/win');
}
// Mac-specific configuration
else if (/^darwin/.test(process.platform)) {
    platformOptions = require('./build/config/mac');
}
else {
    console.log('Platform is not supported');
    process.exit(1);
}

// Merge the platform options into the default
var options = Object.assign(
    require('./build/config'),
    platformOptions
);

console.log(options);

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
    msbuild: require('gulp-msbuild'),
    build: require('./build/bundle')
};

require('load-gulp-tasks')(gulp, options, plugins);
