/**
 * @author RubaXa <trash@rubaxa.org>
 * @licence MIT
 */
(function (factory) {
  'use strict';

  if (window.angular && window.Sortable) {
    factory(angular, Sortable);
  }
  else if (typeof define === 'function' && define.amd) {
    define(['angular', './Sortable'], factory);
  }
})(function (angular, Sortable) {
  'use strict';

  var app = angular.module('ng-sortable', []).constant('version', '0.0.1');

  // options.updateModel
  // options.sortFn  example: function(a,b) { return a > b };
  // 添加的时候，需要代码把内容添加到页面，然后再添加数据到数组
  // 删除的时候，在回调函数中执行DOM删除的操作
  app.directive('ngSortable', ['$compile', '$rootScope', function($compile, $rootScope) {
    return {
      restrict: 'EA',
      transclude: 'true',
      priority: 1000,
      terminal: true,
      scope: {
        ngModel: '=',
        ngSortable: '='
      },
      link: function($scope, element, attrs, ctrl, $transclude) {
        var options = $scope.ngSortable || {};
        var sortFn = options.sortFn;
        var reverse = options.reverse;
        var flag = 'data-index';
        var settings = {};
        var tiles  = $(element)[0].getElementsByClassName("tile");

        angular.forEach([
          'onStart', 'onEnd', 'onUpdate', 'onSort', 'onAdd', 'onRemove'
        ], function (name) {
          settings[name] = options[name];
        });

        var sortable = Sortable.create(element[0], $.extend(options, {
          onStart: function(event) {
            // test
            var list = element.children();
            var item = list[event.oldIndex];
          },
          onEnd: function(event) {
            // test
            var list = element.children();
          },
          onUpdate: function(event) {
            if (options.updateModel) {
              var sorted = getNewOrder();
              for (var i = 0; i < sorted.length; i++) {
                $scope.ngModel[i] = sorted[i];
              }
              if(!$rootScope.$$phase) {
                $scope.$apply();
              }
            }
            executeMethod('onUpdate', event);
          },
          onSort: function(event) {
            executeMethod('onSort', event);
          },
          onAdd: null,
          onRemove: null
        }));

        var items = $scope.items = $scope.ngModel;
        $scope.removeItem = function(item) {
          var index = items.indexOf(item);
          items.splice(index, 1);
          if (typeof settings.onRemove == 'function') {
            settings.onRemove(item);
          }
        };
        $scope.$watch(function(){
          if (!$scope.ngModel) {
            return null;
          } else {
            return $scope.ngModel.length;
          }
        }, function(newValue, oldValue) {
          if (!$scope.ngModel) return;
          var array = $scope.ngModel;
          if (typeof sortFn == 'function') {
            array = $scope.ngModel.sort(sortFn);
          }

          element.html('');
          array.map(function(item, index) {
            var scope = $scope.$new(false, $scope);

            scope.$$item = item;
            // 模拟ng-repeat $index
            scope.$index = index;
            $transclude(scope, function(content) {
              content = getDom(content);
              $(content).attr(flag, item.$index + 1).addClass('tile');
              var tile = {
                index: index,
                element: content,
                data: item
              };
              element.push(content);
            });
          });
        });
        $scope.$on('$destroy', function() {
          sortable.destroy();
        });

        function getDom(domList) {
          var node;
          $(domList).toArray().map(function(item) {
            if (item.nodeType == 1) {
              node = item;
            }
          });
          return node;
        }
        function executeMethod(name, event) {
          if (typeof settings[name] == 'function') {
            var sorted = getNewOrder();
            settings[name](sorted, event.oldIndex, event.newIndex);
          }
        }
      }
    };
  }]);
});

