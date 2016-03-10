module.exports = function(gulp, options, plugins) {
    gulp.task('extension-modules', function() {
        return gulp.src('extension/package.json')
            .pipe(plugins.install());
    });  
};