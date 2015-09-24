'use strict';
angular.module('app').config(['$stateProvider',function ($stateProvider) {
  $stateProvider.state('app.edit.page.selected', {
    url: '/selected',
    data: {
      info: {
        type: 'selected'
      },
      tabs: [
        {
          name: '多选操作',
          type: 'bg',
          url: '.bg'
        },
        {
          name: '特效',
          type: 'effect',
          url: '.effect'
        },
        {
          name: '图层',
          type: 'layer',
          url: '.layer'
        }
      ]
    },
    views: {
      'panel@app.edit.page': {
        templateUrl: '/tpl/custom/panels/multiselect.html',
        controller: ['$state', '$stateParams', '$scope', 'multiselect', 'docService', 'multidrag', 'align', '$rootScope', function ($state, $stateParams, $scope, multiselect, docService, multidrag, align, $rootScope) {
          var current = multiselect.getCurrent();
          if (!current || !current.length) {
            return $state.go('app.edit.page.setting');
          }

          var $page = $('#player #' + $stateParams.pageId);
          $scope.disableMenu();
          $scope._enableMenu = function(data) {
            var ids = [];
            data.map(function(item) {
              ids.push(item.id);
            });
            $page.contextMenu({
              selector: '.element.selected',
              callback: function(key, options) {
                if(!ids.length) return;
                switch(key) {
                  case "cut":
                    docService.cutElements($stateParams.pageId, ids);
                    break;
                  case "copy":
                    docService.copyElements($stateParams.pageId, ids);
                    break;
                  case "paste":
                    docService.pasteElements($stateParams.pageId);
                    break;
                  case "delete":
                    docService.deleteElements($stateParams.pageId, ids);
                    break;
                    return;
                }
                // todo: 为什么元素删除之后会影响到自定义事件的触发
                setTimeout(function() {
                  if (!$rootScope.$$phase) {
                    $scope.$apply();
                  }
                  if (key == 'delete') {
                    $state.go('app.edit.page.setting.bg');
                  }
                  if (key == 'paste') {
                    afterPaste();
                  }
                }, 17);
              },
              events: {
                show: function(opt) {
                  var copy = docService.getCopyObj();
                  if (copy && copy.content && copy.type == 'elements') {
                    opt.items.paste.$node.removeClass('has-disable');
                  } else {
                    opt.items.paste.$node.addClass('has-disable');
                  }
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
                // "cut": {name: "剪切 ( Ctrl + X )"},
                "sep2": "---------",
                "delete": {name: "删除 ( Delete )"}
              }
            });
          };
          $scope._disableMenu = function() {
            $page.contextMenu('destroy');
          };

          $scope.$on('onSelectReady', function(event, current) {
            if (!current || !current.length) return;
            var data = [];
            var page = docService.getPage($stateParams.pageId);
            for (var i = 0; i < current.length; i++) {
              for (var j = 0; j < page.elements.length; j++) {
                if (current[i].id == page.elements[j].id) {
                  data.push(page.elements[j]);
                }
              }
            }
            $scope.align = function(type) {
              align[type](data);
            };
            $scope._enableMenu(data);
            multidrag.enable($stateParams.pageId, data, current);

            var ids = [];
            data.map(function(item) {
              ids.push(item.id);
            });
            $(document).on('keydown.selectedView', function (e) {
              var evt = e || window.event;
              var ctrlDown = evt.ctrlKey || evt.metaKey;
              var key = evt.keyCode;
              if (ctrlDown) {
                switch (key) {
                  // copy
                  case 67:
                    docService.copyElements($stateParams.pageId, ids);
                    break;
                  // // cut
                  // case 88:
                  //   docService.cutElements($stateParams.pageId, ids);
                  //   break;
                  default:
                    return;
                }
              } else if (key == 8) {
                docService.deleteElements($stateParams.pageId, ids);
              } else {
                return;
              }
              if (!$rootScope.$$phase) {
                $scope.$apply();
              }
              if (key == 8) {
                $state.go('app.edit.page.setting.bg');
              }
              return false;
            });

            $scope.excute = function(type) {
              if (type == 'copy') {
                docService.copyElements($stateParams.pageId, ids);
              }
              if (type == 'paste') {
                docService.pasteElements($stateParams.pageId);
                setTimeout(function() {
                  // 因为此时粘贴的元素还没插入页面，multiselect.select粘贴元素进行DOM操作
                  afterPaste();
                }, 17)
              }
              if (type == 'delete') {
                docService.deleteElements($stateParams.pageId, ids);
                $state.go('app.edit.page.setting.bg');
              }
            };
          });

          function afterPaste() {
            var current = docService.getCurrent();
            multiselect.clearCurrent();
            multiselect.select(current);
            $rootScope.$broadcast('clearStateBound');
            $rootScope.$broadcast('onSelectReady', multiselect.getCurrent());
          }

          $scope.$on('clearStateBound', function() {
            $scope._disableMenu();
            multidrag.disable();
            $(document).off('keydown.selectedView');
          });

          $scope.$on('$destroy', function() {
            multiselect.clearCurrent();
            multidrag.disable();
            $scope._disableMenu();
            $scope.enableMenu();
            $(document).off('keydown.selectedView');
          });
        }]
      }
    }
  });
}]);