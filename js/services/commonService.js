angular.module('app').factory('pageLoading', function() {
  var $pageLoading = $('.page-loading');
  return {
    show: function() {
      $pageLoading.css({display: 'block'});
    },
    hide: function() {
      var transitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
      $pageLoading.css({opacity: 0}).one(transitionEnd, function() {
        $pageLoading.css({display: 'none'});
      });
    }
  }
}).factory('xssList', function() {
  var list = [];
  return {
    filterXSS: function(value) {
      return filterXSS(value);
    },
    escape: function(value) {
      return escape(value);
    },
    add: function(obj) {
      var hasAdded = false;
      list.map(function(item, index) {
        if (item.data == obj.data) {
          hasAdded = true;
        }
      });
      if (!hasAdded) {
        list.push(obj);
      }
    },
    xss: function() {
      list.map(function(item, index) {
        var value = item.data[item.key];
        item.data[item.key] = filterXSS(value);
      });
      list = [];
    }
  }
}).factory('common', function() {
  return {
    calImageSize: function(url, cb) {
      var img = new Image();
      img.src = url;
      img.onload = function() {
        var naturalWidth = img.naturalWidth;
        var naturalHeight = img.naturalHeight;
        var WIDTH = 126;
        var ratio = naturalHeight / naturalWidth;
        cb({
          width: WIDTH,
          height: ratio * WIDTH
        });
      }
    },
    getNaturalSize: function(element) {
      return {
        width: $(element)[0].naturalWidth,
        height: $(element)[0].naturalHeight
      }
    },
    changeBackspaceDefault: function(event) {
      var d = event.srcElement || event.target;
      var doPrevent = false;
      if ((d.tagName.toUpperCase() === 'INPUT' &&
        (
          d.type.toUpperCase() === 'TEXT' ||
          d.type.toUpperCase() === 'PASSWORD' ||
          d.type.toUpperCase() === 'FILE' ||
          d.type.toUpperCase() === 'EMAIL' ||
          d.type.toUpperCase() === 'SEARCH' ||
          d.type.toUpperCase() === 'DATE' )
        ) ||
        d.tagName.toUpperCase() === 'TEXTAREA') {
        doPrevent = d.readOnly || d.disabled;
      } else {
        doPrevent = true;
      }
      if (doPrevent) {
        event.preventDefault();
      }
    },
    detectFormElement: function(event) {
      var d = event.srcElement || event.target;
      var isFormElement;

      if ((d.tagName.toUpperCase() === 'INPUT' &&
        (
          d.type.toUpperCase() === 'TEXT' ||
          d.type.toUpperCase() === 'PASSWORD' ||
          d.type.toUpperCase() === 'FILE' ||
          // email 约定用作 边栏 元素聚焦使用
          // d.type.toUpperCase() === 'EMAIL' ||
          d.type.toUpperCase() === 'SEARCH' ||
          d.type.toUpperCase() === 'DATE' )
        ) ||
        d.tagName.toUpperCase() === 'TEXTAREA') {
        isFormElement = true;
      } else {
        isFormElement = false;
      }
      return isFormElement;
    }
  }
}).factory('multiselect', function() {
  var _$selector, _$elements, _$selected;
  var _onSelected, _onComplete;
  var cache = [];
  return {
    init: function(selector, onSelected, onComplete) {
      var $selector = $(selector);
      _$selector = $selector;
      _onSelected = onSelected;
      _onComplete = onComplete;

      var options = {
        distance: 2
      };
      // 如何处理 禁用鼠标右键
      $selector.on('dragstart', options, function(ev, dd) {
        cache = [];
        return $('<div class="drag-selection" />').css({
          position: 'fixed',
          zIndex: 1000
        }).appendTo(document.body);
      }).on('drag', function(ev, dd) {
        $(dd.proxy).css({
          top: Math.min(ev.clientY, dd.startY),
          left: Math.min(ev.clientX, dd.startX),
          height: Math.abs(ev.clientY - dd.startY),
          width: Math.abs(ev.clientX - dd.startX)
        });
      }).on('dragend', function(ev, dd) {
        $(dd.proxy).remove();
        if (typeof onComplete == 'function') onComplete(cache);
      });

      $selector.find('.element').on('dropstart', function(event, dd) {
        $(this).addClass("mock-selected");
        cache.push(this);
        if (typeof onSelected == 'function') onSelected();
      }).on('dropend', function(event, dd) {
        $(this).removeClass('mock-selected');
        var index = cache.indexOf(this);
        cache.splice(index, 1);
        if (typeof onSelected == 'function') onSelected();
      }).on('drop', function(event, dd) {
        $(this).addClass('selected');
        cache.push(this);
      });

      $.drop({multi: true});
    },
    select: function(items) {
      if (!items) return;
      items.map(function(item) {
        var $item = $('#player #' + item.id);
        $item.addClass('selected');
        cache.push($item[0]);
      });
    },
    add: function(data) {
      var $element = _$selector.find('#' + data.id);
      $element.on('dropstart', function(event, dd) {
        $(this).addClass("mock-selected");
        cache.push(this);
        if (typeof _onSelected == 'function') _onSelected();
      }).on('dropend', function(event, dd) {
        $(this).removeClass('mock-selected');
        var index = cache.indexOf(this);
        cache.splice(index, 1);
        if (typeof _onSelected == 'function') _onSelected();
      }).on('drop', function(event, dd) {
        $(this).addClass('selected');
        cache.push(this);
      });
    },
    remove: function(data) {
      var $element = _$selector.find('#' + data.id);
      $element.off('drop dropstart dragend');
    },
    disable: function() {
      _$selector.off('drag dragstart dragend');
      _$selector.find('.element').off('drop dropstart dropend');
    },
    getCurrent: function() {
      return cache;
    },
    clearCurrent: function() {
      cache = [];
      _$selector && _$selector.find('.element').removeClass('selected');
    }
  }
}).factory('align', function() {
  function getMin(data, type) {
    var ret = [];
    for (var i = 0; i < data.length; i++) {
      ret.push(data[i].css[type]);
    }
    return Math.min.apply(null, ret);
  }
  function setCSS(id, css) {
    $('#player #' + id).css(css);
    $('.app-aside #' + id).css(css);
  }
  return {
    left: function(data) {
      var left = getMin(data, 'left');
      for (var i = 0; i < data.length; i++) {
        data[i].css.left = left;
        setCSS(data[i].id, { left: left });
      }
    },
    top: function(data) {
      var top = getMin(data, 'top');
      for (var i = 0; i < data.length; i++) {
        data[i].css.top = top;
        setCSS(data[i].id, { top: top });
      }
    },
    right: function(data) {
      var rightData = [];
      for (var i = 0; i < data.length; i++) {
        rightData.push(parseInt(data[i].css.left) + parseInt(data[i].css.width));
      }
      var left = Math.max.apply(null, rightData);
      for (var i = 0; i < data.length; i++) {
        data[i].css.left = left - parseInt(data[i].css.width);
        setCSS(data[i].id, { left: left - parseInt(data[i].css.width) });
      }
    },
    bottom: function(data) {
      var bottomData = [];
      for (var i = 0; i < data.length; i++) {
        bottomData.push(parseInt(data[i].css.top) + parseInt(data[i].css.height));
      }
      var top = Math.max.apply(null, bottomData);
      for (var i = 0; i < data.length; i++) {
        data[i].css.top = top - parseInt(data[i].css.height);
        setCSS(data[i].id, { top: top - parseInt(data[i].css.height) });
      }
    },
    // 水平居中
    center: function(data) {
      var left = getMin(data, 'left');
      var rightData = [];
      for (var i = 0; i < data.length; i++) {
        rightData.push(parseInt(data[i].css.left) + parseInt(data[i].css.width));
      }
      var right = Math.max.apply(null, rightData);
      var center = right / 2 + left / 2;
      for (var i = 0; i < data.length; i++) {
        data[i].css.left = center - parseInt(data[i].css.width) / 2;
        setCSS(data[i].id, { left: center - parseInt(data[i].css.width) / 2 });
      }
    },
    // 垂直居中
    middle: function(data) {
      var top = getMin(data, 'top');
      var bottomData = [];
      for (var i = 0; i < data.length; i++) {
        bottomData.push(parseInt(data[i].css.top) + parseInt(data[i].css.height));
      }
      var bottom = Math.max.apply(null, bottomData);
      var center = top / 2 + bottom / 2;
      for (var i = 0; i < data.length; i++) {
        data[i].css.top = center - parseInt(data[i].css.height) / 2;
        setCSS(data[i].id, { top: center - parseInt(data[i].css.height) / 2 });
      }
    }
  }
}).factory('multidrag', function() {
  var companions, startX, startY;
  var Rect;
  var $element, $preview, _$target;
  var dragList = [];
  var d;
  return {
    enable: function(pageId, data, current) {
      var $target = $(current);
      _$target = $target;
      $target.on('mousedown.multi', function(e) {
        d = Draggable.create(this, {
          type: "top,left",
          zIndexBoost: false,
          bounds: '.edit_main',
          onPress: function() {
            companions = [];
            startX = this.x;
            startY = this.y;

            for (var i = 0; i < $target.length; i++) {
              if ($target[i] !== this.target) {
                var data = getData($target[i]);
                var obj = {
                  element: $target[i],
                  preview: $('.app-aside #' + $($target[i]).attr('id')),
                  data: data,
                  x: data.css.left,
                  y: data.css.top
                }
                companions.push(obj);
              }
            }
            $element = $(this.target);
            $preview = $('.app-aside #' + $(this.target).attr('id'));

            // kill animation
            TweenLite.killTweensOf($target);
          },
          onDragStart: function() {
            // Player.alignManager.initMulti($('#player #' + pageId), $target);
            Rect = getRectPos(data);
          },
          onDrag: function() {
            $target.addClass('user-move');
            // var offset = Player.alignManager.alignMulti(Rect);
            var css = {
              left: this.x,
              top: this.y
            };

            TweenLite.set($preview, {css: css});
            angular.extend(getData($element).css, css);
            updateCompanions.apply(this);
          },
          onDragEnd: function() {
            $target.removeClass('user-move');
            d[0].kill();
          }
        });
        d[0].startDrag(e);
      });
      function updateCompanions() {
        var deltaX = this.x - startX,
            deltaY = this.y - startY,
            companion;
        for (var i = 0; i < companions.length; i++) {
          companion = companions[i];
          var css = {
            top: companion.y + deltaY,
            left: companion.x + deltaX
          };

          TweenLite.set(companion.element, {css: css});
          TweenLite.set(companion.preview, {css: css});
          angular.extend(companion.data.css, css);
        }
      }
      function getRectPos(data) {
        var top_arr = [];
        for (var i = 0; i < data.length; i++) {
          top_arr.push(data[i].css.top);
        }
        var top = Math.min.apply(null, top_arr);

        var left_arr = [];
        for (var j = 0; j < data.length; j++) {
          left_arr.push(data[j].css.left);
        }
        var left = Math.min.apply(null, left_arr);

        return {
          top: top,
          left: left
        };
      }
      function getData(element) {
        var id = $(element).attr('id');
        var ret;
        data.map(function(item) {
          if (item.id == id) {
            ret = item;
          }
        });
        return ret;
      }
    },
    disable: function() {
      _$target && _$target.off('mousedown.multi');
    }
  }
}).factory('ossImageProcess', function() {
  var rotate = function(deg) {
    return deg + 'r';
  };
  // 0-0-100-100a
  var area = function(x, y, width, height) {
    return x + '-' + y + '-' + width + '-' + height + 'a';
  };
  var transform = function(data) {
    return rotate(data.rotate) + '|' + area(data.x, data.y, data.width, data.height) + '|506h_320w_0e';
  };
  return transform;
}).factory('selectionOp', function() {
  return function(element) {
    try {
        document.execCommand("MultipleSelection", null, true);
    } catch(ex) {}
    rangy.init();

    var savedSel = null;
    var highlighter = rangy.createHighlighter();
    highlighter.addClassApplier(rangy.createClassApplier("highlight", {
      ignoreWhiteSpace: true,
      tagNames: ["span", "a"]
    }));

    function highlightSelection() {
      highlighter.highlightSelection("highlight");
    }
    function removeHilight() {
      highlighter.unhighlightSelection();
    }
    function saveSelection() {
      // Remove markers for previously saved selection
      if (savedSel) {
        rangy.removeMarkers(savedSel);
      }
      savedSel = rangy.saveSelection();
      console.log('saved...', savedSel);
    }
    function restoreSelection() {
      if (savedSel) {
        console.log('restoreSelection ...')
        rangy.restoreSelection(savedSel, true);
        savedSel = null;
      }
    }

    element.on('focus.rangy', function() {
      // removeHilight();
      // restoreSelection();
      saveSelection();
    }).on('blur.rangy', function() {
      // saveSelection();
      highlightSelection();
    });

    return function() {
      element.off('focus.rangy').off('focus.rangy');
      $('input.sp-input').off('focus.current').off('blur.current');
    }
  }

  return function (size, chars) {
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
});