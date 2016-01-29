module.exports = function(gulp, options, plugins) {
    gulp.task('remote-debug', function() {
        return gulp.src(options.remoteDebug)
            .pipe(plugins.rename(options.remoteDebugOutput))
            .pipe(gulp.dest(options.bundleId));
    });  
};