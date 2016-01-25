module.exports = function(gulp, options, plugins) {
    // Move the plugin to the extension folder
    gulp.task('stage', function() {
        return gulp.src(options.projectContent + "/**/*")
            .pipe(gulp.dest(options.bundleId));
    });  
};