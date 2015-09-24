'use strict';

/* Controllers */
var app = angular.module('app');

app.factory('openModal', ['$modal', function ($modal) {
  return function (size) {
    if (!size) size = 'lg';
    return $modal.open({
      animation: true,
      templateUrl: '/tpl/custom/gallery_panel.html',
      controller: 'gallery-panel',
      size: size,
      backdrop: 'static',
      resolve: {
        items: function () {
          // 这里用来从服务端获取素材图片
          var items;
          return items;
        }
      }
    });
  };
}]);

app.directive('elemReady', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    priority: 0,
    link: function($scope, element, attrs) {
      element.ready(function(){
        $scope.$apply(function(){
            var func = $parse(attrs.elemReady);
            if (typeof func == 'function') {
              func($scope);
            }
        });
        console.log('element ready');
        $scope.testData = {a: 'test'};
      });
    }
  }
}]);
app.directive('fontFamilySelect', ['$timeout', function($timeout) {
  return {
    restrict: 'EA',
    require: '?ngModel',
    link: function($scope, element, attrs, ctrl) {
      var ngModelCtrl = ctrl;
      var defaultFontFamily = ['Tahoma', 'Helvetica', 'Arial', 'sans-serif'];
      return;
      function formatFontFamily(fontString) {
        var string = fontString.replace(/'/g, '');
        var arr = string.split(',');
        return arr[0].trim();
      };
      function parseFontFamily(value) {
        var arr = [].concat(defaultFontFamily);
        arr.unshift(value);
        return arr.join(',');
      };
      ngModelCtrl.$formatters.push(formatFontFamily);
      ngModelCtrl.$parsers.push(parseFontFamily);
    }
  }
}]);
app.directive('fontWeightSelect', ['$timeout', function($timeout) {
  return {
    restrict: 'EA',
    require: '?ngModel',
    link: function($scope, element, attrs, ctrl) {
      var ngModelCtrl = ctrl;
      $(element).on('click', function() {
        var $this = $(this);
        if ($this.hasClass('active')) {
          $this.removeClass('active');
          ngModelCtrl.$setViewValue('300');
        } else {
          $this.addClass('active');
          ngModelCtrl.$setViewValue('bold');
        }
      });
      setTimeout(function() {
        var value = ngModelCtrl.$modelValue;
        if (parseInt(value) == 600 || value == 'bold') {
          $(element).addClass('active');
        }
      });
    }
  }
}]);
// todo 如何处理属性继承的问题
app.directive('fontStyleSelect', ['$timeout', function($timeout) {
  return {
    restrict: 'EA',
    require: '?ngModel',
    link: function($scope, element, attrs, ctrl) {
      var ngModelCtrl = ctrl;
      $(element).on('click', function() {
        var $this = $(this);
        if ($this.hasClass('active')) {
          $this.removeClass('active');
          ngModelCtrl.$setViewValue('normal');
        } else {
          $this.addClass('active');
          ngModelCtrl.$setViewValue('italic');
        }
      });
      setTimeout(function() {
        var value = ngModelCtrl.$modelValue;
        if (value == 'italic') {
          $(element).addClass('active');
        }
      });
    }
  }
}]);
app.directive('textDecorationSelect', ['$timeout', function($timeout) {
  return {
    restrict: 'EA',
    require: '?ngModel',
    link: function($scope, element, attrs, ctrl) {
      var ngModelCtrl = ctrl;
      $(element).on('click', function() {
        var $this = $(this);
        if ($this.hasClass('active')) {
          $this.removeClass('active');
          ngModelCtrl.$setViewValue('none');
        } else {
          $this.addClass('active');
          ngModelCtrl.$setViewValue('underline');
        }
      });
      setTimeout(function() {
        var value = ngModelCtrl.$modelValue;
        if (value == 'underline') {
          $(element).addClass('active');
        }
      });
    }
  }
}]);
app.directive('choice', ['$timeout', function($timeout) {
  return {
    restrict: 'EA',
    require: '?ngModel',
    link: function($scope, element, attrs, ctrl) {
      var ngModelCtrl = ctrl;
      var $children = $(element).children();
      var defaultValue = $(element).attr('data-default');
      $children.on('click', function() {
        var $this = $(this);
        var value = $(this).attr('data-value');
        $children.removeClass('active');
        $this.addClass('active');
        ngModelCtrl.$setViewValue(value);
      });
      setTimeout(function() {
        var modelValue = ngModelCtrl.$modelValue;
        var dirty = false;
        for (var i = 0; i < $children.length; i++) {
          if (modelValue == $children.eq(i).attr('data-value')) {
            $children.eq(i).addClass('active');
            dirty = true;
          }
        }
        if (!dirty && defaultValue) {
          for (var i = 0; i < $children.length; i++) {
            if (defaultValue == $children.eq(i).attr('data-value')) {
              $children.eq(i).addClass('active');
            }
          }
        }
      }, 0);
    }
  }
}]);
app.directive('sliderHelper', ['$timeout', function($timeout) {
  return {
    restrict: 'EA',
    priority: 100,
    require: '?ngModel',
    link: function($scope, element, attrs, ctrl) {
      var ngModelCtrl = ctrl;
      var unit = attrs['unit'];
      ngModelCtrl.$modelValue = format(ngModelCtrl.$modelValue);
      function format(value) {
        if (value == 0) {
          value = '0'
        }
        return value && parseFloat(value);
      };
      function parse(value) {
        return unit && (value + unit);
      };
      ngModelCtrl.$formatters.push(format);
      ngModelCtrl.$parsers.push(parse);
    }
  }
}]);
app.directive('opacitySliderHelper', ['$timeout', function($timeout) {
  return {
    restrict: 'EA',
    priority: 100,
    require: '?ngModel',
    link: function($scope, element, attrs, ctrl) {
      var ngModelCtrl = ctrl;
      function format(value) {
        return parseInt(Math.round(value * 100));
      };
      function parse(value) {
        return parseFloat(Math.round(value) / 100);
      };
      ngModelCtrl.$formatters.push(format);
      ngModelCtrl.$parsers.push(parse);
    }
  }
}]);
app.directive('shadowSliderHelper', ['$timeout', function($timeout) {
  return {
    restrict: 'EA',
    priority: 100,
    require: '?ngModel',
    link: function($scope, element, attrs, ctrl) {
      var ngModelCtrl = ctrl;
      function format(value) {
        // 返回的格式类似 "rgb(40, 40, 40) 0px 0px 27px 5.40000009536743px"
        var arr = value.split(' ');
        var offset = arr[arr.length -2];
        return parseInt(offset);
      };
      function parse(value) {
        var prefix = 'rgb(40, 40, 40) 0px 0px ';
        return prefix + value + 'px ' + (value / 5) + 'px';
      };
      ngModelCtrl.$formatters.push(format);
      ngModelCtrl.$parsers.push(parse);
    }
  }
}]);
app.directive('rotateSliderHelper', ['$timeout', function($timeout) {
  return {
    restrict: 'EA',
    priority: 100,
    require: '?ngModel',
    link: function($scope, element, attrs, ctrl) {
      var ngModelCtrl = ctrl;
      function format(value) {
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
      function parse(value) {
        return Math.round(parseInt(value) || 0);
      };
      ngModelCtrl.$formatters.push(format);
      ngModelCtrl.$parsers.push(parse);
    }
  }
}]);
app.directive('filterSliderHelper', ['$timeout', function($timeout) {
  return {
    restrict: 'EA',
    priority: 100,
    require: '?ngModel',
    link: function($scope, element, attrs, ctrl) {
      var ngModelCtrl = ctrl;
      function format(value) {
        return;
        // "blur(5px)" "none"
        // if (value == 'none') {
        //   return 0
        // } else {
        //   return parseFloat(value.replace('blur(', '')) * 20;
        // }
      };
      function parse(value) {
        if (value == 0) {
          return 'none';
        } else {
          return 'blur(' + (value / 20) + 'px)';
        }
      };
      ngModelCtrl.$formatters.push(format);
      ngModelCtrl.$parsers.push(parse);
    }
  }
}]);
app.directive('fontSizeHelper', ['$timeout', function($timeout) {
  return {
    restrict: 'EA',
    priority: 100,
    require: '?ngModel',
    link: function($scope, element, attrs, ctrl) {
      var ngModelCtrl = ctrl;
      function format(value) {
        return window.config.fontSizeList[parseInt(value) - 1];
      };
      function parse(obj) {
        if (!obj) return 5;
        return obj.value;
      };
      ngModelCtrl.$formatters.push(format);
      ngModelCtrl.$parsers.push(parse);
    }
  }
}]);

// helper 控制器
app.controller('linkCtrl', ['$scope', 'docService', 'xssList', function($scope, docService, xssList) {
  var store = $scope.store = {};
  store.link = {};
  store.linkList = window.config.linkList;
  store.link = $scope.elementData.link;
  if (!$scope.elementData.link || !$scope.elementData.link.type) {
    store.link.type = store.linkList[0].type;
  }
  store.onSelect = function() {
    if(store.link.type == 'page') {
      store.link.value = store.pageList[0].id;
    }
    else if(store.link.type == 'web') {
      store.link.value = 'http://example.com';
    }
    else if(store.link.type == 'tel') {
      store.link.value = '';
    } else {
      store.link.value = '';
    }
    delete store.link.target;
  };
  store.onChange = function() {
    if (store.link.type == 'web' || store.link.type == 'tel') {
      store.link.value = xssList.filterXSS(store.link.value);
    }
  };
  var pages = docService.getPages();
  $scope.$watchCollection('pages', function(newValue, oldValue) {
    store.pageList = pages.map(function(item, index) {
      return {
        index: index,
        label: '第 ' + (index + 1) + ' 页',
        id: item.id
      };
    });
  });
}]);

