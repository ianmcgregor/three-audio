/* jshint strict: false */
var gulp = require('gulp'),
    browserify = require('browserify'),
    connect = require('gulp-connect'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    gulpIf = require('gulp-if'),
    strip = require('gulp-strip-debug'),
    streamify = require('gulp-streamify'),
    source = require('vinyl-source-stream'),
    jshint = require('gulp-jshint'),
    chalk = require('chalk');

// paths and file names
var src = './src',
    dist = './dist',
    jsSrc = src+'/js/',
    jsIndex = 'main.js',
    jsDist = dist+'/js/',
    jsBundle = 'bundle.js',
    vendors = src+'/vendor/';

//log
function logError(msg) {
  console.log(chalk.bold.red('[ERROR]'), msg);
}

// build bundled js using browserify
function buildJS(debug) {
  return browserify(jsSrc+jsIndex, { debug: debug })
    .bundle()
    .on('error', logError)
    .pipe(source(jsSrc+jsIndex))
    .pipe(gulpIf(!debug, streamify(strip())))
    .pipe(gulpIf(!debug, streamify(uglify())))
    //.pipe(rename({suffix: '.min'}))
    .pipe(rename(jsBundle))
    .pipe(gulp.dest(jsDist))
    .pipe(connect.reload());
}
gulp.task('js', function() {
  buildJS(true);
});
gulp.task('js-release', function() {
  buildJS(false);
});

// js hint - ignore libraries and bundled
gulp.task('jshint', function() {
  return gulp.src([
      './gulpfile.js',
      jsSrc+'/**/*.js',
      '!'+vendors+'**/*.js',
      '!'+jsSrc+'/lib/**/*.js',
      '!'+jsDist+jsBundle
    ])
    .pipe(jshint({
      'node': true,
      'browser': true,
      'es5': false,
      'esnext': true,
      'bitwise': false,
      'camelcase': false,
      'curly': true,
      'eqeqeq': true,
      'immed': true,
      'latedef': true,
      'newcap': true,
      'noarg': true,
      'quotmark': 'single',
      'regexp': true,
      'undef': true,
      'unused': true,
      'strict': true,
      'trailing': true,

      'predef': [
          'Modernizr',
          'ga'
      ]
  }))
  .pipe(jshint.reporter('jshint-stylish'));
});

// connect with live reload
gulp.task('connect', function() {
  connect.server({
    root: dist,
    livereload: true
  });
});

// watch
gulp.task('watch', function() {
  gulp.watch(jsSrc+'**/*.js', ['js']);
});

// default
gulp.task('default', ['connect', 'watch']);
gulp.task('default-editor', ['connect', 'watch-editor']);
