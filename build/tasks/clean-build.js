module.exports = function(gulp, options, plugins) {
    gulp.task('clean-build', function(){
        return plugins.del([
            options.pluginTempDebug,
            options.pluginTempRelease,
            'project/mac/build'
        ]);
    });  
};