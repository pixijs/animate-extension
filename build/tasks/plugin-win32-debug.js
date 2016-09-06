module.exports = function(gulp, options, plugins) {
    gulp.task('plugin-win32-debug', function() {
        return gulp.src(options.vs2015)
            .pipe(plugins.msbuild({
                targets: ['Clean', 'Build'],
                properties: { Configuration: 'Debug' },
                architecture: 'x64',
                fileLoggerParameters: 'LogFile=Build.log;Append;Verbosity=diagnostic'
            }));
        });
};
