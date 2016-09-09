var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var partialify = require('partialify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync').create();

gulp.task('html', function() {
    // Touch the html file
    gulp.src('index.html').pipe(gulp.dest('./'));
});

gulp.task('sass', function() {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
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
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream());
});

gulp.task('start-server', function() {
    connect.server({ root: 'dist', livereload: true });
});

gulp.task('compile', ['html', 'sass', 'js']);
gulp.task('watch', function () {
    browserSync.init({
        proxy: "http://localhost"
    });
    gulp.watch('index.html').on('change', browserSync.reload);
    gulp.watch('src/js/**/*.*', ['js']).on('change', browserSync.reload);
    gulp.watch('./src/sass/**/*.scss', ['sass']).on('change', browserSync.reload);
});
gulp.task('serve', ['watch', 'start-server']);
gulp.task('default', ['compile']);