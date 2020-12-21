module.exports = function(gulp, options, plugins) {
    gulp.task('clean-all', function(done) {
        gulp.series('clean', 'clean-build', 'uninstall', done);
    });
};