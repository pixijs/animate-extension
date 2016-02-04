module.exports = function(gulp, options) {
    gulp.task('vendor-private-copy', function() {
        return gulp.src(options.vendorPrivateResources, { base: './node_modules' })
            .pipe(gulp.dest(options.vendorPrivateOutput));
    });  
};