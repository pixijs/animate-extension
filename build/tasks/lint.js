module.exports = function(gulp, options, plugins) {
    gulp.task('lint', function(){
        return gulp.src(options.lintFiles)
            .pipe(plugins.eslint({
                extends: "eslint:recommended",
                rules: {
                    "no-console": 0,
                    "no-useless-escape": 0
                },
                parserOptions: {
                    "ecmaVersion": 2017
                },
                envs: ["node", "browser", "es6"]
            }))
            .pipe(plugins.eslint.format())
            .pipe(plugins.eslint.failAfterError());
    });
};
