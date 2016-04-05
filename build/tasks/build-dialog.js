module.exports = function(gulp, options, plugins) {
    gulp.task('build-dialog', function() {
        return plugins.build(gulp, options.buildDialog, plugins);
    });
};