module.exports = function(gulp, options, plugins) {
    gulp.task('pre-install', function(){
        return plugins.fs.mkdirSync(options.installFolder);
    });
};