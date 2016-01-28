module.exports = function(gulp, options, plugins) {
    gulp.task('lint', function(){
        return gulp.src([
                '**/*.js',
                '!node_modules/**',
                '!extension/runtime/**',
                '!extension/templates/**',
                '!src/**'
            ])
            .pipe(plugins.eslint({
                extends: 'eslint:recommended', 
                rules: {
                    "no-console": 0
                },
                ecmaFeatures: {
                    modules: true
                },
                env: {
                    node: true,
                    browser: true,
                    es6: true
                }
            }))
            .pipe(plugins.eslint.format())
            .pipe(plugins.eslint.failAfterError());
    });  
};