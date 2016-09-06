module.exports = function(gulp, options, plugins) {
    gulp.task('vsvars', function() {
        process.env.VCTargetsPath = "C:\\Program Files (x86)\\MSBuild\\Microsoft.Cpp\\v4.0\\V140";
    });
};
