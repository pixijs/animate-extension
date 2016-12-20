module.exports = function(gulp, options, plugins) {
    gulp.task('plugin-mac', plugins.shell.task([
        'xcodebuild -project ' + options.projectFile + ' -scheme ' + options.name + '.Release build'
    ], {
        quiet: true
    }));  
};