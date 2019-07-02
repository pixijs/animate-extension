module.exports = function(gulp, options, plugins) {
    gulp.task('build-preview', function() {
        return plugins.build(
            gulp,
            options.buildPreview,
            plugins, 
            options.argv.buildDebug
        );
    });
};