module.exports = function(gulp, options) {
    gulp.task('watch', ['default'], function(){
        options.argv.debug = true;
        return gulp.watch(options.watchFiles, ['default']);
    });  
};
