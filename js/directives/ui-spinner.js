angular.module('ui.spinner', []).directive('spinner', function() {
  return {
    restrict: 'EA',
    require: '?ngModel',
    scope: {
      unit: '@',
      min: '@',
      ngModel: '=',
      onChange: '&',
      max: '@',
      step: '@',
      precision: '@'
    },
    link: function($scope, element, attrs, ctrl) {
      // todo need to delete
      if (!ctrl) return;
      var ngModelCtrl = ctrl;
      if ($scope.unit) {
        var format = function(value) {
          return value + $scope.unit;
        };
        var parse = function(value) {
          // console.log('parse', value.replace($scope.unit, ''));
          return value.replace($scope.unit, '');
        };
        function formatModel(value) {
          if (value == 0) {
            value = '0';
          }
          return value && parseFloat(value) + $scope.unit;
        };
        function parseModel(value) {
          return value && parseFloat(value) + $scope.unit;
        };
        ngModelCtrl.$formatters.push(formatModel);
        ngModelCtrl.$parsers.push(parseModel);
      }

      var options = {
        min: $scope.min || 0,
        max: $scope.max || 100,
        step: $scope.step || 1,
        precision: $scope.precision || 0,
        looping: false,
        format: format,
        parse: parse
      };
      var $element = $(element);
      $element.asSpinner(options);
      $element.on('asSpinner::change', function(event, instance) {
        var value = instance.val();
        // // todo check viewValue
        ngModelCtrl.$setViewValue(value);
        if (typeof $scope.onChange == 'function') {
          $scope.onChange(value);
        }
      });
      $scope.$watch('ngModel', function(newValue, oldValue) {
        var value = trimUnit(newValue);
        $element.asSpinner('_set', value);
      });
      function trimUnit(value) {
        return value && parseFloat(value);
      }
    }
  }
});