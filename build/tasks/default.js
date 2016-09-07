module.exports = function(gulp, options, plugins) {
    gulp.task('default', function(done){

        var debug = options.argv.debug;
        var plugin = options.argv.plugin;
        var install = options.argv.install;

        plugins.gutil.log("+-------------------+".green);
        plugins.gutil.log("|    PixiAnimate    |".green);
        plugins.gutil.log("+-------------------+".green);
        plugins.gutil.log("Mode: ".gray, (debug ? "Debug" : "Release").yellow);

        var tasks = [];

        if (plugin) {
            tasks.push('plugin');
        }

        tasks.push(
            'clean',
            'lint',
            'stage'
        );

        /* For windows, copy the dll into the stage folder, very important */
        if (options.isWin) {
            tasks.push('dllcopy');
        }

        // Turn on remote debugging
        if (debug) {
            tasks.push('remote-debug');
        }

        tasks.push(
            'build-publish',
            'build-dialog',
            'build-preview-app',
            'build-preview',
            'build-spritesheets',
            'runtime-copy',
            'runtime-copy-debug',
            'move',
            'package',
            'clean-stage'
        );

        if (install)
        {
            tasks.push(
                'uninstall',
                'pre-install',
                'install'
            );
        }


        tasks.push(done);

        plugins.sequence.apply(plugins.sequence, tasks);
    });
};
