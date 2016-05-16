module.exports = function(gulp, options, plugins) {
    gulp.task('plugin-mac', plugins.shell.task([
        'xcodebuild -project ' + options.xcodeproj + ' -scheme ' + options.name + '.Release build'
    ], {
        quiet: true
    }));  
};