'use strict';
angular.module('app')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
          .state('app.templates', {
            url: '/templates',
            template: '<div ui-view></div>',
            params: {
              type: null,
              elementId: null,
              pageId: null
            },
            onEnter: showModal
          })
          .state('app.templates.common', {
            url: '/common/:tag',
            views: {
              'templates@': {
                templateUrl: '/tpl/custom/templates/common.html',
                controller: 'templatesController'
              }
            }
          })
          .state('app.templates.my', {
            url: '/my/:tag',
            views: {
              'templates@': {
                templateUrl: '/tpl/custom/templates/common.html',
                controller: 'templatesController'
              }
            }
          });

      function showModal($modal, $previousState, docService, $stateParams) {
        if (!$previousState.get()) {
          return docService.directToDefault($stateParams);
        }
        $previousState.memo("modalTemplates");
        var size = 'lg';
        var modalInstance = $modal.open({
          // animation: false,
          templateUrl: '/tpl/custom/templates/index.html',
          controller: ['$scope', '$state', '$stateParams', 'ossService', 'docService', '$modalInstance', '$previousState', '$rootScope',
            function ($scope, $state, $stateParams, ossService, docService, $modalInstance, $previousState, $rootScope) {
              $scope.ok = function () {
                $modalInstance.close(true);
              };
              $scope.cancel = function () {
                $modalInstance.dismiss();
              };
              $scope.$on('modal.closing', function(event, isClose) {
                if (isClose === true) return;
                setTimeout(function() {
                  $previousState.go("modalTemplates");
                }, 300);
              });

              $scope.addEmptyPage = function () {
                $scope.ok();
                docService.addEmptyPage();
                if (!$rootScope.$$phase) {
                  $rootScope.$apply();
                }
              };
              $scope.savePage = function () {
                var isPublic = $state.includes('app.templates.common') ? true : false;

                var page = docService.getPage($stateParams.pageId);
                if (!page) return;

                page = angular.copy(page);
                page.id = '';

                ossService.uploadPage(page, isPublic).then(function (obj) {
                  $scope.store.total.unshift(obj);
                  if (!$rootScope.$$phase) {
                    $rootScope.$apply();
                  }
                });
              };
              $scope.vm = {};
              $scope.vm.newGroup = '';
              $scope.vm.creatGroup = false;

              $scope.store = {};
              $scope.store.loading = false;
            }],
          size: size
          // backdrop: 'static'
        });
      }

      showModal.$inject = ["$modal", "$previousState", "docService", "$stateParams"];
    }])
    .controller('templatesController', ['$scope', '$state', '$stateParams', 'ossService', 'docService', '$timeout',
      function ($scope, $state, $stateParams, ossService, docService, $timeout) {
        if(!$stateParams.tag) {
          return $state.go('.', { tag: 'all' });
        }
        var isPublic = $state.includes('app.templates.common') ? true : false;
        $scope.vm.isPublic = isPublic;
        $scope.isCommon = isPublic;

        $scope.store.loading = true;
        var startFlag = Date.now();
        ossService.getPageList(isPublic).then(function (list) {
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
            $scope.totalData = list.list || [];
            // 复制引用，为了父作用域能够访问到
            $scope.store.total = $scope.totalData;
            $scope.tags = list.property.tags;
            $scope.property = list.property;
            $scope.totalItems = $scope.totalData.length;
          }
        });

        $scope.vm.isOperating = false;
        $scope.selectItem = function (item) {
          if ($scope.vm.isOperating) {
            item.$$isSelect = !item.$$isSelect
          } else {
            $scope.ok();
          }
        };
        $scope.cancelSelect = function () {
          $scope.vm.isOperating = false;
          $scope.totalData.map(function (item) {
            item.$$isSelect = false;
          });
        };

        $scope.moveToTag = function (currentGroup) {
          $scope.totalData.map(function (item) {
            if (item.$$isSelect) {
              if(!item.tags) {
                item.tags = [];
              }

              if(item.tags.indexOf(currentGroup) == -1) {
                item.tags.push(currentGroup);
              }
            }
          });

          ossService.uploadPageList(isPublic).then(function() {
            console.log('success');
          });
        };
        $scope.moveFromTag = function (currentGroup) {
          $scope.totalData.map(function (item) {
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

          ossService.uploadPageList(isPublic).then(function() {
            console.log('success');
          });
        };

        // pagination 配置项
        $scope.maxSize = 8;
        $scope.numPages = 10;
        $scope.currentPage = 1;
        $scope.itemsPerPage = 21;

        $scope.deletePage = function (id, $index) {
          $scope.totalData.splice($index, 1);
          ossService.deletePages([id], isPublic).then(function () {
            console.log(123);
          });
        };
        $scope.deletePages = function () {
          var ids = [];
          var newItems = [];
          $scope.totalData.map(function (item) {
            if (item.$$isSelect) {
              ids.push(item.id);
            } else {
              newItems.push(item);
            }
          });
          if (!ids.length) return;

          $scope.totalData = newItems;
          ossService.deletePages(ids, isPublic).then(function () {
            console.log('success');
          });
        };
        $scope.create = function () {
          $scope.vm.creatGroup = true;
        };
        $scope.vm.addTag = function () {
          var tag = $scope.vm.newGroup;
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
          ossService.uploadPageList(isPublic);
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

          $scope.totalData.map(function (item) {
            if (!item.tags || !tagId) return;
            var index = item.tags.indexOf(tagId);
            if(index != -1) {
              item.tags.splice(index, 1);
            }
          });
          ossService.uploadPageList(isPublic);
        };

        $scope.$on('$destroy', function() {
          $scope.cancelSelect();
        })

      }]);