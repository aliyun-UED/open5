"use strict";
angular.module('app').factory('docService', ['$http', '$q', 'toaster', '$state', '$timeout', '$rootScope', 'ossService',
  function ($http, $q, toaster, $state, $timeout, $rootScope, ossService) {
    var _docId = '';
    var _ready = false;
    var _doc = { pages: [] };

    var _pageHash = {};
    var _elementHash = {};

    var _copyObj;
    var _newElement;

    var _trash = [];
    var _trashItem;

    var uuid = function (size, chars) {
      size = size || 6;
      var code_string = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var max_num = code_string.length + 1;
      var new_pass = '';
      while (size > 0) {
        new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
        size--;
      }
      // querySelectorAll doesn't like digit id
      return "p" + new_pass;
    };

    var updateHash = function () {
      for (var i = 0; i < _doc.pages.length; i++) {
        var page = _doc.pages[i];
        _pageHash[page.id] = page;

        for (var j = 0; j < page.elements.length; j++) {
          var element = page.elements[j];
          _elementHash[element.id] = element;
        }
      }
    };

    var copyOperate = (function() {
      var cache = {};
      return {
        clear: function(id) {
          cache[id] = null
        },
        add: function(id, value) {
          var isCreatNew;
          if (cache[id]) {
            isCreatNew = copyOperate._isMoved(id) ? true : false;
          } else {
            isCreatNew = true;
          }
          if (isCreatNew) {
            var element = s.getElement(id);
            cache[id] = [];
            cache[id].push(value);
            cache[id]._origin = {
              top: element.css.top,
              left: element.css.left
            };
          } else {
            cache[id].push(value);
          }
        },
        _isMoved: function(id) {
          var element = s.getElement(id);
          var origin = cache[id]._origin;
          if (element.css.top != origin.top || element.css.left != origin.left) {
            copyOperate.clear(id);
            return true;
          } else {
            return false;
          }
        },
        getPosition: function(id) {
          var copys = cache[id];
          var origin = copys._origin;
          var offset = 8;
          var topLimit = 506 - offset;
          var leftLimit = 320 - offset;
          var length = copys.length;
          var index;
          // 最后一个为当前加入的元素，不遍历
          for (var i = 0; i < length - 1; i++) {
            var copy = copys[i];
            if (copy.css.top != topStep(i + 1) || copy.css.left != leftStep(i + 1) ) {
              index = i;
              break;
            }
          }
          if (index === undefined) {
            return {
              top: topStep(length),
              left: leftStep(length)
            };
          } else {
            // 保存位置从小到大
            var tmp = copys[index];
            copys[index] = copys[length - 1];
            copys[length - 1] = tmp;
            return {
              top: topStep(index + 1),
              left: leftStep(index + 1)
            };
          }

          function topStep(i) {
            var value = origin.top + i * offset;
            if (value > topLimit) {
              return topLimit;
            } else {
              return value;
            }
          }
          function leftStep(i) {
            var value = origin.left + i * offset;
            if (value > leftLimit) {
              return leftLimit;
            } else {
              return value;
            }
          }
        },
      }
    })();

    function getIndexModel(originElements) {
      var elements = originElements
      return elements.sort(function (a, b) {
        // 这里思考为何 直接 parseInt(a.css.zIndex) > parseInt(b.css.zIndex) 无法排序
        return parseInt(a.css.zIndex) > parseInt(b.css.zIndex) ? 1 : -1;
      });
    }
    function resetIndex(elements) {
      elements.map(function (item, index) {
        item.css.zIndex = index + 1;
      });
    }
    function resetLayersIndex(elements) {
      elements.map(function (item) {
        var id = item.id;
        $('#player #' + id).css({'zIndex': item.css.zIndex});
        $('.aside-wrap #' + id).css({'zIndex': item.css.zIndex});
      });
    }

    var s = {
      isReady: function () {
        return _ready;
      },
      load: function (docId) {
        var deferred = $q.defer();

        ossService.loadDoc(docId)
            .then(function (data) {
              _ready = true;
              _docId = docId;
              _doc = data;

              updateHash();

              deferred.resolve(data);
            }, function () {
              deferred.reject(1);
            });

        return deferred.promise;
      },
      save: function () {
        return ossService.saveDoc(s.getDoc(), _docId);
      },
      publish: function () {
        return ossService.publishDoc(s.getDoc(), _docId);
      },
      layerTop: function(elementId, pageId) {
        var pageData = s.getPage(pageId);
        var element = s.getElement(elementId);
        var elements = getIndexModel(pageData.elements);
        var eIndex = elements.indexOf(element);

        if (eIndex == elements.length - 1) return;
        var element = elements[eIndex];

        element.css.zIndex = elements.length;
        for (var i = eIndex + 1; i < elements.length; i++) {
          elements[i].css.zIndex = i;
        }
        for (var i = 0; i < eIndex; i++) {
          elements[i].css.zIndex = (i + 1);
        }

        resetLayersIndex(elements);
      },
      layerBottom: function(elementId, pageId) {
        var pageData = s.getPage(pageId);
        var element = s.getElement(elementId);
        var elements = getIndexModel(pageData.elements);
        var eIndex = elements.indexOf(element);

        console.log('layerBottom');

        if (eIndex == 0) return;
        element.css.zIndex = 1;
        for (var i = 0; i < eIndex; i++) {
          elements[i].css.zIndex = (i + 2);
        }
        for (var i = eIndex + 1; i < elements.length; i++) {
          elements[i].css.zIndex = (i + 1);
        }
        resetLayersIndex(elements);
      },
      layerUp: function(elementId, pageId) {
        var pageData = s.getPage(pageId);
        var element = s.getElement(elementId);
        var elements = getIndexModel(pageData.elements);
        var eIndex = elements.indexOf(element);

        if (eIndex == elements.length - 1) return;
        resetIndex(elements);
        element.css.zIndex = eIndex + 2;
        elements[eIndex + 1].css.zIndex = eIndex + 1;
        resetLayersIndex(elements);
      },
      layerDown: function(elementId, pageId) {
        var pageData = s.getPage(pageId);
        var element = s.getElement(elementId);
        var elements = getIndexModel(pageData.elements);
        var eIndex = elements.indexOf(element);

        if (eIndex == 0) return;
        resetIndex(elements);
        element.css.zIndex = eIndex;
        elements[eIndex - 1].css.zIndex = eIndex + 1;
        resetLayersIndex(elements);
      },

      directToDefault: function(params, page) {
        var pages = s.getPages();
        if (!page) page = pages[0];
        $state.go('app.edit.page', {
          docId: params.docId,
          pageId: page.id
        });
      },

      getDoc: function() {
        return _doc;
      },

      getPages: function () {
        return _doc.pages;
      },
      getProperties: function () {
        return _doc.properties;
      },
      getPage: function (pageId) {
        return _pageHash[pageId];
      },
      getElement: function (elementId) {
        return _elementHash[elementId];
      },

      // 复制操作
      getCopyObj: function() {
        return _copyObj;
      },
      getCurrent: function() {
        return _newElement;
      },
      getRecoveryObj: function() {
        return _trashItem;
      },
      // 统一入口
      copy: function(pageId, id) {
        _copyObj = null;
        if (Object.prototype.toString.call(id) == '[object Array]') {
          s.copyElements(pageId, id);
        } else if (!id) {
          s.copyPage(pageId);
        } else {
          s.copyElement(pageId, id);
        }
      },
      paste: function(pageId, focus_page) {
        if (!_copyObj) return;

        if (_copyObj.type == 'element') {
          s.pasteElement(pageId);
        } else if (_copyObj.type == 'elements') {
          s.pasteElements(pageId);
        } else if (_copyObj.type == 'page' && focus_page){
          s.pastePage(pageId);
        }
      },

      copyElement: function (pageId, elementId) {
        var page = s.getPage(pageId);
        if (!page) return false;

        var elem = s.getElement(elementId);
        if(!elem) return false;

        _copyObj = {
          type: 'element',
          content: jQuery.extend(true, {}, elem),
          source: pageId,
          op: 'copy'
        };

        return true;
      },
      cutElement: function (pageId, elementId) {
        var page = s.getPage(pageId);
        if (!page) return false;

        var elem = s.getElement(elementId);
        if(!elem) return false;

        _copyObj = {
          type: 'element',
          content: jQuery.extend(true, {}, elem),
          source: pageId,
          op: 'cut'
        };

        return s.deleteElement(pageId, elementId);
      },
      pasteElement: function (pageId) {
        if(!_copyObj || _copyObj.type != 'element') return false;

        var page = s.getPage(pageId);
        if (!page) return false;

        var _copiedElement = _copyObj.content;
        var elem = jQuery.extend(true, {}, _copiedElement);

        elem.id = uuid();
        var zIndex = 1;
        for (var i = 0; i < page.elements.length; i++) {
          var e = page.elements[i];
          if (e.css.zIndex && parseInt(e.css.zIndex, 10) >= zIndex) {
            zIndex = parseInt(e.css.zIndex, 10) + 1;
          }
        }
        copyOperate.add(_copiedElement.id, elem);
        var position;
        if (_copyObj.op == 'copy') {
          position = copyOperate.getPosition(_copiedElement.id);
        } else {
          position = {
            left: _copiedElement.css.left,
            top: _copiedElement.css.top
          };
        }
        angular.extend(elem.css, {
          zIndex: zIndex,
          left: position.left,
          top: position.top
        });

        page.elements.push(elem);
        _newElement = elem;
        updateHash();

        return true;
      },
      deleteElement: function (pageId, elementId) {
        var page = s.getPage(pageId);
        if (!page) return false;

        for (var i = 0; i < page.elements.length; i++) {
          var e = page.elements[i];
          if(e.id == elementId) {
            updateHash();
            _trash.push({
              type: 'delete',
              index: i,
              pageId: pageId,
              element: page.elements[i]
            });
            page.elements.splice(i, 1);
            return true;
          }
        }

        return false;
      },
      copyElements: function (pageId, elementIds) {
        var page = s.getPage(pageId);
        if (!page) return false;

        var _copiedElements = [];
        for (var i = 0; i < elementIds.length; i++) {
          var elem = s.getElement(elementIds[i]);
          _copiedElements.push(jQuery.extend(true, {}, elem));
        }

        _copyObj = {
          type: 'elements',
          content: _copiedElements,
          source: pageId,
          op: 'copy'
        };

        return true;
      },
      cutElements: function (pageId, elementIds) {
        var page = s.getPage(pageId);
        if (!page) return false;

        var _copiedElements = [];
        for (var i = 0; i < elementIds.length; i++) {
          var elem = s.getElement(elementId[i]);
          _copiedElements.push(jQuery.extend(true, {}, elem));
        }

        _copyObj = {
          type: 'element',
          content: _copiedElements,
          source: pageId,
          op: 'cut'
        };

        return s.deleteElements(pageId, elementIds);
      },
      pasteElements: function (pageId) {
        if(!_copyObj || _copyObj.type != 'elements') return false;

        var _copiedElements = _copyObj.content;
        var page = s.getPage(pageId);
        if (!page) return false;

        var array = jQuery.extend(true, [], _copiedElements);
        Array.prototype.sort.apply(array, function(a, b) {
          return a.css.zIndex > b.css.zIndex;
        });

        for (var i = 0; i < array.length; i++) {
          array[i].id = uuid();
        }

        var zIndex = 1;
        for (var i = 0; i < page.elements.length; i++) {
          var e = page.elements[i];
          if (e.css.zIndex && parseInt(e.css.zIndex, 10) >= zIndex) {
            zIndex = parseInt(e.css.zIndex, 10) + 1;
          }
        }
        // 直接设置偏移量
        var step = 8;
        for (var j = 0; j < array.length; j++) {
          var item = array[j], index = j;
          var position;
          if (_copyObj.op == 'copy') {
            position = {
              left: item.css.left + step,
              top: item.css.top + step
            };
          } else {
            position = {
              left: item.css.left,
              top: item.css.top
            };
          }
          angular.extend(item.css, {
            zIndex: zIndex + index,
            left: position.left,
            top: position.top
          });
          page.elements.push(item);
        }
        _newElement = array;
        updateHash();
        return true;
      },
      deleteElements: function (pageId, elementIds) {
        var page = s.getPage(pageId);
        if (!page) return false;

        var trash = [];
        for (var i = 0; i < page.elements.length; i++) {
          var e = page.elements[i];
          for (var j = 0; j < elementIds.length; j++) {
            if(e.id == elementIds[j]) {
              trash.push(e);
            }
          }
        }
        for (var k = 0; k < trash.length; k++) {
          var index = page.elements.indexOf(trash[k]);
          page.elements.splice(index, 1);
        }
        updateHash();
        return true;
      },
      recoverElement: function() {
        var op = _trash.pop();
        if (!op) return;
        if (op.type == 'delete') {
          var page = s.getPage(op.pageId);
          page.elements.push(op.element);
          _trashItem = op;
        }
      },
      addPage: function(pageData) {
        pageData.id = uuid();
        s.getPages().push(pageData);
        updateHash();
        setTimeout(function() {
          var $aside = $('.aside-wrap .navi-wrap');
          var $target = $aside.find('#' + pageData.id).closest('.tile');
          $aside.scrollTo($target);
          $state.go('app.edit.page.setting', {
            pageId: pageData.id
          })
        }, 17);
      },
      addEmptyPage: function() {
        var pageData = jQuery.extend(true, {}, window.config.defaultPageData);
        pageData.id = uuid();
        s.getPages().push(pageData);
        updateHash();
        setTimeout(function() {
          var $aside = $('.aside-wrap .navi-wrap');
          var $target = $aside.find('#' + pageData.id).closest('.tile');
          $aside.scrollTo($target);
          $state.go('app.edit.page.setting', {
            pageId: pageData.id
          })
        }, 17);
      },
      addElement: function(pageId, type) {
        var page = s.getPage(pageId);
        if (!page) return;
        var elem;
        switch(type) {
          case "text":
            elem = jQuery.extend(true, {}, window.config.defaultTextData);
            break;
          case "image":
            elem = jQuery.extend(true, {}, window.config.defaultImageData);
            break;
        }
        elem.id = uuid();
        // 获取到最大的zIndex
        var zIndex = 1;
        for (var i = 0; i < page.elements.length; i++) {
          var e = page.elements[i];
          if (e.css.zIndex && parseInt(e.css.zIndex, 10) >= zIndex) {
            zIndex = parseInt(e.css.zIndex, 10) + 1;
          }
        }
        angular.extend(elem.css, {
          zIndex: zIndex,
          left: (window.player.width - elem.css.width) / 2,
          top: (window.player.height - elem.css.height) / 2
        });

        page.elements.push(elem);
        updateHash();
        return elem;
      },
      // addElement使用的是默认数据，而createElement是选择某一元素后插入页面: 暂时支持图片
      // options.width options.height options.content
      createElement: function(pageId, options) {
        var page = s.getPage(pageId);
        if (!page) return;
        var elem = jQuery.extend(true, {}, window.config.defaultImageData);
        elem.id = uuid();
        elem.css.width = options.width;
        elem.css.height = options.height;
        elem.content = options.content;

        var zIndex = 1;
        for (var i = 0; i < page.elements.length; i++) {
          var e = page.elements[i];
          if (e.css.zIndex && parseInt(e.css.zIndex, 10) >= zIndex) {
            zIndex = parseInt(e.css.zIndex, 10) + 1;
          }
        }
        angular.extend(elem.css, {
          zIndex: zIndex,
          left: (window.player.width - elem.css.width) / 2,
          top: (window.player.height - elem.css.height) / 2
        });

        page.elements.push(elem);
        updateHash();

        return elem;
      },
      copyPage: function(pageId) {
        var page = s.getPage(pageId);
        if (!page) return false;
        _copyObj = {
          type: 'page',
          content: jQuery.extend(true, {}, page),
          source: pageId,
          op: 'copy'
        };
        return true;
      },
      pastePage: function() {
        if(!_copyObj || _copyObj.type != 'page') return false;
        var pages = s.getPages();
        var page = s.getPage(_copyObj.content.id);
        var index = pages.indexOf(page);
        console.log('insert index', index);
        // 如果源文件被删除，则无法粘贴
        if (index < 0) return;

        var newPage = jQuery.extend(true, {}, page);
        // 重新生成新的id
        newPage.id = uuid();
        // 插入到原来页面位置下方
        pages.splice(index + 1, 0, newPage);
        updateHash();
      },
      // page no allow to cut
      // cutPage: function(pageId) {
      //   var page = s.getPage(pageId);
      //   if (!page) return false;

      //   _copyObj = {
      //     type: 'page',
      //     content: jQuery.extend(true, {}, page),
      //     source: pageId,
      //     op: 'cut'
      //   };
      // },
      deletePage: function(pageId) {
        var page = s.getPage(pageId);
        if (!page) return false;
        var index = _doc.pages.indexOf(page);
        _trash.push({
          type: 'page-delete',
          index: index,
          pageId: pageId
        });
        _doc.pages.splice(index, 1);
        return true;
      },
    };
    s.uuid = uuid;

    return s;
  }
]);
