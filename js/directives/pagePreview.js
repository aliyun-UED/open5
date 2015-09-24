angular.module('app')
    .directive('pagePreview',
    ['$rootScope', '$timeout', '$parse',
      function ($rootScope, $timeout, $parse) {
        return {
          restrict: 'A',
          replace: false,
          link: function (scope, elem, attrs, controller) {
            var pageData = $parse(attrs['pagePreview'])(scope);
            elem.html(window.player.page.build(pageData, window.player.width, window.player.height));
            console.log('pagePreview', elem);
            scope.$on('refreshPreview', function() {
              console.log('aaa..... refresh preview ...')
              elem.html(window.player.page.build(pageData, window.player.width, window.player.height));
            });
          }
        }
      }]);