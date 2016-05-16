module.exports = function(gulp, options, plugins) {
    gulp.task('plugin-mac-debug', plugins.shell.task([
        'xcodebuild -project ' + options.xcodeproj + ' -scheme ' + options.name + '.Debug build'
    ]));  
};