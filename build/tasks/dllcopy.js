module.exports = function(gulp, options, plugins) {
    var type = options.argv.debug ? "Debug" : "Release";
    var dllSource = options.vs2015 + "/x64/" + type;
    var dest = 'src/PixiAnimate/lib/win';

    gulp.task('dllcopy', function() {
        gulp.src(dllSource + "/*.dll")
        .pipe(plugins.rename(function (path) {
            path.extname = ".fcm";
        }))
        .pipe(gulp.dest(dest));
    });
};
