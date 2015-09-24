'use strict';
angular.module('app').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('app.edit.page.text', {
      url: '/text/:elementId',
      deepStateRedirect: {
        default: 'app.edit.page.text.property',
        params: true,
        fn: ['$dsr$', '$state', function($dsr$, $state) {
          var current = $state.current;
          var childState = current && current.name && current.name.split('.')[4];
          var stateList = ['property', 'style', 'arrange', 'animate'];
          if (childState && stateList.indexOf(childState) != -1) {
            return {
              state: 'app.edit.page.text.' + childState,
              params: $dsr$.redirect.params
            }
          }
          if ($dsr$.redirect.state == 'app.edit.page.text.select') {
            return {
              state: 'app.edit.page.text.property',
              params: $dsr$.redirect.params
            };
          } else {
            return true;
          }
        }]
      },
      data: {
        info: {
          type: 'text'
        },
        tabs: [
          {
            name: '文字',
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
    }).state('app.edit.page.text.select', {
      url: '/select',
      data: {
        tabs: [
          {
            name: '文字',
            type: 'select',
            url: '.select'
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
        ],
        tag: 'select'
      },
      views: {
        'tab': {
          templateUrl: '/tpl/custom/tabs/textSelect.html',
          controller: ['$state', '$stateParams', '$scope', '$rootScope', '$timeout', 'selectionOp', function ($state, $stateParams, $scope, $rootScope, $timeout, selectionOp) {
            var vm = $scope.vm = {};
            var autoHeight = {
              _start: function($scope) {
                $scope.element.css({
                  'min-height': $scope.elementData.css.height + 'px',
                  'height': 'initial'
                });
                $scope.elementContainer.css({
                  'min-height': $scope.elementData.css.height + 'px'
                });
                $scope.elementContent.css({
                  'height': 'initial',
                  'overflow': 'visible'
                });
              },
              start: function($scope) {
                autoHeight._start($scope);
                $scope.element.find('.operate .scale').on('mousedown.auto', function() {
                  autoHeight._end($scope);
                  $scope.elementContent.off('mousedown.editable');
                  $scope.elementContent.prop('contenteditable', false);

                  $scope.elementContent.one('mousedown.editable', function() {
                    autoHeight._start($scope);
                    $scope.elementContent.prop('contenteditable', true).focus();
                  });

                  var self = this;
                  $(self).on('mousemove.auto', function() {
                    $(self).off('mouseup.auto');
                  }).on('mouseup.auto', function() {
                    $state.go('^.property');
                    $(self).off('mousemove.auto');
                    $(self).off('mouseup.auto');
                  });
                });
              },
              _end: function($scope) {
                $scope.elementData.css.height = parseInt($scope.element.css('height'));
                $scope.element.css({
                  'height': $scope.elementData.css.height + 'px'
                });
                // 去掉overflow: hidden的原因是line-height过小，文字会被隐藏，无法实现文字靠的很近的功能
                $scope.elementContent.css({
                  // 'height': '100%',
                  // 'overflow': 'hidden'
                });
                $scope.element.css({
                  'min-height': 'initial'
                });
                $scope.elementContainer.css({
                  'min-height': 'initial'
                });
              },
              end: function($scope) {
                autoHeight._end($scope);
                $scope.element.find('.operate .scale').off('mousedown.auto').off('mousemove.auto').off('mousedown.auto');
                $scope.elementContent.off('mousedown.editable');
              }
            };

            vm.fontFamilyList = $scope.FontFamilyList;
            $scope.elementContent.prop('contenteditable', true).focus();
            setTimeout(function() {
              selectElementContents($scope.elementContent[0]);
            }, 0);

            // rangy: save and restore selection
            // var unbindSelectionSaved = selectionOp($scope.elementContent);

            // http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element
            function selectElementContents(el) {
              var range = document.createRange();
              range.selectNodeContents(el);
              var sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
            }
            function removeRanges() {
              var sel = window.getSelection();
              sel.removeAllRanges();
            }

            // spellcheck="false"
            if (!document.getSelection().anchorNode) {
              return $state.go('^.property');
            }

            vm.css = $scope.selectedTextCss = {
              backColor: '', // 文字的背景颜色
              foreColor: '',  // 字体颜色
              fontSize: '', // 2-26
              fontName: '',

              justifyCenter: '', // 没有值
              justifyFull: '',
              justifyLeft: '',
              justifyRight: '',

              bold: '',
              italic: '',
              underline: '',

              createLink: ''
            };
            vm.changeFontSize = function($item, $model) {
              setSelectText('fontSize', vm.css.fontSize);
            };
            vm.changeBg = function(value) {
              setSelectText('backColor', vm.css.backColor);
            };
            vm.changeColor = function(value) {
              setSelectText('foreColor', vm.css.foreColor);
            };
            vm.onChange = function($item, $model) {
              var $item = vm.font;
              vm.css.fontName = $item.value;
              setSelectText('fontName', vm.css.fontName);
            };
            $scope.setBold = function() {
              if (vm.css.bold === 'true') {
                vm.css.bold = 'false';
              } else {
                vm.css.bold = 'true';
              }
              setSelectText('bold', vm.css.bold);
            };
            $scope.setItalic = function() {
              if (vm.css.italic === 'true') {
                vm.css.italic = 'false';
              } else {
                vm.css.italic = 'true';
              }
              setSelectText('italic', vm.css.italic);
            };
            $scope.setUnderline = function() {
              if (vm.css.underline === 'true') {
                vm.css.underline = 'false';
              } else {
                vm.css.underline = 'true';
              }
              setSelectText('underline', vm.css.underline);
            };
            $scope.setAlign = function(type) {
              var arr = ['justifyCenter', 'justifyFull', 'justifyLeft', 'justifyRight'];
              arr.map(function(str) {
                vm.css[str] = 'false';
              });
              vm.css[type] = 'true';
              setSelectText(type, vm.css[type]);
            };

            $scope.linkList = window.config.linkList;
            vm.link = $scope.linkList[0];
            vm.fontSizeList = window.config.fontSizeList;

            $scope.update = function () {
              for (var i in $scope.selectedTextCss) {
                if (i == 'fontSize') {
                  var size = $(document.getSelection().anchorNode.parentElement).attr('size');
                  if (!size) size = 5;
                  $scope.selectedTextCss[i] = parseInt(size);
                  continue;
                }
                $scope.selectedTextCss[i] = document.queryCommandValue(i);
                // 单独设置 fontFamily值
                if (i == 'fontName') {
                  vm.font = null;
                  angular.forEach(vm.fontFamilyList, function(item, index) {
                    var font = vm.css.fontName && vm.css.fontName.replace(/[''""]/g, '');
                    if (font == item.value) {
                      vm.font = item;
                    }
                  });
                  if (!vm.font) {
                    vm.font = vm.fontFamilyList[0];
                  }
                }
              }
              $scope.elementData.content = $scope.elementContent.html();
              if (!$rootScope.$$phase) {
                $scope.$apply();
              }
            };
            function setSelectText(i, value) {
              switch (i) {
                case 'backColor':
                case 'foreColor':
                case 'fontName':
                  document.execCommand(i, false, value);
                  break;
                case 'fontSize':
                  document.execCommand(i, false, 1);
                  // $(document.getSelection().anchorNode.parentElement).attr('size', value).find('[size=1]').attr('size', value);
                  // setFontSize(value);
                  $scope.elementContent.find('font[size=1]').attr('size', value)
                  break;
                default:
                  document.execCommand(i, false, value);
                  break;
              }
              updateTextEditPreview();
            }

            // 间距，对齐
            var originHeight = $scope.css.height;
            vm.updateHeight = function() {
              function setHeight() {
                var paddingTop = $scope.css.paddingTop;
                var paddingBottom = $scope.css.paddingBottom || 0;
                var contentHeight = $scope.element.find('.element-content').height();
                var height = parseFloat(paddingTop) + parseFloat(paddingBottom) + parseFloat(contentHeight);
                if (height > parseFloat($scope.css.height) || height >= parseFloat(originHeight)) {
                  $scope.css.height = height + 'px';
                }
              }
              $timeout(function() {
                setHeight();
              });
            };
            vm.verticalTop = function() {
              $scope.css.paddingTop = 0 + 'px';
            };
            vm.verticalCenter = function() {
              var paddingTop = parseFloat($scope.css.paddingTop);
              var content = $scope.element.find('.element-content').height();
              var height = parseFloat($scope.css.height);
              var paddingBottom = parseFloat($scope.css.paddingBottom);
              if (content > height + paddingBottom) return;
              $scope.css.paddingTop =  (height - content) / 2 + 'px';
            };
            vm.verticalBottom = function() {
              $scope.css.paddingBottom = 0;
              var paddingTop = parseFloat($scope.css.paddingTop);
              var content = $scope.element.find('.element-content').height();
              var height = parseFloat($scope.css.height);
              if (height < content) return;
              $scope.css.paddingTop = (height - content) + 'px';
            };

            $scope.enableTransform();
            $scope.disableClick($scope.element);
            autoHeight.start($scope);
            $scope.update();

            $scope.elementContent.on('keydown.select', function (e) {
              e.stopPropagation();
              setTimeout(function() {
                $scope.update();
                updateTextEditPreview();
              }, 0);
            });
            $scope.element.on('mousedown.select', function (e) {
              e.stopPropagation();
            });
            $scope.elementContent.on('mouseup.select', function (e) {
              setTimeout(function() {
                $scope.update();
              }, 0);
            });
            $('.edit_panel').on('mousedown.clickEvent', function (e) {
              var $iframesDocument = $(this).find('iframe').contents();
              for (var i = 0; i < $iframesDocument.length; i++) {
                $($iframesDocument[i]).find('input').blur();
              }
              e.preventDefault();
            });

            $scope.$on('$destroy', function () {
              $scope.enableClick($scope.element);
              $scope.disableTransform();
              autoHeight.end($scope);

              $scope.element.off('click.select');
              $scope.element.off('mousedown.select');
              $scope.elementContent.off('mouseup.select');
              $scope.elementContent.off('keydown.select');
              $scope.elementContent.prop('contenteditable', false);
              $scope.elementContent.off('mousedown.select');
              // unbindSelectionSaved();
              $('.edit_panel').off('.clickEvent');
              removeRanges();
            });
            function updateTextEditPreview() {
              $scope.elementData.content = $scope.elementContent.html();
              $rootScope.$broadcast('refreshPreview', $stateParams.pageId);
            }
          }]
        }
      }
    }).state('app.edit.page.text.property', {
      url: '/property',
      data: {tag: 'property'},
      views: {
        'tab': {
          templateUrl: '/tpl/custom/tabs/text.html',
          controller: ['$state', '$stateParams', '$scope', 'docService', '$timeout', function ($state, $stateParams, $scope, docService, $timeout) {
            var vm = $scope.vm = {};
            vm.fontFamilyList = $scope.FontFamilyList;
            vm.css = $scope.css;

            vm.font = null;
            angular.forEach(vm.fontFamilyList, function(item, index) {
              if (vm.css.fontFamily == item.value) {
                vm.font = item;
              }
            });
            if (!vm.font) {
              vm.font = vm.fontFamilyList[0];
            }
            vm.onChange = function($item, $model) {
              vm.css.fontFamily = vm.font.value;
            };

            var originHeight = vm.css.height;
            vm.updateHeight = function() {
              function setHeight() {
                var paddingTop = vm.css.paddingTop;
                var paddingBottom = vm.css.paddingBottom || 0;
                var contentHeight = $scope.element.find('.element-content').height();
                var height = parseFloat(paddingTop) + parseFloat(paddingBottom) + parseFloat(contentHeight);
                if (height > parseFloat(vm.css.height) || height >= parseFloat(originHeight)) {
                  vm.css.height = height + 'px';
                }
              }
              $timeout(function() {
                setHeight();
              });
            };

            vm.verticalTop = function() {
              vm.css.paddingTop = 0 + 'px';
            };
            vm.verticalCenter = function() {
              var paddingTop = parseFloat(vm.css.paddingTop);
              var content = $scope.element.find('.element-content').height();
              var height = parseFloat(vm.css.height);
              var paddingBottom = parseFloat(vm.css.paddingBottom);
              if (content > height + paddingBottom) return;
              vm.css.paddingTop =  (height - content) / 2 + 'px';
            };
            vm.verticalBottom = function() {
              vm.css.paddingBottom = 0;
              var paddingTop = parseFloat(vm.css.paddingTop);
              var content = $scope.element.find('.element-content').height();
              var height = parseFloat(vm.css.height);
              if (height < content) return;
              vm.css.paddingTop = (height - content) + 'px';
            };

            vm.element = $scope.elementData;
            vm.pages = docService.getPages();

            $scope.enableTransform();
            $scope.element.on('dblclick.text', function() {
              $state.go('^.select');
            });
            $scope.$on('$destroy', function () {
              $scope.disableTransform();
              $scope.element.off('dblclick.text');
            });
          }]
        }
      }
    }).state('app.edit.page.text.style', {
      url: '/style',
      data: {tag: 'text'},
      views: {
        'tab': {
          templateUrl: '/tpl/custom/tabs/style.html',
          controller: 'styleCtrl'
        }
      }
    }).state('app.edit.page.text.arrange', {
      url: '/arrangement',
      data: {tag: 'text'},
      views: {
        'tab': {
          templateUrl: '/tpl/custom/tabs/arrange.html',
          controller: 'arrangeCtrl'
        }
      }
    }).state('app.edit.page.text.animate', {
      url: '/animate',
      data: {tag: 'text'},
      views: {
        'tab': {
          templateUrl: '/tpl/custom/tabs/animate.html',
          controller: 'animateCtrl'
        }
      }
    });
  }
]);
