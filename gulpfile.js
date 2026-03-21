var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var livereload = require('gulp-livereload');
var esbuild = require('esbuild');
var path = require('path');

gulp.task('html', function() {
    return gulp.src('index.html').pipe(livereload());
});

gulp.task('sass', function() {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass({
            // Legacy SCSS uses deprecated patterns; silence until migrated to @use
            silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function'],
        }).on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'))
        .pipe(livereload());
});

var bundles = [
    { entry: 'app', globalName: 'AssetPickerApp' },
    { entry: 'picker', globalName: 'AssetPicker' },
    { entry: 'adapter/entermediadb', globalName: 'AssetPickerAdapterEntermediadb' },
    { entry: 'adapter/github', globalName: 'AssetPickerAdapterGithub' },
    { entry: 'adapter/googledrive', globalName: 'AssetPickerAdapterGoogledrive' },
    { entry: 'adapter/dummy', globalName: 'AssetPickerAdapterDummy' },
];

bundles.forEach(function(bundle) {
    gulp.task('js-' + bundle.entry, function() {
        return esbuild.build({
            entryPoints: ['src/js/' + bundle.entry + '/index.js'],
            bundle: true,
            outfile: 'dist/js/' + bundle.entry + '.js',
            globalName: bundle.globalName,
            format: 'iife',
            sourcemap: true,
            minify: true,
            loader: {
                '.html': 'text',
                '.css': 'text',
            },
            nodePaths: [path.resolve('src/js')],
            logLevel: 'warning',
        }).then(function() {
            // Notify livereload after esbuild writes the bundle
            return gulp.src('dist/js/' + bundle.entry + '.js').pipe(livereload());
        }).catch(function(err) {
            console.error('Build failed for ' + bundle.entry + ':', err.message);
        });
    });
});
gulp.task('js', gulp.parallel(bundles.map(function (bundle) {
    return 'js-' + bundle.entry;
})));

gulp.task('compile', gulp.series('html', 'sass', 'js'));
gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('index*.html', gulp.series('html'));
    bundles.forEach(function(bundle) {
        gulp.watch('src/js/' + bundle.entry + '/**/*.*', gulp.series('js-' + bundle.entry));
    });
    gulp.watch('src/js/shared/**/*.*', gulp.series('js'));
    gulp.watch('src/sass/**/*.scss', gulp.series('sass'));
});
gulp.task('default', gulp.series('compile'));
