module.exports = function (gulp, options, plugins) {
    gulp.task('clean-output', function () {
        var output = options.argv.buildDebug ?
            options.outputDebugName :
            options.outputName;
        return plugins.del([
            output
        ]);
    });
};