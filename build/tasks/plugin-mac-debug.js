module.exports = function(gulp, options, plugins) {
    gulp.task('plugin-mac-debug', plugins.shell.task([
        'xcodebuild -project ' + options.projectFile + ' -scheme ' + options.name + '.Debug build'
    ]));  
};