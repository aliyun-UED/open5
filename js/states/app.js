'use strict';
var app = angular.module('app');
app.constant('app', {
  version: '0.6.0'
}).config(['$stateProvider', '$httpProvider', 'app', function ($stateProvider, $httpProvider, app) {
  $stateProvider.state('app', {
    url: '/app/:docId',
    resolve: {
      preload: ["docService", "$stateParams", "pageLoading",
        function (docService, $stateParams, pageLoading) {
          var promise = docService.load($stateParams.docId);
          promise.then(function () {
            setTimeout(function () {
              pageLoading.hide();
            }, 300);
          });
          return promise;
        }
      ]
    },
    templateUrl: '/tpl/app.html',
    controller: ['$scope', '$state', '$stateParams', 'docService', 'pageLoading', '$rootScope',
      function ($scope, $state, $stateParams, docService, pageLoading, $rootScope) {
        var pages = docService.getPages();
        var page = pages[0];
        $rootScope.isAdmin = window.appConfig.isAdmin;
        if ($state.current.name == 'app' || $state.current.name == 'app.edit') {
          $state.go('app.edit.page', {
            pageId: page.id
          });
          return;
        }
      }
    ]
  });
  // global error handle
  $httpProvider.interceptors.push(function() {
    return {
      response: function(res) {
        // todo
        return res;
      },
      responseError: function(res) {
        var toaster = app.toaster;
        toaster.pop({
          type: 'error',
          timeout: 1500,
          title: null,
          body: '网络出现问题',
          showCloseButton: true
        });
        return res;
      }
    };
  });
}]).run(['$rootScope', 'toaster', 'app', function($rootScope, toaster, app) {
  app.toaster = toaster;
  window.onbeforeunload = function() {
    console.log('unload ... ');
  };
}]);
