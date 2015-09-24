'use strict';
angular.module('app').config(['$stateProvider',function ($stateProvider) {
  $stateProvider.state('app.edit.page.setting', {
    url: '/setting',
    deepStateRedirect: {
      default: 'app.edit.page.setting.bg',
      params: true
    },
    data: {
      info: {
        type: 'setting'
      },
      tabs: [
        {
          name: '设置',
          type: 'bg',
          url: '.bg'
        },
        //{
        //  name: '特效',
        //  type: 'effect',
        //  url: '.effect'
        //},
        {
          name: '图层',
          type: 'layer',
          url: '.layer'
        }
      ]
    },
    views: {
      'panel@app.edit.page': {
        templateUrl: '/tpl/custom/panels/index.html',
        controller: ['$state', '$stateParams', '$scope', '$timeout', 'docService', '$rootScope', 'common', function ($state, $stateParams, $scope, $timeout, docService, $rootScope, common) {
          player.transformManager.disable();
          $scope.page = $('#player #' + $stateParams.pageId);
          $scope.pageData = docService.getPage($stateParams.pageId);
          $timeout(function() {
            $scope.previewPage = $('.app-aside #' + $stateParams.pageId);
          });
          // 在这里绑定ctrl + c/ delete事件
          $(document).on('keydown.page_setting', function (e) {
            if (!$rootScope.SELECT_PAGE) return;

            var evt = e || window.event;
            var elemId = $stateParams.elementId;
            var ctrlDown = evt.ctrlKey || evt.metaKey;
            var key = evt.keyCode;
            if (ctrlDown && key == 67) {
              docService.copyPage($stateParams.pageId);
            } else if (key == 8 || key == 46) {
              var currentIndex = docService.getPages().indexOf($scope.pageData);
              var nextIndex;
              if (currentIndex == docService.getPages().length - 1) {
                nextIndex = currentIndex - 1;
              } else {
                nextIndex = currentIndex + 1;
              }
              var nextPage = docService.getPages()[nextIndex];
              docService.deletePage($stateParams.pageId);
            } else {
              return;
            }
            if (!$rootScope.$$phase) {
              $scope.$apply();
            }
            if ( key == 8 || key == 46) {
              $state.go('app.edit.page', {
                pageId: nextPage.id
              });
            }
            return false;
          });
          $scope.$on('$destroy', function() {
            $(document).off('keydown.page_setting');
          });
        }]
      }
    }
  }).state('app.edit.page.setting.bg', {
    url: '/bg',
    data: {tag: 'bg'},
    views: {
      'tab': {
        templateUrl: '/tpl/custom/tabs/bg.html',
        controller: ['$scope', 'docService', '$stateParams', '$state', 'xssList', function ($scope, docService, $stateParams, $state, xssList) {
          var vm = $scope.vm = {};
          vm.pageTransition = window.config.pageTransition;
          vm.page = docService.getPage($stateParams.pageId);
          vm.doc = docService.getDoc();
          $scope.css = $scope.pageData.background.input;

          vm.page.effect = vm.page.effect || {};
          vm.page.effect.name = vm.page.effect.name || 'none';
          vm.page.turnIcon = vm.page.turnIcon || 'no';
          $scope.effect = vm.page.effect;

          vm.docProperties = vm.doc.properties;
          vm.music = vm.doc.properties.music;

          vm.onChange = function() {
            vm.docProperties.name = xssList.filterXSS(vm.docProperties.name);
          };
          $scope.setEffect = function(type) {
            vm.page.effect.name = type;
            if (type == 'none') {
              vm.page.effect.mode = '';
            }
            if (type == 'stretch') {
              vm.page.effect.mode = 'origin';
            }
            if (type == 'slide') {
              vm.page.effect.mode = 'horizontal';
            }
            addPageEffect();
          };
          $scope.setEffectMode = function(mode) {
            vm.page.effect.mode = mode;
            addPageEffect();
          };

          function addPageEffect() {
            if (vm.page.effect && vm.page.effect.name && vm.page.effect.mode) {
              var effectClass = vm.page.effect.name + '-' + vm.page.effect.mode;
            } else {
              var effectClass = '';
            }
            $($scope.page).find('.page-bg-inner')[0].className = 'page-bg-inner ' + effectClass;
            // $($scope.previewPage).find('.page-bg-inner')[0].className = 'page-bg-inner ' + effectClass;
          }

          $scope.replace = function() {
            $state.go('app.gallery.common', {
              type: 'bg',
              pageId: $stateParams.pageId
            });
          };
          $scope.crop = function() {
            if (!$scope.pageData.background.input.image) return;
            $state.go('app.crop', {
              type: 'bg',
              pageId: $stateParams.pageId
            });
          };
          $scope.clearBg = function() {
            $scope.pageData.background.output = '';
            $scope.pageData.background.input.color = '';
            $scope.pageData.background.input.image = '';
            $scope.pageData.background.input.size = '';
            $scope.pageData.background.input.position = '';
            $scope.page.find('.page-bg-inner').css({'background': ''});
            $scope.previewPage.find('.page-bg-inner').css({'background': ''});
          };
          $scope.removeMusic = function() {
            vm.music.url = '';
            vm.music.name = '';
          };
          $scope.$on('SELECT_MUSIC', function(event, music) {
            vm.music.url = music.url;
            vm.music.name = music.name;
          });
          // 这里的css是背景属性
          var pageBg = $($scope.page).find('.page-bg-inner');
          var previewPageBg;
          $scope.$watch('css', function(newValue, oldValue) {
            if (newValue == oldValue) return ;
            var css = {};
            for ( var i in newValue) {
              if (!newValue[i]) continue;
              css['background-' + i] = newValue[i];
            }
            previewPageBg = previewPageBg || $($scope.previewPage).find('.page-bg-inner');
            pageBg.css(css);
            previewPageBg.css(css);
            $scope.pageData.background.output = formate($scope.css);
          }, true);
          function formate(obj) {
            var background = '';
            for (var i in obj) {
              if (obj[i]) {
                background += ('background-' + i + ':' + obj[i]);
                background += ';';
              }
            }
            return background;
          }
        }]
      }
    }
  }).state('app.edit.page.setting.effect', {
    url: '/effect',
    data: {tag: 'effect'},
    views: {
      'tab': {
        templateUrl: '/tpl/custom/tabs/effect.html',
        controller: ['$scope', function ($scope) {
          var vm = $scope.vm = {};
          $scope.effects = [
            {
              img: 'images/none.png',
              active: true,
              text: '无',
              type: ''
            },
            {
              img: 'images/paint.png',
              text: '涂抹'
            },
            {
              img: 'images/finger.png',
              text: '指纹'
            }
          ];
          $scope.effects_select = function (effect) {
            $scope.effects.map(function (item) {
              item.active = false;
            });
            effect.active = true;
          };
          $scope.deleteSortableItem = function (item) {
            var index = $scope.layers.indexOf(item);
            $scope.layers.splice(index, 1);
          };
          $scope.layerEdit = function (item) {
          };
        }]
      }
    }
  }).state('app.edit.page.setting.layer', {
    url: '/layer',
    data: {tag: 'layer'},
    views: {
      'tab': {
        templateUrl: '/tpl/custom/tabs/layer.html',
        controller: ['$scope', 'docService', '$stateParams', '$state', '$rootScope', function ($scope, docService, $stateParams, $state, $rootScope) {
          var pageData = docService.getPage($stateParams.pageId);
          var vm = $scope.vm = {};
          $scope.layers = pageData.elements;

          var options = $scope.options = {};
          options.height = 35;
          options.width = 290;
          options.gutter = 12;
          options.onChange = function(tiles) {
            for (var i = 0; i < tiles.length; i++) {
              var data = tiles[i].tile._data;
              data.css.zIndex = (i + 1);
              setIndex(data.id, i + 1);
            }
          };
          options.sortFn = function(a, b) {
            return a.css.zIndex < b.css.zIndex;
          };
          options.buildItem = function(data, index) {
            var strArr = [];
            var preview = '';
            var content = '';

            if (data.type == 'image') {
              preview = '<span class="layers_item_icon"><img src="' + data.content + '" /></span>';
              content = '<span>图片</span>';
            } else if (data.type == 'text') {
              var text = $(data.content).text() || '';
              text = text.slice(0,10).trim();

              preview = '<span class="layers_item_icon"><span style="background-color:' + data.css.backgroundColor + ';"></span></span>';
              content = '<span>' + (escape(text) || '空文本') + '</span>';
            }

            strArr = strArr.concat([preview, content]);
            var operator = [
              '<div class="pull-right layers_item_edit">',
              '<span><i class="fa fa-pencil tile-span"></i></span>',
              '<span><i class="fa fa-times tile-remove"></i></span>',
              '</div>'
            ];
            strArr = strArr.concat(operator);
            return strArr.join('');
          };
          options.onClick = function(data) {

          };
          options.onRemove = function(tile) {
            var data = tile._data;
            var pageId = $stateParams.pageId;
            docService.deleteElement(pageId, data.id);
            if (!$rootScope.$$phase) {
              $rootScope.$digest();
            }
          }
          options.onClickSpan = function(tile) {
            $scope.directTo(tile._data);
          };

          $scope.directTo = function(element) {
            var id = element.id;
            var state = '';
            if (element.type == 'text') {
              state = 'app.edit.page.text';
            }
            if (element.type == 'image') {
              state = 'app.edit.page.image';
            }
            $state.go(state, {
              pageId: $stateParams.pageId,
              elementId: id
            });
          };

          function setIndex(id, index) {
            $('#player #' + id).css({'zIndex': index});
            $('.app-aside #' + id).css({'zIndex': index});
          }
        }]
      }
    }
  });
}]);
