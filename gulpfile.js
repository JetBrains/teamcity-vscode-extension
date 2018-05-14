'use strict';

var gulp = require('gulp');
var exec = require('child_process').exec;
var del = require('del');
var typescript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');

function errorHandler(err) {
    console.error(err.message);
    process.exit(1);
}

gulp.task('clean', (done) => {
    del.sync(['out/**']);
    done();
});

gulp.task('build', gulp.parallel('clean', function () {
    var tsProject = typescript.createProject('./tsconfig.json');
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .on('error', errorHandler);

    return tsResult.js
        .pipe(sourcemaps.write('.', {
            sourceRoot: function (file) {
                // This override is needed because of a bug in sourcemaps base logic.
                // "file.base"" is the out dir where all the js and map files are located.
                return file.base;
            }
        }))
        .pipe(gulp.dest('./out'));
}));

gulp.task('publishbuild', gulp.parallel('build', function () {
    gulp.src(['./src/bll/credentialsstore/**/*.js'])
        .pipe(gulp.dest('./out/src/bll/credentialsstore'));
    return gulp.src(['./src/bll/credentialsstore/bin/win32/*'])
        .pipe(gulp.dest('./out/src/bll/credentialsstore/bin/win32'));
}));

gulp.task('packageonly', function (cb) {
    exec('vsce package', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('package', gulp.parallel('packageonly', function (cb) {
    exec('vsce package', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
}));

gulp.task('vsce-version', function (cb) {
    exec('vsce -Version', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('default',  gulp.parallel('publishbuild'));