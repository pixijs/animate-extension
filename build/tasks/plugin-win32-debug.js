module.exports = function(gulp, options, plugins) {
    gulp.task('plugin-win32-debug', plugins.shell.task([
        //'xcodebuild -project ' + options.xcodeproj + ' -scheme ' + options.name + '.Debug build'
        // TODO: invoke vs2015
    ]));
};
