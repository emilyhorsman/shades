/*
 * This is a recommended autoprefixer/sass setup. The resulting build file is
 * not necessarily recommended for use.
 */

var autoprefixer = require('autoprefixer')
var cssnano      = require('gulp-cssnano')
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

    if (rule.first.text === 'no-class') {
      return
    }

    var paren = rule.params.indexOf('(')
    var name = (paren === -1) ? rule.params : rule.params.substr(0, paren)

    var newInclude = '@include ' + name + ';'

    // Mixins with a `global` comment will be applied to the whole document
    // e.g. the reset mixin
    //
    // If not given, a selector matching the mixin name will be applied.
    if (rule.first.text !== 'global') {
      newInclude = '.' + name + ' { ' +  newInclude + ' }'
    }

    css.append(newInclude)
  })
}

gulp.task('build', function() {
  return gulp.src(['global.scss', 'shades.scss'])
    .pipe(postcss([ addClassForMixins ], { syntax: scss }))
    .pipe(sass())
    .pipe(postcss([ autoprefixer('> 0.2%') ]))
    .pipe(concat('./build/shades.css'))
    .pipe(gulp.dest('./'))
})

gulp.task('build:minify', ['build'], function() {
  return gulp.src('./build/*.css')
    .pipe(cssnano())
    .pipe(concat('shades.min.css'))
    .pipe(gulp.dest('./build'))
})

gulp.task('default', ['build:minify'])
