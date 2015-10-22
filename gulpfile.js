var gulp   = require('gulp'),
    eslint = require('gulp-eslint');

gulp.task('lint', function() {
  return gulp.src(['./src/parser/ast/*'])
    .pipe(eslint())
    .pipe(eslint.format('tap'));
});

gulp.task('watch', function() {
  gulp.watch(['./src/parser/ast/*'], ['lint']);
});

gulp.task('default', ['watch']);
