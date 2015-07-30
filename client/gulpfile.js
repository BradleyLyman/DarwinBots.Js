var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    rename      = require('gulp-rename'),
    browserify  = require('browserify'),
    watchify    = require('watchify'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    assign      = require('assign');

var customOpts = {
  entries : ['./app/js/main.js']
};
var bundler = watchify(browserify(customOpts));

var bundle = function() {
  return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./build/js'));
};
bundler.on('log', gutil.log);
bundler.on('update', bundle);

gulp.task('scripts', bundle);

gulp.task('html', function() {
  return gulp.src('app/**/*.html')
    .pipe(gulp.dest('build'))
    .pipe(reload({stream : true}));
});

gulp.task('browser-sync', function() {
  browserSync({
    server : {
      baseDir : "./build/"
    }
  });
});

gulp.task('watch', function() {
  gulp.watch(['./app/**/*.html'], ['html']);
});

gulp.task('default', ['scripts', 'html', 'browser-sync', 'watch']);





