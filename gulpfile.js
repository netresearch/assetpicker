var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var partialify = require('partialify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var livereload = require('gulp-livereload');

gulp.task('html', function() {
    // Touch the html file
    gulp.src('index.html').pipe(livereload());
});

gulp.task('sass', function() {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass({functions: {
            'base64Encode($string)': function (string) {
                var encoded = new Buffer(string.getValue()).toString('base64');
                return new sass.compiler.types.String(encoded);
            }
        }}).on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'))
        .pipe(livereload());
});

var bundles = ['app', 'picker', 'adapter/entermediadb', 'adapter/github', 'adapter/googledrive', 'adapter/dummy'];
bundles.forEach(function(bundle) {
    gulp.task('js-' + bundle, function() {
        browserify({
            entries: 'src/js/' + bundle + '/index.js',
            debug: true,
            standalone: 'AssetPicker' + (bundle !== 'picker' ? bundle.replace(/(^|\/)([a-z])/g, function (m) { return (m.length > 1 ? m[1] : m).toUpperCase() }) : '')
        })
            .transform(partialify)
            .bundle()
            .on('error', function (err) {
                console.log(err.toString());
                this.emit("end");
            })
            .pipe(source(bundle + '.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify())
            .on('error', function (err) {
                console.log(err.toString());
                this.emit("end");
            })
            .pipe(sourcemaps.write('maps'))
            .pipe(gulp.dest('dist/js'))
            .pipe(livereload());
    });
});
gulp.task('js', bundles.map(function (bundle) {
    return 'js-' + bundle;
}));

gulp.task('start-server', function() {
    connect.server({ root: 'dist', livereload: true });
});

gulp.task('compile', ['html', 'sass', 'js']);
gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('index*.html', ['html']);
    bundles.forEach(function(bundle) {
        gulp.watch('src/js/' + bundle + '/**/*.*', ['js-' + bundle]);
    });
    gulp.watch('src/js/shared/**/*.*', ['js']);
    gulp.watch('src/sass/**/*.scss', ['sass']);
});
gulp.task('serve', ['watch', 'start-server']);
gulp.task('default', ['compile']);
