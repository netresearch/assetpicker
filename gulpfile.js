var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var partialify = require('partialify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task('html', function() {
    // Touch the html file
    gulp.src('index.html').pipe(gulp.dest('./'));
});

gulp.task('sass', function() {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('js', function() {
    browserify({
        entries: 'src/js/app.js',
        debug: true
    })
    .transform(partialify)
    .bundle()
    .on('error', function (err) {
        console.log(err.toString());
        this.emit("end");
    })
    .pipe(source('app.min.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .on('error', function (err) {
            console.log(err.toString());
            this.emit("end");
        })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('start-server', function() {
    connect.server({ root: 'dist', livereload: true });
});

gulp.task('watch:sass', function() {
    gulp.watch('./src/sass/**/*.scss', ['html', 'sass']);
});

gulp.task('watch:js', function() {
    gulp.watch('src/js/**/*.*', ['html', 'js']);
});

gulp.task('compile', ['html', 'sass', 'js']);
gulp.task('watch', ['watch:js', 'watch:sass']);
gulp.task('serve', ['watch', 'start-server']);
gulp.task('default', ['compile']);