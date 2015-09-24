"use strict";

angular.module('app')
    .controller('ModalInstanceCtrl',
    ['$scope', '$modalInstance', 'options',
      function ($scope, $modalInstance, options) {
        $scope.options = options;

        $scope.ok = function () {
          $modalInstance.close();
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      }])
    .factory('confirmDialog',
    ['$rootScope', '$timeout', '$parse', '$modal',
      function ($rootScope, $timeout, $parse, $modal) {
        return function (options, confirmCallback) {
          var modalInstance = $modal.open({
            templateUrl: '/tpl/blocks/modal.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
              options: function () {
                return options;
              }
            }
          });

          modalInstance.result.then(function () {
            if(confirmCallback) {
              confirmCallback();
            }
          }, function () {
          });
        }
      }]);