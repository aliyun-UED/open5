'use strict';
angular.module('app').config(['$stateProvider', function ($stateProvider) {
  $stateProvider.state('app.edit', {
    url: '/edit',
    sticky: true,
    deepStateRedirect: {
      default: 'app.edit.page',
      params: true,
      fn: ['$dsr$', '$state', 'docService', function ($dsr$, $state, docService) {
        var pages = docService.getPages();
        var page = pages[0];
        if (page) {
          return {
            state: 'app.edit.page',
            params: {
              pageId: page.id
            }
          };
        }
        return false;
      }]
    },
    views: {
      "edit@app": {
        templateUrl: '/tpl/edit_all.html',
        controller: ['$scope', '$state', '$stateParams', '$rootScope', 'docService', 'ossService', 'toaster', 'xssList',
          function ($scope, $state, $stateParams, $rootScope, docService, ossService, toaster, xssList) {
            window.player = window.Player.create('#edit #player');
            window.player.startEdit();

            $scope.docProperties = docService.getProperties();

            // 对弹出modal时候，状态切换导致 data 数据丢失做处理
            // 可能的副作用的并行状态无法携带data
            $rootScope.$on("$stateChangeStart", function (evt, toState, toParams, fromState) {
              if (toState.$$state().includes['app.gallery']
                  || toState.$$state().includes['app.music']
                  || toState.$$state().includes['app.templates']
                  || toState.$$state().includes['app.crop']) {
                return toState.data = fromState.data;
              }
            });

            $scope.addText = function () {
              $rootScope.$broadcast('ADD_TEXT');
            };
            $scope.addImage = function () {
              $rootScope.$broadcast('ADD_IMAGE');
            };
            $scope.addMusic = function () {
              $rootScope.$broadcast('ADD_MUSIC');
            };

            $scope.preview = function () {
              $state.go('app.preview');
            };
            $scope.save = function (onComplete) {
              xssList.xss();
              docService.save().then(function () {
                toaster.pop({
                  type: 'info',
                  timeout: 1500,
                  title: null,
                  body: '保存成功',
                  showCloseButton: true
                });
                if (typeof onComplete == 'function') onComplete();
              }, function () {
                toaster.pop({
                  type: 'error',
                  timeout: 1500,
                  title: null,
                  body: '网络出现问题',
                  showCloseButton: true
                });
                if (typeof onComplete == 'function') onComplete();
              });
            };
            $scope.publish = function () {
              docService.publish().then(function () {
                toaster.pop({
                  type: 'info',
                  timeout: 1500,
                  title: null,
                  body: '发布成功',
                  showCloseButton: true
                });
              }, function () {
                toaster.pop({
                  type: 'error',
                  timeout: 1500,
                  title: null,
                  body: '网络出现问题',
                  showCloseButton: true
                });
              });
            };

            $scope.closeMusic = function () {
              $rootScope.global.music = null;
            };
          }]
      },
      "pages@app.edit": {
        templateUrl: '/tpl/custom/edit_aside.html',
        controller: ['$state', '$stateParams', '$scope', 'docService', '$rootScope',
          function ($state, $stateParams, $scope, docService, $rootScope) {
            $scope.pagesData = docService.getPages();
            $scope.$watchCollection("pagesData", function (newValue, oldValue) {
              if (!newValue || !oldValue) return;
              if (newValue === oldValue) return;

              for (var i = 0; i < newValue.length; i++) {
                var p = newValue[i];
                p.rightPageId = '';
                p.leftPageId = '';
                p.topPageId = newValue[i - 1] ? newValue[i - 1].id : "";
                p.bottomPageId = newValue[i + 1] ? newValue[i + 1].id : "";
              }
            });
            var options = $scope.options = {};
            options.preview = true;
            options.enableFocus = true;
            options.enableKeyNav = true;
            options.onFocus = function() {
              $rootScope.SELECT_PAGE = true;
            };
            options.onBlur = function() {
              $rootScope.SELECT_PAGE = false;
            };
            options.onChange = function (tiles) {
              var array = [];
              for (var i = 0; i < tiles.length; i++) {
                var tile = tiles[i]['tile'];
                $scope.pagesData.map(function (page) {
                  if (page.id == tile._data.id) {
                    array.push(page);
                  }
                });
              }
              for (var j = 0; j < array.length; j++) {
                $scope.pagesData[j] = array[j];
              }
              if(!$rootScope.$$phase) {
                $scope.$apply();
              }
            };
            options.onRefresh = function(pageWrap, data) {
              var page = window.player.page.build(data, window.player.width, window.player.height);
              pageWrap.find('.edit_pages_thumb').html(page);
            };
            options.buildItem = function (data, index) {
              var page = window.player.page.build(data, window.player.width, window.player.height);
              return [
                '<div class="edit_pages_container" tabindex="-1">',
                '<div class="edit_pages_block">',
                '<div class="edit_pages_btns">',
                '<span class="edit_pages_up"><i class="fa fa-arrow-up"></i></span>',
                '<span class="edit_pages_index tile-index"></span>',
                '<span class="edit_pages_down"><i class="fa fa-arrow-down"></i></span>',
                '<span class="edit_pages_close tile-remove"><i class="fa fa-times"></i></span>',
                '</div>',
                '<div class="edit_pages_thumb">' + page + '</div>',
                '</div>',
                '</div>'
              ].join('');
            };
            options.onClick = function (data) {
              $state.go('app.edit.page', {
                pageId: data.id
              });
            };
            options.onRemove = function (tile) {
              var id = tile._data.id;
              var index = tile.index;
              var pages = docService.getPages();
              var length = pages.length;
              var current;
              if (index == length -1) {
                current = index - 1;
              } else {
                current = index + 1;
              }
              var page = pages[current];

              docService.deletePage(id);
              if ($state.params.pageId == id) {
                docService.directToDefault($stateParams, page);
              } else {
                if (!$rootScope.$$phase) {
                  $scope.$digest();
                }
              }
            };

            $scope.addPage = function () {
              $rootScope.$broadcast('ADD_PAGE');
            };

            $('.edit_pages').contextMenu({
              selector: '.tile',
              callback: function(key, options) {
                var pageId = $(this).find('.page').attr('id');
                if(!pageId) return;
                switch(key) {
                  case "copy":
                    docService.copyPage(pageId);
                    break;
                  case "paste":
                    docService.pastePage();
                    break;
                  case "delete":
                    var pages = docService.getPages();
                    var page = docService.getPage(pageId);
                    var index = pages.indexOf(page);
                    var current;
                    if (index == pages.length -1) {
                      current = index - 1;
                    } else {
                      current = index + 1;
                    }
                    var nextPage = pages[current];
                    docService.deletePage(pageId);
                    break;
                  default:
                    return;
                }
                // todo: 为什么元素删除之后会影响到自定义事件的触发
                setTimeout(function() {
                  if (!$rootScope.$$phase) {
                    $scope.$apply();
                  }
                  if (key == 'delete') {
                    if ($state.params.pageId != pageId) return;
                    $state.go('app.edit.page', {
                      pageId: nextPage.id
                    });
                  }
                }, 0);
              },
              events: {
                show: function(opt) {
                  var _copy = docService.getCopyObj();
                  if (!_copy || _copy.type != 'page') {
                    opt.items.paste.$node.addClass('has-disable');
                  } else {
                    opt.items.paste.$node.removeClass('has-disable');
                  }
                  //if (!docService.hasRecoveryElement()) {
                  //  opt.items.recovery.$node.addClass('has-disable');
                  //} else {
                  //  opt.items.recovery.$node.removeClass('has-disable');
                  //}
                }
              },
              animation: {
                duration: 100,
                show: "fadeIn",
                hide: "fadeOut"
              },
              items: {
                "copy": {name: "复制  ( Ctrl + C )"},
                "paste": {name: "粘贴  ( Ctrl + V )"},
                "sep1": "---------",
                //"recovery": {name: "撤销 ( Ctrl + Z )"},
                "delete": {name: "删除 ( Delete )"}
              }
            });

            $scope.$on('$destroy', function () {
              $('.edit_pages').contextMenu('destroy');
            });
          }
        ]
      }
    }
  });
}]);
