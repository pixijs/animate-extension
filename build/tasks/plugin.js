var platform = process.platform;
module.exports = function(gulp, options, plugins) {
    gulp.task('plugin', function(done) {
        if (/^darwin/.test(platform)) {
            plugins.sequence(
                'plugin-mac',
                'plugin-mac-debug',
                done
            );
        }
        // TODO Add window building process
        else if (/^win/.test(platform)) {
            plugins.sequence(
                'plugin-win32',
                'plugin-win32-debug',
                done
            );
        }
        else {
            console.log(("Platform '"+platform+"' not supported for plugin building.").red);
            done();
        }
    });
};
