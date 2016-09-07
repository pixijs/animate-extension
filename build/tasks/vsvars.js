module.exports = function(gulp, options, plugins) {
    gulp.task('vsvars', function() {
        /* This path only works for Visual Studio 2015 (VS14), so this must be updated accordingly with VS studio switch */
        process.env.VCTargetsPath = "C:\\Program Files (x86)\\MSBuild\\Microsoft.Cpp\\v4.0\\V140";
    });
};
