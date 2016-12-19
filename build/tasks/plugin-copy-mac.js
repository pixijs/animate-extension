module.exports = function(gulp, options) {
    var src = options.argv.debug ? 
        options.mac.pluginTempDebug :
        options.mac.pluginTempRelease;

    gulp.task('plugin-copy-mac', function() {
        return gulp.src(src + "/**/*")
            .pipe(gulp.dest(options.mac.pluginFile));
    });  
};