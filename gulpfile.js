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

gulp.task('clean', function (done) {
    return del(['out/**', '!out', '!out/src/bll/credentialsstore/linux', '!out/src/bll/credentialsstore/osx', '!out/src/bll/credentialsstore/win32'], done);
});

gulp.task('copyresources', ['clean'],  function() {
    return gulp.src('resources/**/*')
        .pipe(gulp.dest('out/resources'));
});

gulp.task('build', ['copyresources'], function () {
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
});

gulp.task('publishbuild', ['build'], function () {
    gulp.src(['./src/bll/credentialsstore/**/*.js'])
        .pipe(gulp.dest('./out/src/bll/credentialsstore'));
    gulp.src(['./src/bll/credentialsstore/bin/win32/*'])
        .pipe(gulp.dest('./out/src/bll/credentialsstore/bin/win32'));
});

gulp.task('packageonly', function (cb) {
    exec('vsce package', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('package', ['packageonly'], function (cb) {
    exec('vsce package', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('vsce-version', function (cb) {
    exec('vsce -Version', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('default', ['publishall']);