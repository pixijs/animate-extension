module.exports = function(gulp, options, plugins) {
    var output = options.argv.debug ? options.outputDebugName : options.outputName;
    var cmd = 'tar -xzf "' + output + '" -C "' + options.installFolder + '"';
    gulp.task('install', plugins.shell.task([cmd])); 
};