module.exports = function(gulp, options, plugins) {
    var output = options.argv.buildDebug ? 
        options.outputDebugName :
        options.outputName;
    var cmd = options.packager + ' -sign ' +
        '"' + options.bundleId + '" ' +
        '"' + output + '" ' +
        '"' + options.packagerCert + '" ' +
        '"' + options.packagerPass + '" ' +
        '-tsa \"http://sha1timestamp.ws.symantec.com/sha1/timestamp\"';
    gulp.task('package', plugins.shell.task([cmd], {
        quiet: false
    }));
};
