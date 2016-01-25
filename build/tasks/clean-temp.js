module.exports = function(gulp, options, plugins) {
    gulp.task('clean-temp', function(){
        return plugins.del([options.bundleId]);
    });  
};