/* eslint no-console: 0, arrow-body-style: 0 */

const gulp = require('gulp');
const path = require('path');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const webpack = require("webpack");
const webpackConfig = require('./webpack.config');
const clean = require('gulp-clean');
const sourcemaps = require('gulp-sourcemaps');
const runSequence = require('run-sequence');
const packageJSON = require('./package.json');

gulp.task('clean', () => {
  return gulp.src(['lib', 'dist'], { read: false })
    .pipe(clean());
});

gulp.task('babel', () => {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('lib'));
});

gulp.task('uglify', () => {
  return gulp.src('dist/milkcocoa.js')
    .pipe(uglify({ mangle: true, compress: true }))

    .pipe(rename('milkcocoa.min.js'))
    .pipe(gulp.dest('dist'))

    .pipe(rename(`milkcocoa.${packageJSON.version}.min.js`))
    .pipe(gulp.dest('dist'));
});

gulp.task('webpack', (done) => {
	webpack(webpackConfig, function() {
		done();
	});
});

gulp.task('compile', (done) => {
  runSequence('clean', 'babel', 'webpack', 'uglify', done);
});


