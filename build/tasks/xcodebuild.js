module.exports = function(gulp, options, plugins) {
    var target = (options.argv.debug ? 'Debug' : 'Release');
    var scheme = options.name + '.' + target;
    gulp.task('xcodebuild', plugins.shell.task([
        'xcodebuild -project ' + options.xcodeproj + ' -scheme ' + scheme + ' build'
    ], {
        quiet: !options.argv.debug
    }));  
};