module.exports = function(gulp, options, plugins) {
    gulp.task('default', function(done){

        var debug = options.argv.debug;

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
            'vendor-public-copy',
            'vendor-private-copy',
            'move',
            'package',
            'clean-stage',
            'uninstall',
            'pre-install',
            'install',
            done
        );

        plugins.sequence.apply(plugins.sequence, tasks);
    });  
};