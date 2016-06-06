var jshint = require('gulp-jshint');
var watch = require('gulp-watch');
var gulp   = require('gulp');

gulp.task('default', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

var cb = function() {
  console.log('Lint complete');
};

gulp.task('watch', function() {
  watch('./src/*.js', function() {
    gulp.src('./src/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
      cb();
  });
});