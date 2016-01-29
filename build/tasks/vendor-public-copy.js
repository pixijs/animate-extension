module.exports = function(gulp, options) {
    gulp.task('vendor-public-copy', function() {
        return gulp.src(options.vendorPublicResources)
            .pipe(gulp.dest(options.vendorPublicOutput));
    });  
};