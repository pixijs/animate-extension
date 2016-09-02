module.exports = function(gulp, options, plugins) {
    gulp.task('plugin-win32', plugins.shell.task([
        //'xcodebuild -project ' + options.xcodeproj + ' -scheme ' + options.name + '.Release build'
        // TODO: invoke vs2015
    ], {
        quiet: true
    }));
};
