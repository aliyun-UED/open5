angular.module('app').directive('ngSelectBoxIt', ['$rootScope', '$timeout', '$parse', function ($rootScope, $timeout, $parse) {
  var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/;
  return {
    restrict: 'AE',
    replace: false,
    scope: {
      onSelect: '&',
      ngModel: '=',
      autoWidth: '@'
    },
    link: function ($scope, element, attrs, controller) {
      var match = attrs.ngOptions.match(NG_OPTIONS_REGEXP);
      var valuesFn = $parse(match[7]);
      var selectFn = $scope.onSelect;
      if ($scope.autoWidth == 'auto') {
        $scope.autoWidth = true;
      } else {
        $scope.autoWidth = false;
      }
      $scope.$evalAsync(function () {
        element.selectBoxIt({
          autoWidth: $scope.autoWidth
        });

        element.on('change', function(evt, obj) {
          if (typeof selectFn == 'function') {
            selectFn();
            if (!$rootScope.$$phase) {
              $scope.$apply();
            }
          }
        });
      });
      var _watchList = $scope.$watch(valuesFn, function(newValue, oldValue) {
        $scope.$evalAsync(function () {
          var selectBox = element.data("selectBox-selectBoxIt");
          selectBox.refresh();
        });
      }, true);

      $scope.$on('$destroy', function () {
        _watchList();
      });
    }
  }
}]);