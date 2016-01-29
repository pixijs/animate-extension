module.exports = function(gulp, options, plugins) {
    gulp.task('uninstall', function(){
        return plugins.del([options.installFolder], {
            force: true
        });
    });  
};