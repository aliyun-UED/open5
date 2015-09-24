'use strict';

angular.module('app').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('app.edit.page', {
      url: '/:pageId',
      sticky: true,
      deepStateRedirect: {
        default: 'app.edit.page.setting.bg',
        params: true
      },
      views: {
        "page-panel@app.edit": {
          template: "<div ui-view='panel'></div>",
          controller: ['$state', '$stateParams', '$scope', '$rootScope', 'docService', 'multiselect', 'common',
            function ($state, $stateParams, $scope, $rootScope, docService, multiselect, common) {
              $scope.pageData = docService.getPage($stateParams.pageId);

              $scope.page = $('#player #' + $stateParams.pageId);
              if ($scope.page.length == 0) {
                window.player.addPage($scope.pageData, true);
                $scope.page = window.player.wrapper.find('#' + $stateParams.pageId);
              }

              setTimeout(function() {
                $('.app-aside #' + $stateParams.pageId).closest('li').addClass('active');
                $scope.page.addClass('current');
                $scope.enableMove();
                $scope.enableMenu();
              }, 0);

              // 事件节流
              var throttle = function (fn, threshhold, scope) {
                threshhold || (threshhold = 250);
                var last;
                var deferTimer;
                return function () {
                  var context = scope || this;
                  var now = +new Date,
                      args = arguments;
                  if (last && now < last + threshhold) {
                    // hold on to it
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function () {
                      last = now;
                      fn.apply(context, args);
                    }, threshhold);
                  } else {
                    last = now;
                    fn.apply(context, args);
                  }
                };
              };
              var selectFn = function() {
                // 处理多选之后跳转
                var selected = multiselect.getCurrent();

                if (selected.length) {
                  $state.go('app.edit.page.selected', {
                    reload: true
                  });
                } else {
                  $state.go('app.edit.page.setting');
                }
              };
              multiselect.init('.edit_main', throttle(selectFn), function(current) {
                $rootScope.$broadcast('onSelectReady', current);
              });

              $('.edit_main').on('mousedown.page', function (e) {
                $state.go('app.edit.page.setting');
                multiselect.clearCurrent();
                // 由于禁止mousedown冒泡，这里程序触发blur事件
                $('.aside-wrap').find('input:focus').blur();
                $('.edit_tools').find('input:focus').blur();
              });

              $scope.enableMove = function() {
                $scope.page.find('.element').on('mousedown.page', clickElement);
              };

              $scope.disableMove = function() {
                $scope.page.find('.element').off('mousedown.page');
              };

              $scope.disableClick = function(element) {
                element.off('mousedown.page');
              };
              $scope.enableClick = function(element) {
                element.on('mousedown.page', clickElement);
              };

              $scope.enableMenu = function() {
                $scope.page.contextMenu({
                  selector: '.element',
                  callback: function(key, options) {
                    var elemId = $(this).attr('id');
                    if(!elemId) return;
                    switch(key) {
                      case "moveTop":
                        docService.layerTop(elemId, $stateParams.pageId);
                        break;
                      case "moveBottom":
                        docService.layerBottom(elemId, $stateParams.pageId);
                        break;
                      case "cut":
                        docService.cutElement($stateParams.pageId, elemId);
                        break;
                      case "copy":
                        docService.copyElement($stateParams.pageId, elemId);
                        break;
                      case "paste":
                        docService.paste($stateParams.pageId);
                        break;
                      case "delete":
                        docService.deleteElement($stateParams.pageId, elemId);
                        break;
                      case "crop":
                        $state.go('app.crop', {
                          type: 'image',
                          elementId: $state.params.elementId
                        });
                        return;
                      default:
                        return;
                    }
                    // todo: 为什么元素删除之后会影响到自定义事件的触发
                    setTimeout(function() {
                      if (!$rootScope.$$phase) {
                        $scope.$apply();
                      }
                      if (key == 'cut' || key == 'delete') {
                        $state.go('app.edit.page');
                      }
                      if (key == 'paste') {
                        afterPaste();
                      }
                    }, 17);
                  },
                  events: {
                    show: function(opt) {
                      var _copy = docService.getCopyObj()
                      if (!_copy || (_copy.type != 'element' && _copy.type != 'elements')) {
                        opt.items.paste.$node.addClass('has-disable');
                      } else {
                        opt.items.paste.$node.removeClass('has-disable');
                      }

                      if (opt.$trigger.attr('type') == 'image') {
                        opt.items.crop.$node.css({display: 'block'});
                      } else {
                        opt.items.crop.$node.css({display: 'none'});
                      }

                      //if (!docService.hasRecoveryElement()) {
                      //  opt.items.recovery.$node.addClass('has-disable');
                      //} else {
                      //  opt.items.recovery.$node.removeClass('has-disable');
                      //}
                    }
                  },
                  animation: {
                    duration: 100,
                    show: "fadeIn",
                    hide: "fadeOut"
                  },
                  items: {
                    "moveTop": {name: "移到最前面"},
                    "moveBottom": {name: "移到最后面"},
                    "crop": {name: "裁剪图片"},
                    "sep1": "---------",
                    "cut": {name: "剪切 ( Ctrl + X )"},
                    "copy": {name: "复制  ( Ctrl + C )"},
                    "paste": {name: "粘贴  ( Ctrl + V )"},
                    "sep2": "---------",
                    //"recovery": {name: "撤销 ( Ctrl + Z )"},
                    "delete": {name: "删除 ( Delete )"}
                  }
                });
                $scope.page.contextMenu({
                  selector: '.viewport',
                  callback: function(key, options) {
                    switch(key) {
                      case "paste":
                        docService.paste($stateParams.pageId);
                        break;
                      case "crop":
                        $state.go('app.crop', {
                          type: 'bg',
                          pageId: $stateParams.pageId
                        });
                        break;
                      default:
                        return;
                    }

                    if (!$rootScope.$$phase) {
                      $scope.$apply();
                    }
                    if (key == 'paste') {
                      afterPaste();
                    }
                    if (key == 'recovery') {
                      afterRecover();
                    }
                  },
                  events: {
                    show: function(opt) {
                      var _copy = docService.getCopyObj()
                      if (!_copy || (_copy.type != 'element' && _copy.type != 'elements')) {
                        opt.items.paste.$node.addClass('has-disable');
                      } else {
                        opt.items.paste.$node.removeClass('has-disable');
                      }
                      //if (!docService.hasRecoveryElement()) {
                      //  opt.items.recovery.$node.addClass('has-disable');
                      //} else {
                      //  opt.items.recovery.$node.removeClass('has-disable');
                      //}
                    }
                  },
                  animation: {
                    duration: 100,
                    show: "fadeIn",
                    hide: "fadeOut"
                  },
                  items: {
                    "paste": {name: "粘贴 ( Ctrl + V )"},
                    "crop": {name: "裁剪背景"}
                    //"recovery": {name: "撤销 ( Ctrl + Z )"}
                  }
                });
              };
              $scope.disableMenu = function() {
                $scope.page.contextMenu('destroy');
              };

              var clickElement = function (e) {
                e.stopPropagation();

                if ($(this).hasClass('selected')) return false;

                var target = $(e.currentTarget);
                var previewTarget = $('.app-aside #' + target.attr('id'));
                var elementData = docService.getElement(target.attr('id'));
                var css = elementData.css;

                var d = Draggable.create(target, {
                  type: "top,left",
                  zIndexBoost: false,
                  bounds: '.edit_main',
                  onDragStart: function () {
                    Player.alignManager.init($scope.page, target);
                  },
                  onDrag: function () {
                    target.addClass('user-move');
                    var offset = Player.alignManager.align(target);
                    TweenLite.set(previewTarget, {css: {top: this.y + offset.y, left: this.x + offset.x}});
                    TweenLite.set(target, {css: {top: this.y + offset.y, left: this.x + offset.x}});
                    angular.extend(css, {top: this.y + offset.y, left: this.x + offset.x});
                    if (!$rootScope.$$phase) {
                      $scope.$digest();
                    }
                  },
                  onDragEnd: function () {
                    target.removeClass('user-move');
                    Player.alignManager.clear();
                    d[0].kill();

                    if (!$rootScope.$$phase) {
                      $scope.$digest();
                    }

                    switch (target.attr('type')) {
                      case 'text': // text
                        $state.go('app.edit.page.text',
                            {pageId: $stateParams.pageId, elementId: target.attr('id')});
                        break;
                      case 'image': // image
                        $state.go('app.edit.page.image',
                            {elementId: target.attr('id')});
                        break;
                      default:
                        return;
                    }
                  }
                });
                d[0].startDrag(e);

                // 由于禁止mousedown冒泡，这里程序触发blur事件
                $('.aside-wrap').find('input:focus').blur();
              };

              $scope.$on('ADD_TEXT', function (e) {
                var elem = docService.addElement($stateParams.pageId, 'text');
                setTimeout(function() {
                  $state.go('app.edit.page.text.property', {
                    elementId: elem.id
                  });
                }, 17);
              });
              $scope.$on('ADD_IMAGE', function (e) {
                // docService.addElement($stateParams.pageId, 'image');
                $state.go('app.gallery.common', {
                  type: 'image',
                  action: 'create',
                  pageId: $stateParams.pageId
                });
              });
              $scope.$on('ADD_MUSIC', function() {
                $state.go('app.edit.page.setting.bg');
                setTimeout(function() {
                  $state.go('app.music.library');
                }, 17);
              });
              $scope.isSaving = false;
              $scope.$on('ADD_PAGE', function () {
                $state.go('app.templates.common', {
                  type: 'templates',
                  pageId: $stateParams.pageId
                });
              });
              // 这里只对 执行代码的 keycode return false
              $(document).on('keydown.page', function (e) {
                var evt = e || window.event;
                var ctrlDown = evt.ctrlKey || evt.metaKey;
                var key = evt.keyCode;

                // 这里注意缩略图的聚焦使用的是 hidden input
                if (common.detectFormElement(e)) return;
                if (ctrlDown) {
                  switch (key) {
                    // paste
                    case 86:
                      docService.paste($stateParams.pageId, $rootScope.SELECT_PAGE);
                      break;
                    // save
                    case 83:
                      if (!$scope.isSaving) {
                        $scope.isSaving = true;
                        $scope.save(function() {
                          $scope.isSaving = false;
                        });
                      }
                      break;
                    default:
                      return;
                  }
                } else if (key == 8) {
                  common.changeBackspaceDefault(e);
                  return;
                } else {
                  return;
                }
                if (!$rootScope.$$phase) {
                  $scope.$apply();
                }
                if (ctrlDown && key == 86) {
                  afterPaste();
                }
                return false;
              });

              function afterPaste() {
                var copyObj = docService.getCopyObj();
                var current = docService.getCurrent();
                if (copyObj && copyObj.type == 'element') {
                  $state.go('app.edit.page.' + copyObj.content.type, {
                    pageId: $stateParams.pageId,
                    elementId: current.id
                  });
                }
                if (copyObj && copyObj.type == 'elements') {
                  multiselect.clearCurrent();
                  multiselect.select(current);

                  if ($state.current.name != 'app.edit.page.selected') {
                    $state.go('app.edit.page.selected');
                  } else {
                    $rootScope.$broadcast('clearStateBound');
                  }
                  setTimeout(function() {
                    $rootScope.$broadcast('onSelectReady', multiselect.getCurrent());
                  }, 17);
                }
              }
              function afterRecover() {
                var recoveryObj = docService.getRecoveryObj();
                if (recoveryObj) {
                  var recoveryElement = recoveryObj.element;

                  $state.go('app.edit.page.' + recoveryElement.type, {
                    pageId: recoveryObj.pageId,
                    elementId: recoveryElement.id
                  });
                }
              }

              $scope.$watchCollection('pageData.elements', function (newValue, oldValue) {
                if (!newValue || !oldValue) return;
                if (newValue === oldValue) return;
                if (newValue.length === oldValue.length) return;

                function arr_diff(a1, a2) {
                  var a = {}, diff = [];
                  for (var i = 0; i < a1.length; i++) {
                    a[a1[i].id] = a1[i];
                  }
                  for (var i = 0; i < a2.length; i++) {
                    if (a[a2[i].id]) delete a[a2[i].id];
                    else a[a2[i].id] = a2[i];
                  }
                  for (var k in a) {
                    diff.push(a[k]);
                  }
                  return diff;
                }

                // 元素增加
                if (newValue.length > oldValue.length) {
                  var addedElems = arr_diff(oldValue, newValue);
                  for(var i = 0; i < addedElems.length; i++) {
                    window.player.addElement($stateParams.pageId, addedElems[i]);
                    multiselect.add(addedElems[i]);
                  }
                }
                // 元素减少
                else {
                  var removedElems = arr_diff(newValue, oldValue);
                  for(var i = 0; i < removedElems.length; i++) {
                    player.wrapper.find("#" + removedElems[i].id).remove();
                    multiselect.remove(removedElems[i]);
                  }
                }
                // 通知缩略图刷新
                $rootScope.$broadcast('refreshPreview', $stateParams.pageId);
                // 刷新时间监听
                $scope.disableMove();
                $scope.enableMove();
                $scope.disableMenu();
                $scope.enableMenu();
              });

              $scope.$on('$destroy', function () {
                $('.app-aside #' + $stateParams.pageId).closest('li').removeClass('active');
                $scope.disableMove();
                $scope.disableMenu();
                $('.edit_main').off('mousedown.page');
                $scope.page.removeClass('current');
                $(document).off('keydown.page');
                multiselect.disable();
              });
            }]
        }
      }
    })
  }
]);
