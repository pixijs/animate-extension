module.exports = function(gulp, options) {
    gulp.task('node-modules-copy', function() {
        return gulp.src(options.privateResources, { base: './node_modules' })
            .pipe(gulp.dest(options.privateOutput));
    });  
};