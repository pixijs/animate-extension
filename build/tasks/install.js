module.exports = function(gulp, options, plugins) {
    var output = options.argv.debug ? 
        options.outputDebugName :
        options.outputName;
    
    var cmd = options.installCmd
        .replace('${installFolder}', options.installFolder)
        .replace('${output}', output);

    gulp.task('install', plugins.shell.task([cmd],  {
        'quiet': !options.argv.debug
    }));
};
