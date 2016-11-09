module.exports = function(gulp, options, plugins) {
    var type = options.argv.debug ? "Debug" : "Release";
    var dllSource = options.vs2015 + "/x64/" + type;
    var dest = options.bundleId + '/plugin/lib/win';

    gulp.task('dllcopy', function() {
        gulp.src(dllSource + "/*.dll")
        .pipe(plugins.rename(function (path) {
            path.extname = ".fcm";
            path.basename = options.name;
        }))
        .pipe(gulp.dest(dest));
    });
};
