'use strict';
var app = angular.module('app');
app.config(['$stateProvider', function ($stateProvider) {
  $stateProvider.state('app.gallery', {
    url: '/gallery',
    template: '<div ui-view></div>',
    params: {
      type: null,
      action: null,
      elementId: null,
      pageId: null
    },
    onEnter: showModal
  }).state('app.gallery.common', {
    url: '/common/:tag',
    views: {
      'top@': {
        templateUrl: '/tpl/custom/gallery/common.html',
        controller: 'galleryController'
      }
    }
  }).state('app.gallery.my', {
    url: '/my/:tag',
    views: {
      'top@': {
        templateUrl: '/tpl/custom/gallery/common.html',
        controller: 'galleryController'
      }
    }
  });
  function showModal($modal, $previousState, docService, $stateParams) {
    if (!$previousState.get()) {
      return docService.directToDefault($stateParams);
    }
    $previousState.memo("modalInvoker");
    var size = 'lg';
    $modal.open({
      animation: true,
      templateUrl: '/tpl/custom/gallery/index.html',
      size: size,
      // backdrop: 'static',
      windowClass: 'gallery',
      controller: ['$scope', '$state', '$stateParams', 'ossService', 'docService', '$modalInstance', '$previousState', '$rootScope', '$filter',
        function ($scope, $state, $stateParams, ossService, docService, $modalInstance, $previousState, $rootScope, $filter) {
          $scope.vm = {};
          $scope.store = {};
          $scope.store.selectedImageUrl = null;
          $scope.store.loading = false;
          $scope.store.processing = false;
          $scope.store.images = [];

          $scope.ok = function () {
            $modalInstance.close(true);
          };
          $scope.cancel = function () {
            $modalInstance.dismiss(false);
          };
          $scope.$on('modal.closing', function(event, isClose) {
            if (isClose === true) return;
            setTimeout(function() {
              $previousState.go("modalInvoker");
            }, 300);
          });

          // pagination 配置项
          $scope.store.maxSize = 8;
          $scope.store.numPages = 10;
          $scope.store.currentPage = 1;
          $scope.store.itemsPerPage = 28;

          $scope.$watch(function() {
            if (!$scope.store.totalData) return 0;
            var data = $filter('tag')($scope.store.totalData, $stateParams.tag);
            return data.length;
          }, function(newValue, oldValue) {
            $scope.store.totalItems = newValue || 0;
          });
        }]
    });
  }
  showModal.$inject = ["$modal", "$previousState", "docService", "$stateParams"];
}]);

app.controller('galleryController', ['$scope', 'ossService', '$state', '$stateParams', 'docService', 'common', '$rootScope', '$timeout', '$previousState',
  function ($scope, ossService, $state, $stateParams, docService, common, $rootScope, $timeout, $previousState) {
    if(!$stateParams.tag) {
      return $state.go('.', { tag: 'all' });
    }
    // 进去之前先初始化，这样路由切换的时候不会卡顿
    $scope.store.totalData = [];
    var isPublic = $state.includes('app.gallery.common') ? true : false;
    $scope.isPublic = isPublic;
    var type = $stateParams.type;
    var methodName = (function() {
      var typeCase = type.replace(/^\w/, function(s) {
        return s.toUpperCase();
      });
      return 'get' + typeCase + 'List';
    })();
    var listMethod = ossService[methodName];

    // 配置上传数据
    $scope.store.isPublic = isPublic;
    $scope.store.type = type;

    $scope.store.loading = true;
    var startFlag = Date.now();
    listMethod(isPublic).then(function (list) {
      if (Date.now() - startFlag > 50) {
        $timeout(function() {
          begin();
          $scope.store.loading = false;
        }, 300);
      } else {
        begin();
        $scope.store.loading = false;
      }
      function begin() {
        $scope.store.totalData = list.list || [];
        var config;
        if (isPublic) {
          config = window.appConfig.public[type];
        } else {
          config = window.appConfig.user[type];
        }
        angular.forEach($scope.store.totalData, function (item) {
          var url = config.host + '/' + config.path + '/' + item.id;
          item.$$url = url + '@0e_80w_80h_0c_0i_1o_1x.jpg';
          item.$$originUrl = url;
        });
        $scope.tags = list.property.tags;
        $scope.property = list.property;
      }
    });

    $scope.create = function () {
      $scope.vm.creatGroup = true;
    };
    $scope.vm.isOperating = false;
    $scope.selectItem = function (event, item) {
      if ($scope.vm.isOperating) {
        item.$$isSelect = !item.$$isSelect
      } else {
        var elem = event.target;
        var action = $stateParams.action;
        var data = $scope.choose(item, elem);
        $scope.ok();
        if (action == 'create') {
          delayStateChange(item, 'create', data);
        } else {
          delayStateChange(item);
        }
        if (!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      }
    };
    $scope.cancelSelect = function () {
      $scope.vm.isOperating = false;
      $scope.store.totalData.map(function (item) {
        item.$$isSelect = false;
      });
    };
    $scope.moveToTag = function (currentGroup) {
      $scope.store.totalData.map(function (item) {
        if (item.$$isSelect) {
          if(!item.tags) {
            item.tags = [];
          }
          if(item.tags.indexOf(currentGroup) == -1) {
            item.tags.push(currentGroup);
          }
        }
      });
      uploadList();
    };
    $scope.moveFromTag = function (currentGroup) {
      $scope.store.totalData.map(function (item) {
        if (item.$$isSelect) {
          if(!item.tags) {
            item.tags = [];
          }

          if(item.tags) {
            var index = item.tags.indexOf(currentGroup);
            if(index != -1) {
              item.tags.splice(index, 1);
            }
          }
        }
      });
      uploadList();
    };

    function uploadList() {
      var uploadMethod = (function() {
        var type = $stateParams.type.replace(/^\w/, function(s) {
          return s.toUpperCase();
        });
        return 'upload' + type + 'List';
      })();
      ossService[uploadMethod](isPublic).then(function() {
        console.log('success', uploadMethod);
      });
    }

    $scope.directToMy = function () {
      $state.go('app.gallery.my');
    };
    $scope.choose = function (img, elem) {
      $scope.store.totalData.map(function (item) {
        item.active = false;
      });
      img.active = true;
      $scope.store.selectedImageUrl = img.$$originUrl;
      return setImage(img, elem);
    };

    function setImage(img, elem) {
      var type = $stateParams.type;
      var url = img.$$originUrl;
      if (type == 'image') {
        var id = $stateParams.elementId;
        var size = calSizeFromElem(elem);
        var action = $stateParams.action;

        if (action != 'create') {
          var elementData = docService.getElement($stateParams.elementId);
          elementData.content = url;
          elementData.css.width = size.width;
          elementData.css.height = size.height;
          return elementData;
        }
      } else if (type == 'bg') {
        var pageId = $stateParams.pageId;
        var page = docService.getPage(pageId);
        page.background.input.image = url ? 'url(' + url + ')' : '';
        return page;
      }
    }
    function calSizeFromElem(elem) {
      var naturalWidth = elem.naturalWidth;
      var naturalHeight = elem.naturalHeight;
      var WIDTH = 126;
      var ratio = naturalHeight / naturalWidth;
      return {
        width: WIDTH,
        height: ratio * WIDTH
      }
    }
    function delayStateChange(item, type, elem, cb) {
      var img = new Image();
      img.src = item.$$originUrl;
      img.onload = function() {
        startChange();
      };

      var startTime = Date.now();
      function startChange() {
        if (type == 'create') {
          var size = calSizeFromElem(img);
          elem = docService.createElement($stateParams.pageId, {
            type: 'image',
            width: size.width,
            height: size.height,
            content: item.$$originUrl
          });
        }
        if (Date.now() - startTime > 150) {
          $scope.store.processing = true;
          if (!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        }
        setTimeout(function() {
          $scope.store.processing = false;
          if (type == 'create') {
            $state.go('app.edit.page.image.property', {
              pageId: $stateParams.pageId,
              elementId: elem.id
            });
          } else {
            $previousState.go("modalInvoker");
          }
          if (!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        }, 300);
      }
    }

    $scope.vm.newGroup = '';
    $scope.vm.creatGroup = false;

    $scope.vm.addTag = function () {
      var tag = $scope.vm.newGroup;;
      for (var i = 0; i < $scope.tags; i++) {
        var t = $scope.tags[i];
        if (t.name == tag) {
          $scope.vm.addError = '标签重复了';
          return;
        }
      }

      $scope.property.latestTag += 1;

      $scope.tags.push({
        id: $scope.property.latestTag,
        name: tag
      });

      if ($stateParams.type == 'bg') {
        ossService.uploadBgList(isPublic);
      }
      else if ($stateParams.type == 'image') {
        ossService.uploadImageList(isPublic);
      }
      $scope.vm.creatGroup = false;
      $scope.vm.newGroup = '';
    };
    $scope.vm.cancel = function () {
      $scope.vm.creatGroup = false;
    };

    $scope.deleteTag = function (tagId) {
      for (var i = 0; i < $scope.tags.length; i++) {
        var t = $scope.tags[i];
        if (t.id == tagId) {
          $scope.tags.splice(i, 1);
        }
      }

      if ($stateParams.type == 'bg') {
        ossService.uploadBgList(isPublic);
      }
      else if ($stateParams.type == 'image') {
        ossService.uploadImageList(isPublic);
      }
    };
    $scope.deleteImage = function (id, $index) {
      $scope.store.totalData.splice($index, 1);

      if ($stateParams.type == 'bg') {
        ossService.deleteBgs([id], isPublic).then(function () {
          console.log('success');
        });
      } else if ($stateParams.type == 'image') {
        ossService.deleteImages([id], isPublic).then(function () {
          console.log('success');
        });
      }
    };
    $scope.deleteImages = function() {
      var ids = [];
      var newItems = [];
      $scope.store.totalData.map(function (item) {
        if (item.$$isSelect) {
          ids.push(item.id);
        }
        else {
          newItems.push(item);
        }
      });

      $scope.store.totalData = newItems;

      if ($stateParams.type == 'bg') {
        ossService.deleteBgs(ids, isPublic).then(function () {
          console.log('success');
        });
      } else if ($stateParams.type == 'image') {
        ossService.deleteImages(ids, isPublic).then(function () {
          console.log('success');
        });
      }
    };
    $scope.$on('$destroy', function() {
      $scope.cancelSelect();
    });
  }]
);
