module.exports = function(gulp, options, plugins) {
    var cmd = "./" + options.packager + ' -sign ' 
        + '"' + options.bundleId + '" ' 
        + '"' + options.outputName + '" ' 
        + '"' + options.packagerCert + '" '
        + '"' + options.packagerPass + '" '
        + '-tsa https://timestamp.geotrust.com/tsa';
    gulp.task('package', plugins.shell.task([cmd], {
        quiet: true
    }));  
};