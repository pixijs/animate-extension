var path = require('path');
module.exports = function(gulp, options, plugins) {
    var src = options.argv.buildDebug ? 
        options.win.pluginTempDebug :
        options.win.pluginTempRelease;

    var pluginFile = options.win.pluginFile;

    gulp.task('plugin-copy-win', function() {
        return gulp.src(src)
            .pipe(plugins.rename(function (url) {
                url.extname = path.extname(pluginFile);
                url.basename = path.basename(pluginFile, url.extname);
            }))
            .pipe(gulp.dest(path.dirname(pluginFile)));
    });  
};
