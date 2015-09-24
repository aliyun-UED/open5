(function () {

  var testX = function(t, offset) {
    if(Math.abs(offset) <= snapTreshhold) {
      if(offsetX == 0) {
        offsetX = offset;
        renderGuide('x', t);
      }
      else {
        if(offsetX == offset) {
          renderGuide('x', t);
        }
      }
    }
  };

  var testY = function(t, offset) {
    if(Math.abs(offset) <= snapTreshhold) {
      if(offsetY == 0) {
        offsetY = offset;
        renderGuide('y', t);
      }
      else {
        if(offsetY == offset) {
          renderGuide('y', t);
        }
      }
    }
  };

  var renderGuide = function(axis, position, additionalClass){
    var className = 'axis-' + axis;
    if(additionalClass) className += " " + additionalClass;

    _page.append(
        $('<div class="guide">')
            .addClass(className)
            .css(axis === 'x' ? 'left' : 'top', position)
    );
  };

  var removeGuides = function(){
    _page.find('.guide:not(.static)').remove();
  };

  var alignX;
  var alignY;
  var targetWidth;
  var targetHeight;
  var snapTreshhold = 3;
  var _page;
  var _target;
  var offsetX = 0;
  var offsetY = 0;

  window.Player.alignManager = {
    init: function (page, target) {
      _page = page;
      _target = target;

      alignX = [0, player.width / 2, player.width];
      alignY = [0, player.height / 2, player.height];
      page.find('.element').each(function(index, elem) {
        elem = $(elem);
        if(elem.attr('id') == target.attr('id')) return;

        var pos = elem.position();
        var rect = elem[0].getBoundingClientRect();
        var width = rect.width;
        var height = rect.height;
        alignX.push(pos.left);
        alignX.push(pos.left + width / 2);
        alignX.push(pos.left + width);
        alignY.push(pos.top);
        alignY.push(pos.top + height / 2);
        alignY.push(pos.top + height);
      });
      // todo: 需要 ie9 以上浏览器
      var targetRect = target[0].getBoundingClientRect();
      targetWidth = targetRect.width;
      targetHeight = targetRect.height;
    },

    initMulti: function(page, targets) {
      _page = page;

      alignX = [0, player.width / 2, player.width];
      alignY = [0, player.height / 2, player.height];
      page.find('.element').each(function(index, elem) {
        elem = $(elem);
        if (include(targets, elem)) return;

        var pos = elem.position();
        var rect = elem[0].getBoundingClientRect();
        var width = rect.width;
        var height = rect.height;
        alignX.push(pos.left);
        alignX.push(pos.left + width / 2);
        alignX.push(pos.left + width);
        alignY.push(pos.top);
        alignY.push(pos.top + height / 2);
        alignY.push(pos.top + height);
      });

      var left, right, top, bottom;
      for (var i = 0; i < targets.length; i++) {

      }
      // todo: 需要 ie9 以上浏览器
      var targetsRect = getClientRect();
      targetWidth = targetsRect.width;
      targetHeight = targetsRect.height;

      return {
        top: targetsRect.top,
        left: targetsRect.left
      };

      function include(targets, elem) {
        for (var i = 0; i < targets.length; i++) {
          if ($(targets[i]).attr('id') == elem.attr('id')) return true;
        }
        return false;
      }
      function getClientRect() {
        var array = [];
        for (var i = 0; i < targets.length; i++) {
          array.push(targets[i].getBoundingClientRect());
        }
        var left_arr = [];
        array.map(function(item) {
          left_arr.push(item.left);
        });
        var left = Math.min.apply(null, left_arr);

        var top_arr = [];
        array.map(function(item) {
          top_arr.push(item.top);
        });
        var top = Math.min.apply(null, top_arr);

        var right_arr = [];
        array.map(function(item) {
          right_arr.push(item.left + item.width);
        });
        var right = Math.min.apply(null, right_arr);

        var bottom_arr = [];
        array.map(function(item) {
          bottom_arr.push(item.left + item.height);
        });
        var bottom = Math.min.apply(null, bottom_arr);

        return {
          width: right - left,
          height: bottom - top,
          top: top,
          left: left
        }
      }
    },

    clear: function() {
      removeGuides();
    },

    align: function(target) {
      removeGuides();

      offsetX = 0;
      offsetY = 0;

      var pos = target.position();
      for(var i = 0; i < alignX.length; i++) {
        var t = alignX[i];

        testX(t, t - pos.left);
        testX(t, t - (pos.left + targetWidth / 2));
        testX(t, t - (pos.left + targetWidth));
      }

      for(var i = 0; i < alignY.length; i++) {
        var t = alignY[i];

        testY(t, t - pos.top);
        testY(t, t - (pos.top + targetHeight / 2));
        testY(t, t - (pos.top + targetHeight));
      }

      return {
        x: offsetX,
        y: offsetY
      }
    },
    alignMulti: function(pos) {
      removeGuides();

      offsetX = 0;
      offsetY = 0;

      for(var i = 0; i < alignX.length; i++) {
        var t = alignX[i];

        testX(t, t - pos.left);
        testX(t, t - (pos.left + targetWidth / 2));
        testX(t, t - (pos.left + targetWidth));
      }

      for(var i = 0; i < alignY.length; i++) {
        var t = alignY[i];

        testY(t, t - pos.top);
        testY(t, t - (pos.top + targetHeight / 2));
        testY(t, t - (pos.top + targetHeight));
      }

      return {
        x: offsetX,
        y: offsetY
      }
    }

  };

})();