module.exports = function(gulp, options) {
    gulp.task('vendor-private-copy', function() {
        return gulp.src(options.vendorPrivateResources)
            .pipe(gulp.dest(options.vendorPrivateOutput));
    });  
};