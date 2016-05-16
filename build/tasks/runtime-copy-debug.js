module.exports = function(gulp, options) {
    gulp.task('runtime-copy-debug', function() {
        return gulp.src(options.runtimeDebugResources)
            .pipe(gulp.dest(options.runtimeDebugOutput));
    });  
};