module.exports = function(gulp, options, plugins) {
    gulp.task('build-spritesheets', function() {
        return plugins.build(
            gulp,
            options.buildSpritesheets,
            plugins, 
            options.argv.buildDebug
        );
    });
};