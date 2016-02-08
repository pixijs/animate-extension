module.exports = function(gulp, options, plugins) {
    gulp.task('clean-stage', function(){
        return plugins.del([options.bundleId]);
    });  
};