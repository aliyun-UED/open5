var app = angular.module('app');

app.controller('elementCtrl', ['$state', '$stateParams', '$scope', '$rootScope', 'docService', '$timeout', '$parse', 'common', 'xssList',
  function ($state, $stateParams, $scope, $rootScope, docService, $timeout, $parse, common, xssList) {
    $scope.elementData = docService.getElement($stateParams.elementId);
    // todo: how to stop transition
    if (!$scope.elementData) {
      $state.go('app.edit.page');
      return;
    }
    $scope.css = $scope.elementData.css;

    $scope.element = $('#player #' + $stateParams.elementId);
    $scope.elementContent = $scope.element.find('.element-content');
    $scope.elementInner = $scope.element.find('.element-inner');
    $scope.elementContainer = $scope.element.find('.element-container');
    $scope.element.addClass('active');

    $timeout(function () {
      $scope.previewElement = $('.app-aside #' + $stateParams.elementId);
      $scope.previewElementContainer = $scope.previewElement.find('.element-container');
    });

    $scope.enableTransform = function () {
      player.transformManager.enable(
        $scope.element,
        function (css) {
          angular.extend($scope.css, css);
          if (!$rootScope.$$phase) {
            $scope.$digest();
          }
        }
      );
    };
    $scope.disableTransform = function () {
      player.transformManager.disable();
      $scope.element.off('mousedown.element');
    };

    $scope.$watch('css', function (newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }

      var arrangeCSS = {};
      var styleCss = {};

      for (var i in newValue) {
        if (Object.prototype.hasOwnProperty.call(newValue, i)) {
          if (newValue[i] == oldValue[i]) continue;
          if(i == "top" || i == "left" || i == "width" || i == "height" || i == "rotation") {
            arrangeCSS[i] = newValue[i];
          } else {
            styleCss[i] = newValue[i];
          }
        }
      }

      TweenLite.set($scope.element, {css: arrangeCSS});
      TweenLite.set($scope.elementContainer, {css: styleCss});

      TweenLite.set($scope.previewElement, {css: arrangeCSS});
      TweenLite.set($scope.previewElementContainer, {css: styleCss});

    }, true);

    $scope.$watch('elementData.content', function (newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }
      if ($scope.elementData.type == 'text') {
        $scope.elementData.content = xssList.filterXSS(newValue);
      }

      if ($scope.elementData.type != 'text') {
        $scope.previewElement.find('.element-content').html(player.page.buildElementContent($scope.elementData));
        $scope.element.find('.element-content').html(player.page.buildElementContent($scope.elementData));
      }
    });

    $(document).on('keydown.element', function (e) {
      var evt = e || window.event;
      var elemId = $stateParams.elementId;
      var ctrlDown = evt.ctrlKey || evt.metaKey;
      var key = evt.keyCode;

      if (common.detectFormElement(e)) return;

      if (ctrlDown) {
        switch (key) {
          // copy
          case 67:
            docService.copyElement($stateParams.pageId, elemId);
            break;
          // cut
          case 88:
            docService.cutElement($stateParams.pageId, elemId);
            break;
          default:
            return;
        }
      } else if (key == 8 || key == 46) {
        docService.deleteElement($stateParams.pageId, elemId);
      } else {
        return;
      }
      if (!$rootScope.$$phase) {
        $scope.$apply();
      }
      if ( key == 8 || key == 46 || (ctrlDown &&  key == 88)) {
        $state.go('app.edit.page');
      }
      return false;
    });

    $scope.FontFamilyList = window.config.fontFamily;

    $scope.$on('$destroy', function () {
      $scope.element.removeClass('active');
      $(document).off('keydown.element');
    });
  }
]);

// 这个等页面确定下来，写死了，就删除
app.controller('AppCtrl', ['$scope', '$localStorage', '$window',
  function ($scope, $localStorage, $window) {
    // add 'ie' classes to html
    var isIE = !!navigator.userAgent.match(/MSIE/i);
    isIE && angular.element($window.document.body).addClass('ie');
    isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

    // config
    $scope.app = {
      name: 'app',
      version: '2.0.0',
      // for chart colors
      color: {
        primary: '#7266ba',
        info: '#23b7e5',
        success: '#27c24c',
        warning: '#fad733',
        danger: '#f05050',
        light: '#e8eff0',
        dark: '#3a3f51',
        black: '#1c2b36'
      },
      settings: {
        themeID: 1,
        navbarHeaderColor: 'bg-black',
        navbarCollapseColor: 'bg-white-only',
        asideColor: 'bg-black',
        headerFixed: false,
        asideFixed: false,
        asideFolded: false,
        asideDock: false,
        container: false
      }
    }

    // save settings to local storage
    if (angular.isDefined($localStorage.settings)) {
      $scope.app.settings = $localStorage.settings;
    } else {
      $localStorage.settings = $scope.app.settings;
    }
    $scope.$watch('app.settings', function () {
      if ($scope.app.settings.asideDock && $scope.app.settings.asideFixed) {
        // aside dock and fixed must set the header fixed.
        $scope.app.settings.headerFixed = true;
      }
      // save to local storage
      $localStorage.settings = $scope.app.settings;
    }, true);

    function isSmartDevice($window) {
      // Adapted from http://www.detectmobilebrowsers.com
      var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
      // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
      return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
    }
  }
]);

app.controller('styleCtrl', ['$scope', '$state', '$stateParams', function ($scope, $state, $stateParams) {
  var vm = $scope.vm = {};
  vm.css = $scope.css;

  $scope.formatOpacity = function () {
    return parseInt(vm.css.opacity * 100);
  };
  $scope.formatShadow = function () {
    var value = vm.css.boxShadow;
    var arr = value.split(' ');
    var offset = arr[arr.length - 2];
    if (!offset) offset = 0;
    return parseInt(offset);
  };
  $scope.transform = function (value) {
    return value * 100;
  };
  $scope.transformShadow = function (value) {
    var arr = value.split(' ');
    var offset = arr[arr.length - 2];
    return parseInt(offset);
  };

  $scope.enableTransform();
  $scope.element.on('dblclick.style', function () {
    if ($state.current.data.tag == 'image') {
      $state.go('app.gallery.common', {
        type: 'image',
        elementId: $stateParams.elementId
      });
    }
    else if ($state.current.data.tag == 'text') {
      $state.go('^.select');
    }
  });
  $scope.$on('$destroy', function () {
    $scope.disableTransform();
    $scope.element.off('dblclick.style');
  });
}]);
app.controller('arrangeCtrl', ['$scope', '$state', '$stateParams', 'docService', 'common',
  function ($scope, $state, $stateParams, docService, common) {
    var vm = $scope.vm = {};
    vm.css = $scope.css;
    vm.forceRatio = false;
    $scope.blockCenter = function () {
      var width = parseInt(vm.css.width);
      var screenWidth = 320;
      return ((screenWidth - width) / 2) + 'px';
    };
    $scope.blockRight = function () {
      var width = parseInt(vm.css.width);
      var screenWidth = 320;
      return (screenWidth - width) + 'px';
    };
    $scope.blockVerticalCenter = function () {
      var height = parseInt(vm.css.height);
      var screenHeight = 506;
      return ((screenHeight - height) / 2) + 'px';
    };
    $scope.blockVerticalBottom = function () {
      var height = parseInt(vm.css.height);
      var screenHeight = 506;
      return (screenHeight - height) + 'px';
    };

    // layers
    $scope.layerTop = function() {
      docService.layerTop($stateParams.elementId, $stateParams.pageId);
    };
    $scope.layerBottom = function() {
      docService.layerBottom($stateParams.elementId, $stateParams.pageId);
    };
    $scope.layerUp = function() {
      docService.layerUp($stateParams.elementId, $stateParams.pageId);
    };
    $scope.layerDown = function() {
      docService.layerDown($stateParams.elementId, $stateParams.pageId);
    };

    // rotation transform
    $scope.transform = function (value) {
      value = parseInt(value);
      if (!value) return 0;
      if (value < 0) {
        var getPlusValue = function (value) {
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
    };

    // origin size only used on image
    if ($state.current.data.info && $state.current.data.info.type == 'image') {
      $scope.showImageSetting = true;
    }
    $scope.setOrginSize = function() {
      var img = $scope.element.find('img');
      if (!img.length) return;
      var size = common.getNaturalSize(img);
      vm.css.width = size.width + 'px';
      vm.css.height = size.height + 'px';
    };

    $scope.enableTransform();
    $scope.element.on('dblclick.arrange', function () {
      if ($state.current.data.tag == 'image') {
        $state.go('app.gallery.common', {
          type: 'image',
          elementId: $stateParams.elementId
        });
      }
      else if ($state.current.data.tag == 'text') {
        $state.go('^.select');
      }
    });
    $scope.$on('$destroy', function () {
      $scope.disableTransform();
      $scope.element.off('dblclick.arrange');
    });
  }]);

app.controller('inputCtrl', ['$scope', function ($scope) {
  var vm = $scope.vm = {};
}]);
app.controller('mapCtrl', ['$scope', function ($scope) {
  var vm = $scope.vm = {};
}]);
app.controller('sliderCtrl', ['$scope', function ($scope) {
  var vm = $scope.vm = {};
}]);
app.controller('videoCtrl', ['$scope', function ($scope) {
  var vm = $scope.vm = {};
}]);
app.controller('animateCtrl', ['$scope', '$parse', '$state', '$rootScope', '$stateParams',
  function ($scope, $parse, $state, $rootScope, $stateParams) {
    var vm = $scope.vm = {};
    vm.animations = $scope.elementData.animations || [];
    vm.tempTypes = {};
    vm.animTypeEnum = window.config.animTypeEnum;
    vm.animRepeat = window.config.animRepeat;

    vm.animations.map(function(item) {
      for (var i = 0; i < vm.animTypeEnum.length; i++) {
        if (vm.animTypeEnum[i].id == item.type) {
          item.current = vm.animTypeEnum[i];
        }
      }
      if (!item.direction) {
        item.direction = item.current.direction && item.current.direction[0]['value'];
      }
    });
    vm.create = function() {
      var animate = angular.copy(window.config.defaultAnimationData)
      for (var i = 0; i < vm.animTypeEnum.length; i++) {
        if (vm.animTypeEnum[i].id == animate.type) {
          animate.current = vm.animTypeEnum[i];
        }
      }
      vm.animations.push(animate);
    };
    vm.del = function(item) {
      var index = vm.animations.indexOf(item);
      vm.animations.splice(index, 1);
    };

    vm.play = function() {
      if(vm.playing) return;

      $scope.disableMove();
      $scope.disableTransform();

      vm.playing = player.page.buildElementCss3Timeline($scope.elementData, vm.stop);
      vm.playing.play();
    };

    vm.stop = function(animClass) {
      if(!vm.playing) return;

      vm.playing.reset();
      vm.playing = null;

      $scope.enableMove();
      $scope.enableTransform();
      if (!$rootScope.$$phase) {
        $scope.$apply();
      }
    };

    vm.updateAnimation = function(animate, index, selected) {
      animate.type = animate.current.id;
      animate.direction = animate.current.direction && animate.current.direction[0]['value'];
      animate.repeat = 1;
      animate.delay = 0;
      animate.duration = (animate.current.duration && animate.current.direction[0]['duration']) || 1;
    };
    vm.updateDirection = function(animate) {
      animate.repeat = 1;
      animate.delay = 0;
      animate.duration = animate.current.direction[0]['duration'] || 1;
    };

    $scope.enableTransform();
    $scope.element.on('dblclick.animate', function() {
      if ($state.current.data.tag == 'image') {
        $state.go('app.gallery.common', {
          type: 'image',
          elementId: $stateParams.elementId
        });
      }
      else if ($state.current.data.tag == 'text') {
        $state.go('^.select');
      }
    });
    $scope.$on('$destroy', function () {
      vm.stop();
      $scope.disableTransform();
      $scope.element.off('dblclick.animate');
    });
  }]);
