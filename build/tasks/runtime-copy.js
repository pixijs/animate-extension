module.exports = function(gulp, options) {
    gulp.task('runtime-copy', function() {
        return gulp.src(options.runtimeResources)
            .pipe(gulp.dest(options.runtimeOutput));
    });  
};