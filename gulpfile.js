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
            // Resolve lib/ imports via the scripts path setup
            nodePaths: [path.resolve('src/js')],
            logLevel: 'warning',
        }).catch(function(err) {
            console.error('Build failed for ' + bundle.entry + ':', err.message);
        });
    });
});
gulp.task('js', gulp.parallel(bundles.map(function (bundle) {
    return 'js-' + bundle.entry;
})));

gulp.task('start-server', function() {
    connect.server({ root: 'dist', livereload: true });
});

gulp.task('release', function (cb) {
    // NOTE: This task uses child_process.exec intentionally for interactive CLI prompts.
    // The inputs come from the developer at the terminal, not from untrusted sources.
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
                            git('commit -m "Bumped version to ' + nextTag + '" package.json README.md', function () {
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
gulp.task('serve', gulp.series('watch', 'start-server'));
gulp.task('default', gulp.series('compile'));
