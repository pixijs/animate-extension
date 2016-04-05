module.exports = function(gulp, options, plugins) {
    gulp.task('default', function(done){

        var debug = options.argv.debug;
        var install = options.argv.install;

        plugins.gutil.log("+-------------------+".green);
        plugins.gutil.log("|    PixiAnimate    |".green);
        plugins.gutil.log("+-------------------+".green);
        plugins.gutil.log("Mode: ".gray, (debug ? "Debug" : "Release").yellow);
        
        var tasks = [];

        tasks.push(
            'clean', 
            'lint', 
            'xcodebuild',
            'stage'
        );

        // Turn on remote debugging
        if (debug) {
            tasks.push('remote-debug');
        }

        tasks.push(
            'build-publish',
            'build-dialog',
            'build-preview-app',
            'build-preview',
            'runtime-copy',
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