module.exports = function(gulp, options) {
    gulp.task('watch', ['default'], function(){
        options.argv.buildDebug = true;
        return gulp.watch(options.watchFiles, ['default']);
    });  
};
