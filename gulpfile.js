/* eslint no-console: 0, arrow-body-style: 0 */

const gulp = require('gulp');
const path = require('path');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const sourcemaps = require('gulp-sourcemaps');

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