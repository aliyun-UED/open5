'use strict';
angular.module('app').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
        .state('app.loading', {
          url: '/loading',
          views: {
            "edit@app": {
              templateUrl: '/tpl/app_loading.html',
              controller: ['$scope', '$state', '$stateParams', 'docService', '$previousState',
                function ($scope, $state, $stateParams, docService, $previousState) {
                  // todo: handle this
                  if(!$stateParams.docId) {

                  }

                  $previousState.memo('beforePreview');

                  docService.load($stateParams.docId)
                      .then(function() {
                        if($previousState.get()) {
                          $previousState.go('beforePreview');
                        }
                        else {
                          $state.go('app.edit');
                        }
                      });
                }]
            }
          }
        })
  }]);
