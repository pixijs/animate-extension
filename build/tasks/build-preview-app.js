module.exports = function(gulp, options, plugins) {
    gulp.task('build-preview-app', function() {
        return plugins.build(
            gulp,
            options.buildPreviewApp,
            plugins, 
            options.argv.debug
        );
    });
};