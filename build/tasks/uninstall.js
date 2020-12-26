module.exports = function(gulp, options, plugins) {
    if (/^win/.test(process.platform)) {
        gulp.task('uninstall', function () {
            // nothing worth doing here, as there isn't a good way to only remove if installed - the extension manager
            // returns an error when not installed
            return gulp.src('.');
        });
    }
    else {
        gulp.task('uninstall', function(){
            return plugins.del([options.installFolder], {
                force: true
            });
        });
    }
};