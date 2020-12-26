module.exports = function(gulp, options, plugins) {
    gulp.task('pre-install', function(){
        if (!/^win/.test(process.platform)) {
            return plugins.fs.mkdirSync(options.installFolder);
        }
        else
        {
            return gulp.src('.');
        }
    });
};