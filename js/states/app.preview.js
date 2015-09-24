'use strict';
angular.module('app').config(['$stateProvider', function ($stateProvider) {
  $stateProvider.state('app.preview', {
    url: '/preview',
    views: {
      "preview@app": {
        templateUrl: '/tpl/custom/preview.html',
        controller: ['$scope', '$previousState', '$state', 'docService', '$timeout',
          function ($scope, $previousState, $state, docService, $timeout) {
            $previousState.memo('beforePreview');
            $scope.back = function () {
              if ($previousState.get()) {
                $previousState.go('beforePreview');
              }
              else {
                $state.go('app.edit');
              }
            };

            var previewPlayer = window.Player.create('#preview #player', docService.getDoc());
            previewPlayer.startPreview();

            $scope.$on('$destroy', function () {
              previewPlayer.destroy();
            });
          }]
      }
    }
  });
}]);
