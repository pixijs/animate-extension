module.exports = function(gulp, options, plugins) {
    var output = options.argv.debug ? options.outputDebugName : options.outputName;
    var cmd = "";
    if (options.isWin) {
        cmd = '.\\build\\7za.exe x -y -o"' + options.installFolder + '" "' + output  + '"';
    }
    else {
        cmd = 'tar -xzf "' + output + '" -C "' + options.installFolder + '"';
    }

    gulp.task('install', plugins.shell.task([cmd]));
};
