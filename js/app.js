'use strict';

// process config
(function () {
  var config = window.appConfig;
  if (!config.public) config.public = {};
  if (!config.user) config.user = {};

  var arr = config.oss.endpoint.split('//');
  config.oss.host = arr[0] + '//' + config.oss.bucket + '.' + arr[1];

  angular.forEach(['bg', 'image', 'music', 'page', 'doc'], function (item) {
    if(config.public[item] && !config.public[item].host) {
      delete config.public[item].host;
    }
    config.public[item] = jQuery.extend(true, {}, config.oss, config.public[item]);
    config.public[item]['path'] = 'public/' + item;

    config.user[item] = jQuery.extend(true, {}, config.oss, config.user[item]);
    config.user[item]['path'] = 'user/' + config.uid + '/' + item;
  });

  config.publish = jQuery.extend(true, {}, config.oss, config.publish);
  config.publish['path'] = 'publish';

})();

var app = angular.module('app', [
  'ngAnimate',
  'ngSanitize',
  'ngStorage',
  'ui.router',
  'ui.bootstrap',
  'remoteService',
  'aliyunService',
  'toaster',
  'ct.ui.router.extras',
  'ui.bootstrap-slider',
  'ui.colorpicker',
  'ui.spinner',
  'ui.cropper',
  'app.tpls'
]);

app.config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$urlRouterProvider',
  function ($controllerProvider, $compileProvider, $filterProvider, $provide, $urlRouterProvider) {
    // lazy controller, directive and service
    app.controller = $controllerProvider.register;
    app.directive = $compileProvider.directive;
    app.filter = $filterProvider.register;
    app.factory = $provide.factory;
    app.service = $provide.service;
    app.constant = $provide.constant;
    app.value = $provide.value;
  }
]).run(['$rootScope', '$state', '$stateParams', 'datepickerConfig', 'applyFn',
  function ($rootScope, $state, $stateParams, datepickerConfig, applyFn) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.winHeight = jQuery(window).height();
    $rootScope.winWidth = jQuery(window).width();
    $rootScope.applyFn = applyFn;
    $rootScope.global = {};
    $rootScope.isAdmin = window.appConfig.isAdmin;

    $rootScope.log = function () {
      switch (arguments.length) {
        case 0:
          return;
        case 1:
          console.log(arguments[0]);
          break;
        case 2:
          console.log(arguments[0], arguments[1]);
          break;
        case 3:
          console.log(arguments[0], arguments[1], arguments[2]);
          break;
        default:
          console.log(arguments);
      }
    };
  }]
);
app.factory('applyFn', ['$rootScope',
  function ($rootScope) {
    return function (fn, scope) {
      fn = angular.isFunction(fn) ? fn : angular.noop;
      scope = scope && scope.$apply ? scope : $rootScope;
      fn();
      if (!scope.$$phase) {
        scope.$apply();
      }
    };
  }
]);
