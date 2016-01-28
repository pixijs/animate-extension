module.exports = function(gulp, options) {
    var src = options.argv.debug ? options.pluginTempDebug : options.pluginTempRelease;
    gulp.task('move', function() {
        return gulp.src(src + "/**/*")
            .pipe(gulp.dest(options.pluginFile));
    });  
};