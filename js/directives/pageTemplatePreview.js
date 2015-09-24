angular.module('app')
    .directive('pageTemplatePreview',
    ['$rootScope', '$timeout', '$parse', 'ossService', '$state', 'docService', '$rootScope',
      function ($rootScope, $timeout, $parse, ossService, $state, docService, $rootScope) {
        return {
          restrict: 'A',
          replace: false,
          link: function (scope, elem, attrs, controller) {

            var pageData;

            var buildPageCss3Timeline = function (pageData) {
              var tl = {
                list: [],
                play: function() {
                  for(var i = 0; i < tl.list.length; i++) {
                    tl.list[i].play();
                  }
                },
                clear: function() {
                  for(var i = 0; i < tl.list.length; i++) {
                    tl.list[i].reset();
                  }
                }
              };

              for(var i = 0; i < pageData.elements.length; i ++) {
                var t = buildElementCss3Timeline(pageData.elements[i]);
                tl.list.push(t);
              }

              return tl;
            };

            var buildElementCss3Timeline = function (elementData, onComplete) {
              var target = elem.find('#' + elementData.id);
              var animArray = elementData.animations || [];

              return new window.player.page.AnimateExcute(target, animArray, onComplete);
            };

            var p = $parse(attrs['pageTemplatePreview'])(scope);
            var timeline;

            var isPublic = $state.includes('app.templates.common');
            ossService.loadPage(p.id, isPublic).then(function(data) {
              pageData = data;
              elem.html(window.player.page.build(data, window.player.width, window.player.height));
              timeline = buildPageCss3Timeline(data);
            });

            elem.on('mouseenter', function() {
              if(timeline) {
                timeline.play();
              }
            });

            elem.on('mouseleave', function() {
              if(timeline) {
                timeline.clear();
              }
            });

            elem.on('click', function() {
              if(pageData) {
                docService.addPage(pageData);
                if(!$rootScope.$$phase) {
                  $rootScope.$apply();
                }
              }
            });

            scope.$on('$destroy', function() {
              elem.off();
            });
          }
        }
      }]);