module.exports = function(gulp, options, plugins) {
    gulp.task('clean', function(){
        var debug = options.argv.debug;
        return plugins.del([
            options.bundleId,
            debug ? options.outputDebugName : options.outputName,
            options.pluginFile
        ]);
    });  
};