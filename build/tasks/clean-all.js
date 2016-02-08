module.exports = function(gulp, options, plugins) {
    gulp.task('clean-all', function(done){
        plugins.sequence('clean', 'clean-build', 'uninstall', done);
    });  
};