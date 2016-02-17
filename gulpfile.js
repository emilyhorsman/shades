/*
 * This is a recommended autoprefixer/sass setup. The resulting build file is
 * not necessarily recommended for use.
 */

var autoprefixer = require('autoprefixer')
var concat       = require('gulp-concat')
var gulp         = require('gulp')
var plumber      = require('gulp-plumber')
var postcss      = require('gulp-postcss')
var sass         = require('gulp-sass')
var scss         = require('postcss-scss')

// Wrap the src function with gulp-plumber so that syntax errors are handled.
gulp._src = gulp.src
gulp.src = function() {
  return gulp._src.apply(gulp, arguments).pipe(plumber())
}

// Add a class for every available mixin, e.g.:
// @mixin clearfix { … } produces:
// .clearfix { @include clearfix; }
var addClassForMixins = function(css, opts) {
  css.walkAtRules(function(rule) {
    if (rule.name !== 'mixin') {
      return
    }

    // If the mixin has a parameter signature then don’t handle it (yet)
    if (rule.params.indexOf('(') !== -1) {
      return
    }

    rule.parent.append('.'  + rule.params + ' { @include ' + rule.params + '; }')
  })
}

gulp.task('build', function() {
  return gulp.src(['global.scss', 'shades.scss'])
    .pipe(postcss([ addClassForMixins ], { syntax: scss }))
    .pipe(sass())
    .pipe(postcss([ autoprefixer ]))
    .pipe(concat('./build/shades.css'))
    .pipe(gulp.dest('./'))
})

gulp.task('default', ['build'])
