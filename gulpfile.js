
var gulp = require('gulp')
var babel = require('gulp-babel')
var watch = require('gulp-watch')

gulp.task('build', function(){
    return gulp.src('src/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/'))
})

gulp.task('watch',['build'], function(){
    return watch('src/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/'))
})

gulp.task('default', ['build', 'watch'])