'use strict';
angular.module('app').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('app.edit.page.image', {
      url: '/image/:elementId',
      deepStateRedirect: {
        default: 'app.edit.page.image.property',
        params: true,
        fn: ['$dsr$', '$state', function($dsr$, $state) {
          var current = $state.current;
          var childState = current && current.name && current.name.split('.')[4];
          var stateList = ['property', 'style', 'arrange', 'animate'];
          if (childState && stateList.indexOf(childState) != -1) {
            return {
              state: 'app.edit.page.image.' + childState,
              params: $dsr$.redirect.params
            }
          } else {
            return true;
          }
        }]
      },
      data: {
        info: {
          type: 'image'
        },
        tabs: [
          {
            name: '图片',
            type: 'property',
            url: '.property'
          },
          {
            name: '样式',
            type: 'style',
            url: '.style'
          },
          {
            name: '排列',
            type: 'arrange',
            url: '.arrange'
          },
          {
            name: '动画',
            type: 'animate',
            url: '.animate'
          }
        ]
      },
      views: {
        'panel@app.edit.page': {
          templateUrl: '/tpl/custom/panels/index.html',
          controller: 'elementCtrl'
        }
      }
    }).state('app.edit.page.image.property', {
      url: '/property',
      data: {tag: 'image'},
      views: {
        'tab': {
          templateUrl: '/tpl/custom/tabs/image.html',
          controller: ['$scope', '$rootScope', '$state', '$stateParams',
            function ($scope, $rootScope, $state, $stateParams) {
              var vm = $scope.vm = {};
              vm.css = $scope.css;

              $scope.formatFilter = function () {
                if (!vm.css.filter || vm.css.filter == 'none') {
                  return 0
                } else {
                  return parseInt(parseFloat(vm.css.filter.replace('blur(', '')) * 20);
                }
              };
              $scope.open = function() {
                $state.go('app.gallery.common', {
                  type: 'image',
                  elementId: $stateParams.elementId
                });
              };
              $scope.crop = function() {
                $state.go('app.crop', {
                  type: 'image',
                  elementId: $stateParams.elementId
                });
              };
              $scope.transform = function(value) {
                if (!value || value == 'none') {
                  return 0;
                } else {
                  return parseFloat(value.replace('blur(', '')) * 20;
                }
              };

              $scope.enableTransform();
              $scope.element.on('dblclick.image', function () {
                $state.go('app.gallery.common',{
                  type: 'image',
                  elementId: $stateParams.elementId
                });
              });
              $scope.$on('$destroy', function () {
                $scope.disableTransform();
                $scope.element.off('dblclick.image');
              });
            }]
        }
      }
    }).state('app.edit.page.image.style', {
      url: '/style',
      data: {tag: 'image'},
      views: {
        'tab': {
          templateUrl: '/tpl/custom/tabs/style.html',
          controller: 'styleCtrl'
        }
      }
    }).state('app.edit.page.image.arrange', {
      url: '/arrangement',
      data: {tag: 'image'},
      views: {
        'tab': {
          templateUrl: '/tpl/custom/tabs/arrange.html',
          controller: 'arrangeCtrl'
        }
      }
    }).state('app.edit.page.image.animate', {
      url: '/animate',
      data: {tag: 'image'},
      views: {
        'tab': {
          templateUrl: '/tpl/custom/tabs/animate.html',
          controller: 'animateCtrl'
        }
      }
    });
  }
]);
