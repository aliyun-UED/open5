'use strict';

/* Filters */
// need load the moment.js to use this filter.
var app = angular.module('app')
app.filter('userType', function () {
  return function (t) {
    switch(t) {
      case "user":
        return '普通用户';
      case "seller":
        return '摄影师';
      default:
        return t;
    }
  }
});
app.filter('limitLength', function () {
  return function (s, length) {
    if(!s || typeof s != 'string') {
      return s;
    }
    length = length || 12;

    if(s.length > length) {
      return s.substr(0, length) + "...";
    }

    return s;
  }
});
app.filter('sortByNum', function() {
  return function(array) {
    return array.sort(function(a,b) {
      return a.index > b.index;
    });
  }
});
app.filter('sortByZindex', function() {
  return function(array) {
    return array.sort(function(a,b) {
      return parseInt(a.css.zIndex) > parseInt(b.css.zIndex);
    });
  }
});
app.filter('parseRotate', function() {
  return function(value) {
    value = parseInt(value);
    if (!value) return 0;
    if (value < 0) {
      var getPlusValue = function(value) {
        value = value + 360
        if (value < 0) {
          return getPlusValue(value);
        } else {
          return value;
        }
      };
      value = getPlusValue(value);
    }
    return Math.round(value % 360);
  }
});
app.filter('xss', function() {
  return function(value) {
    value = parseInt(value);
    if (!value) return 0;
    if (value < 0) {
      var getPlusValue = function(value) {
        value = value + 360
        if (value < 0) {
          return getPlusValue(value);
        } else {
          return value;
        }
      };
      value = getPlusValue(value);
    }
    return Math.round(value % 360);
  }
});

app.filter('page', function() {
  return function(total, current, perPage) {
    if (!total || !current) return;
    var start = (current - 1) * perPage;
    var end = start + perPage;
    return total.slice(start, end);
  }
});
app.filter('tag', function() {
  return function(total, tag) {
    if (!total || !tag) return total;
    if (tag == 'all') return total;
    return total.filter(function(item) {
      return item.tags && item.tags.indexOf(tag) != -1;
    });
  }
});

app.filter('size', function() {
  return function(bytes, unit) {
    if (!bytes) return;
    bytes = parseInt(bytes);
    if (bytes === 0) return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
  }
});