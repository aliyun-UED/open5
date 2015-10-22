"use strict";

var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var ngHtml2Js = require("gulp-ng-html2js");
var minifyHtml = require("gulp-minify-html");
var uglify = require("gulp-uglify");
var gulpif = require('gulp-if');
var useref = require('gulp-useref');
var del = require('del');
var gzip = require('gulp-gzip');
var filter = require('gulp-filter');
var replace = require('gulp-replace');
var less = require('gulp-less');
var moment = require('moment');
var oss = require("gulp-oss");
var config = require('./config.js');

var paths = {
  template: ['./tpl/**/*.html'],
  less: ['./css/less/*.less'],
  fonts: ['./fonts/**/*.{ttf,woff,eot,svg}'],
  images: ['./images/**/*.{png,jpg,gif}'],
  dist: ['./dist']};

gulp.task('build', ['cleanDist', 'templates', 'less'], function (done) {
  var assets = useref.assets();

  gulp.src(paths.fonts)
    .pipe(gulp.dest('./dist/fonts'));

  gulp.src(paths.images)
    .pipe(gulp.dest('./dist/images'));

  gulp.src(['./player.html', './editor.html'])
    .pipe(assets)
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist'))
    .on('end', done);
});

gulp.task('less', function () {
  gulp.src(['./css/less/app.less', './css/less/player.less'])
    .pipe(less({
      paths: ['./css/less']
    }))
    .pipe(gulp.dest('./css'));
});

gulp.task('cleanDist', function (cb) {
  del(['./dist'], cb);
});

gulp.task('templates', function (done) {
  gulp.src(paths.template)
    .pipe(minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(ngHtml2Js({
      moduleName: "app.tpls",
      prefix: "/tpl/"
    }))
    .pipe(concat("tpls.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("./js"))
    .on('end', done);
});

gulp.task('watch', function () {
  gulp.watch(paths.template, ['templates']);
  gulp.watch(paths.less, ['less']);
});
