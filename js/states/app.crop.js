'use strict';
var app = angular.module('app');
app.config(['$stateProvider', function ($stateProvider) {
  $stateProvider.state('app.crop', {
    url: '/crop',
    template: '<div ui-view></div>',
    params: {
      type: null,
      pageId: null,
      elementId: null
    },
    onEnter: showModal
  });
  function showModal($modal, $previousState, docService, $stateParams) {
    if (!$previousState.get()) {
      return docService.directToDefault($stateParams);
    }
    var type = $stateParams.type;

    if (type == 'image') {
      var elementData = docService.getElement($stateParams.elementId);
      var url = elementData.content;
    } else {
      var pageData = docService.getPage($stateParams.pageId);
      var backgroundImage = pageData.background.input.image || '';
      var url = backgroundImage.replace('url(', '').replace(')', '');
    }
    if (!url) {
      return docService.directToDefault($stateParams);
    } else {
      url = url.replace(/@.*$/, '');
    }

    $previousState.memo("modalCrop");
    var size = 'lg';
    $modal.open({
      animation: true,
      templateUrl: '/tpl/custom/crop/index.html',
      size: size,
      // backdrop: 'static',
      windowClass: 'crop-modal',
      controller: ['$scope', '$state', '$stateParams', 'ossService', 'docService', '$modalInstance', '$previousState', '$rootScope', '$filter',
        function ($scope, $state, $stateParams, ossService, docService, $modalInstance, $previousState, $rootScope, $filter) {
          $scope.store = {};
          $scope.ok = function () {
            var cropData = $scope.store.generate();
            var img = new Image();
            img.src = cropData.url;
            $scope.store.processing = true;
            img.onload = function() {
              loadEnd();
            };
            img.onerror = function() {
              $scope.store.processing = false;
              if (!$rootScope.$$phase) {
                $rootScope.$apply();
              }
            };
            function loadEnd() {
              $modalInstance.close(true);
              $previousState.go("modalCrop");

              // 这里会出现一个问题，watch content值 的时候会发现newValue == oldValue
              // 猜测的原因可能在 并行状态 的使用上，修改content属性的时候，背景状态没有被激活
              // 造成 修改的时候 并没有被watch到，等下次watch的时候，值就变成一样，目前的处理方法
              // 使用settimeout延迟修改值
              setTimeout(function() {
                if (type == 'image') {
                  var WIDTH = 126;
                  var ratio = cropData.height / cropData.width;
                  elementData.css.width = WIDTH;
                  elementData.css.height = WIDTH * ratio;
                  elementData.content = cropData.url;
                } else {
                  pageData.background.input.image = 'url(' + cropData.url + ')';
                }
                if (!$rootScope.$$phase) {
                  $rootScope.$apply();
                }
              }, 17);

            }
          };
          $scope.cancel = function () {
            console.log('cancel ...');
            $modalInstance.dismiss();
          };
          $scope.$on('modal.closing', function(event, isClose) {
            if (isClose === true) return;
            $previousState.go("modalCrop");
          });
          $scope.store.onBuilding = true;
          $scope.onBuilt = function() {
            $scope.store.onBuilding = false;
            if (!$rootScope.$$phase) {
              $scope.$apply();
            }
          };
          $scope.cropImage = url;
        }]
    });
  }

  showModal.$inject = ["$modal", "$previousState", "docService", "$stateParams"];
}]);