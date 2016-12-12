module.exports = function(gulp, options, plugins) {
    gulp.task('plugin', function(done) {
        var pluginTasks = options.pluginTasks.slice(0);
        pluginTasks.push(done);
        plugins.sequence.apply(plugins.sequence, pluginTasks);
    });
};
