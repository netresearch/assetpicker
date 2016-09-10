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
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'))
        .pipe(livereload());
});

var bundles = ['app', 'picker'];
bundles.forEach(function(bundle) {
    gulp.task('js-' + bundle, function() {
        browserify({
            entries: 'src/js/' + bundle + '/index.js',
            debug: true
        })
            .transform(partialify)
            .bundle()
            .on('error', function (err) {
                console.log(err.toString());
                this.emit("end");
            })
            .pipe(source(bundle + '.min.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify())
            .on('error', function (err) {
                console.log(err.toString());
                this.emit("end");
            })
            .pipe(sourcemaps.write())
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
    gulp.watch('index.html', ['html']);
    bundles.forEach(function(bundle) {
        gulp.watch('src/js/' + bundle + '/**/*.*', ['js-' + bundle]);
    });
    gulp.watch('src/sass/**/*.scss', ['sass']);
});
gulp.task('serve', ['watch', 'start-server']);
gulp.task('default', ['compile']);
