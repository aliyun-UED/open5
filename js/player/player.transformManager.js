(function () {
  window.Player.initTransformManager = function(player) {
    var _proxy;
    var _onUpdate;
    var _target;

    var getRotation = function() {
      if(!_target[0]._gsTransform)
        return 0;
      return _target[0]._gsTransform.rotation;
    };

    var getMouseOffset = function(x, y) {
      return {
        k: -y,
        j: x
      }
    };

    var sin = function(angle) {
      return Math.sin(angle / 180 * Math.PI);
    };
    var cos = function(angle) {
      return Math.cos(angle / 180 * Math.PI);
    };
    var tan = function(angle) {
      return Math.tan(angle / 180 * Math.PI);
    };
    var atan = function(value) {
      return Math.atan(value) / Math.PI * 180;
    };

    var polar2xy = function(r, theta, x0, y0) {
      return {
        x: r * cos(theta) + x0,
        y: r * sin(theta) + y0
      }
    };

    var xy2polar = function(x, y, x0, y0) {
      var r = Math.sqrt(Math.pow(x - x0, 2) + Math.pow(y - y0, 2));
      var theta;
      if(x == x0) {
        if(y > y0) {
          theta = 90;
        }
        else if(y < y0) {
          theta = 270;
        }
        else {
          theta = 0;
        }
      }
      else if(x > x0) {
        theta = atan((y - y0) / (x - x0));
      }
      else {
        theta = 180 + atan((y - y0) / (x - x0));
      }
      return {
        r: r,
        theta: theta
      }
    };

    var getDistance = function(x0, y0, x1, y1) {
      return (Math.sqrt(x1 * x1 + y1 * y1) -  Math.sqrt(x0 * x0 + y0 * y0)) / 2;
    };

    var trans1 = function(x, y, x0, y0, x01, y01) {
      var result;
      result = xy2polar(x, y, x0, y0);
      var r1 = result.r;
      var theta1 = result.theta;
      result = polar2xy(r1, theta1 + getRotation(), x0, y0);
      var x2 = result.x;
      var y2 = result.y;
      result = xy2polar(x2, y2, x01, y01);
      var r2 = result.r;
      var theta2 = result.theta;
      return polar2xy(r2, theta2 - getRotation(), x01, y01);
    };

    var trans2 = function(x, y, x0, y0, r) {
      var result;
      result = xy2polar(x, y, x0, y0);
      var r1 = result.r;
      var theta1 = result.theta;
      var r2 = r1;
      var theta2 = theta1 + getRotation();
      var r3 = r2 + r;
      var theta3 = theta2;
      result = polar2xy(r, theta1 + getRotation() + 180, x0, y0);
      return polar2xy(r3, theta3 - getRotation(), result.x, result.y);
    };

    var disable = function () {
      if(!_target) return;

      _target.find('.scale').off();
      _target.find('.circle').off();
      $(document).off('keydown.operate');
      $(document).data('transform', false);
      _onUpdate = null;
      _target.find('.operate').remove();
    };

    var enable = function (target, onUpdate) {
      _target = target;
      _onUpdate = onUpdate;

      var _update = function (cssObject) {
        if (_onUpdate) {
          _onUpdate(cssObject);
        }
      };

      _target.append($('<div class="operate"><div class="border-line"></div><div class="proxy"></div><div class="rotate"><div class="circle" data-delta="rotate"><div class="circle-inner"></div></div><div class="line"></div></div><div class="scale scale-nw" direction="nw"></div><div class="scale scale-n" direction="n"></div><div class="scale scale-ne" direction="ne"></div><div class="scale scale-w" direction="w"></div><div class="scale scale-e" direction="e"></div><div class="scale scale-sw" direction="sw"></div><div class="scale scale-s" direction="s"></div><div class="scale scale-se" direction="se"></div></div>'));

      _proxy = _target.find('.proxy');

      $(document).on('keydown.operate', function (e) {
        var offsetX = 0;
        var offsetY = 0;
        switch (e.keyCode) {
          case 38:  // up
            if (e.shiftKey) {
              offsetY = -10;
            }
            else {
              offsetY = -1;
            }
            break;
          case 40:  // down
            if (e.shiftKey) {
              offsetY = 10;
            }
            else {
              offsetY = 1;
            }
            break;
          case 37:  // left
            if (e.shiftKey) {
              offsetX = -10;
            }
            else {
              offsetX = -1;
            }
            break;
          case 39:  // right
            if (e.shiftKey) {
              offsetX = 10;
            }
            else {
              offsetX = 1;
            }
            break;
          default:
            return;
        }

        _update({left: _target.position().left + offsetX, top: _target.position().top + offsetY});
      });

      // 在document上添加 transform 标识符
      $(document).data('transform', true);

      _target.find('.scale').on('mousedown', function (e) {
        e.stopPropagation();

        var top0;
        var left0;
        var height0;
        var width0;
        var paddingY;
        var paddingX;
        var x0;
        var y0;
        var r0;
        var theta0;
        var t = $(e.currentTarget);
        var type = t.attr('direction');

        var d = Draggable.create(_proxy, {
          type: "x,y",
          trigger: t,
          zIndexBoost: false,
          onDragStart: function (e) {
            // console.log('drag start');
            top0 = parseInt(_target.css('top'), 10);
            left0 = parseInt(_target.css('left'), 10);

            paddingY = parseInt(_target.css('padding-top')) + parseInt(_target.css('padding-bottom'));
            paddingX = parseInt(_target.css('padding-left')) + parseInt(_target.css('padding-right'));

            width0 = _target.width() + paddingX;
            height0 = _target.height() + paddingY;
            x0 = left0 + width0 / 2;
            y0 = top0 + height0 / 2;
          },
          onDrag: function () {
            // console.log('drag');
            var result;
            var mouseOffset = getMouseOffset(this.x, this.y);
            switch(type) {
              case 'n':
                var height1 = height0 + mouseOffset.k;
                var width1 = width0;
                var x01 = x0 + mouseOffset.k * sin(getRotation()) / 2;
                var y01 = y0 - mouseOffset.k * cos(getRotation()) / 2;
                var x5 = left0 + width0;
                var y5 = top0 + height0;
                result = trans1(x5, y5, x0, y0, x01, y01);
                var x52 = result.x;
                var y52 = result.y;
                var left1 = x52 - width1;
                var top1 = y52 - height1;
                break;
              case 's':
                var height1 = height0 - mouseOffset.k;
                var width1 = width0;
                var x01 = x0 + mouseOffset.k * sin(getRotation()) / 2;
                var y01 = y0 - mouseOffset.k * cos(getRotation()) / 2;
                var x1 = left0;
                var y1 = top0;
                result = trans1(x1, y1, x0, y0, x01, y01);
                var left1 = result.x;
                var top1 = result.y;
                break;
              case 'e':
                var height1 = height0;
                var width1 = width0 + mouseOffset.j;
                var x01 = x0 + mouseOffset.j * cos(getRotation()) / 2;
                var y01 = y0 + mouseOffset.j * sin(getRotation()) / 2;
                var x1 = left0;
                var y1 = top0;
                result = trans1(x1, y1, x0, y0, x01, y01);
                var left1 = result.x;
                var top1 = result.y;
                break;
              case 'w':
                var height1 = height0;
                var width1 = width0 - mouseOffset.j;
                var x01 = x0 + mouseOffset.j * cos(getRotation()) / 2;
                var y01 = y0 + mouseOffset.j * sin(getRotation()) / 2;
                var x5 = left0 + width0;
                var y5 = top0 + height0;
                result = trans1(x5, y5, x0, y0, x01, y01);
                var left1 = result.x - width1;
                var top1 = result.y - height1;
                break;
            }

            result = xy2polar(this.x, this.y, 0, 0);
            r0 = result.r;
            theta0 = result.theta;
            switch (type) {
              case 'nw':
                result = xy2polar(left0, top0, x0, y0);
                var r1 = result.r;
                var theta1 = result.theta;
                var ro = r0 * cos(theta1 - theta0);
                var height1 = height0 - ro * sin(theta1);
                var width1 = width0 - ro * cos(theta1);
                var x5 = left0 + width0;
                var y5 = top0 + height0;
                result = trans2(x5, y5, x0, y0, ro / 2);
                var left1 = result.x - width1;
                var top1 = result.y - height1;
                break;
              case 'ne':
                result = xy2polar(left0, top0, x0, y0);
                var r1 = result.r;
                var theta1 = 540 - result.theta;
                var ro = r0 * cos(theta1 - theta0);
                var height1 = height0 - ro * sin(theta1);
                var width1 = width0 + ro * cos(theta1);
                var x7 = left0;
                var y7 = top0 + height0;
                result = trans2(x7, y7, x0, y0, ro / 2);
                var left1 = result.x;
                var top1 = result.y - height1;
                break;
              case 'se':
                result = xy2polar(left0, top0, x0, y0);
                var r1 = result.r;
                var theta1 = result.theta - 180;
                var ro = r0 * cos(theta1 - theta0);
                var height1 = height0 + ro * sin(theta1);
                var width1 = width0 + ro * cos(theta1);
                var x1 = left0;
                var y1 = top0;
                result = trans2(x1, y1, x0, y0, ro / 2);
                var left1 = result.x;
                var top1 = result.y;
                break;
              case 'sw':
                result = xy2polar(left0, top0, x0, y0);
                var r1 = result.r;
                var theta1 = -result.theta;
                var ro = r0 * cos(theta1 - theta0);
                var height1 = height0 + ro * sin(theta1);
                var width1 = width0 - ro * cos(theta1);
                var x3 = left0 + width0;
                var y3 = top0;
                result = trans2(x3, y3, x0, y0, ro / 2);
                var left1 = result.x - width1;
                var top1 = result.y;
                break;
            }

            if(width1 <= 10 || height1 <= 10)
              return;

            _update({top: top1, left: left1, width: width1, height: height1});
          },
          onDragEnd: function () {
            TweenLite.set(_proxy, {css: {transform: ''}});
            d[0].kill();
          }
        });
        d[0].startDrag(e);
      });

      _target.find('.circle').on('mousedown', function (e) {
        e.stopPropagation();

        var d = Draggable.create(_target, {
          type: "rotation",
          zIndexBoost: false,
          trigger: _target.find('.circle'),
          onDragStart: function () {

          },
          onDrag: function () {
            _update({rotation: _target[0]._gsTransform.rotation});
          },
          onDragEnd: function () {
            d[0].kill();
          }
        });
        d[0].startDrag(e);
      });
    };

    $.extend(player, {
      transformManager: {
        enable: enable,
        disable: disable
      }
    });
  };

})();