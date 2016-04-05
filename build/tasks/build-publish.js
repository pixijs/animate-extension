module.exports = function(gulp, options, plugins) {
    gulp.task('build-publish', function() {
        return plugins.build(gulp, options.buildPublish, plugins);
    });
};