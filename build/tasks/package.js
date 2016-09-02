module.exports = function(gulp, options, plugins) {
    var output = options.argv.debug ? options.outputDebugName : options.outputName;
    var cmd = options.packager + ' -sign ' +
        '"' + options.bundleId + '" ' +
        '"' + output + '" ' +
        '"' + options.packagerCert + '" ' +
        '"' + options.packagerPass + '" ' +
        '-tsa \"https://timestamp.geotrust.com/tsa\"';
    gulp.task('package', plugins.shell.task([cmd], {
        quiet: false
    }));
};
