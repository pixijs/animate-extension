module.exports = function(gulp, options, plugins) {
    return plugins.browserify({
            entries: options.src,
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
};