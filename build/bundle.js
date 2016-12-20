module.exports = function(gulp, options, plugins, debug) {
    return plugins.browserify({
            entries: options.src,
            ignoreMissing: true,
            detectGlobals: false,
            bare: true,
            debug: !!debug,
            builtins: false
        })
        .bundle()
        .pipe(plugins.source(options.name || 'index.js'))
        .pipe(plugins.buffer())
        .pipe(plugins.gulpif(!debug, plugins.uglify()))
        .pipe(gulp.dest(options.dest));
};