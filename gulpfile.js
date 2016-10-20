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

gulp.task('release', function (cb) {
    const readline = require('readline'),
          cp = require('child_process'),
          fs = require('fs');
    var ask = function (question, options, callback) {
            question += ' ';
            if (typeof options === 'function') {
                callback = options;
                options = undefined;
            } else {
                question += '[' + options.join(',') + '] ';
            }
            var rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                }),
                handler = function(answer) {
                    if (options && options.indexOf(answer) === -1) {
                        console.log('Invalid answer - please type ' + options.slice(0, -1).join(', ') + ' or ' + options.slice(0).pop());
                        rl.question(question, handler);
                        return;
                    }
                    callback(answer);
                    rl.close();
                };
            rl.question(question, handler);
        },
        git = function (command, successCallback, errorCallback) {
            cp.exec('git ' + command, function(err, stdout, stderr) {
                if (err) {
                    if (errorCallback) {
                        errorCallback(stderr);
                    } else {
                        console.error(stderr);
                        cb('git ' + command + ' failed');
                    }
                } else if (successCallback) {
                    successCallback(stdout.replace(/\s+$/, ''));
                }
            });
        };
    git ('status -s', function (changes) {
        var proceed = function () {
            git('tag -l', function (tags) {
                var tag = tags.split("\n").pop();
                console.log('The latest tag is ' + tag + ' - choose which should be the next:');
                var parts = tag.split('.'), nextTags = {};
                for (var i = parts.length - 1; i >= 0; i--) {
                    var currentParts = parts.slice(0), n = parts.length - i;
                    for (j = parts.length - 1; j > i; j--) {
                        currentParts[j] = 0;
                    }
                    currentParts[i] = parseInt(parts[i]) + 1;
                    nextTags[n] = currentParts.join('.');
                    console.log(n + ') ' + nextTags[n]);
                }
                ask('Next version?', Object.keys(nextTags), function (nextTag) {
                    nextTag = nextTags[nextTag];
                    cp.exec('npm version --no-git-tag-version ' + nextTag, function (err, stdout, stderr) {
                        if (err) {
                            if (stderr.toString().indexOf('Version not changed') === -1) {
                                throw stderr.toString();
                            }
                        }
                        cp.exec('npm publish', function (err, stdout, stderr) {
                            if (err) {
                                if (stderr.toString().match(/code\s+ENEEDAUTH/)) {
                                    cb('Not authenticated to npm - run npm adduser');
                                    return;
                                } else {
                                    throw stderr.toString();
                                }
                            }
                            fs.writeFileSync(
                                'README.md',
                                fs.readFileSync('README.md').toString().replace(new RegExp(tag.replace(/\./, '\\.'), 'g'), nextTag)
                            );
                            git('commit -m "Bumped version to' + nextTag + '" package.json README.md', function () {
                                git('log ' + tag + '..HEAD --format="- %s"', function (log) {
                                    fs.writeFileSync('.commit-msg', 'Tagging ' + nextTag + ":\n" + log);
                                    git('tag -a ' + nextTag + ' -F .commit-msg', function () {
                                        fs.unlinkSync('.commit-msg');
                                        git('push --follow-tags', function () {
                                            cb();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        };
        if (changes) {
            ask("You have uncommited changes:\n" + changes + "\nDo you want to proceed without commiting them?", ['y', 'n'], function (answer) {
                if (answer === 'y') {
                    proceed();
                } else {
                    cb();
                }
            });
        } else {
            proceed();
        }
    });
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
