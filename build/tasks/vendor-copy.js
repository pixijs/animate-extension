module.exports = function(gulp, options, plugins) {
    gulp.task('vendor-copy', function() {
        return gulp.src(options.vendorResources)
            .pipe(gulp.dest(options.vendorOutput));
    });  
};