"use strict";

(function () {

  return;

  var theW = window.innerWidth;
  var theH = window.innerHeight;
  var colors = ["#7266ba", "#519ee1", "#5BC24C", "#F5B025", "#f05050"];

  var _running = false;
  var _count = 0;
  var _progress = 0;

  var _loader = window.player.wrapper.find(".loader");
  var _loaderCircle = _loader.find('.circle');

  var _run = function() {
    TweenLite.to(_loaderCircle, 1, {
      drawSVG: (_count % 2 == 0) ? "80%" :"20%",
      immediateRender: false,
      opacity: 1,
      ease: Power1.easeInOut,
      rotation: 380 * (_count + 1),
      transformOrigin: "50% 50%",
      stroke: colors[_count % colors.length],
      onComplete: function () {
        _count++;

        if(_running) {
          _run();
        }
      }
    });
  };

  _loader.css("top", (theH / 2 - 30) + 'px');
  _loader.css("left", (theW / 2 - 30) + 'px');

  TweenLite.set(_loaderCircle,
      {
        drawSVG: "0%",
        transformOrigin: "50% 50%"
      });

  window.player.loader = {
    // progress 从 0 到 100
    show: function(progress) {
      if(_running)
        return;
      _running = true;
      _loader.show();

      _run();
    },
    hide: function () {
      if(!_running)
        return;
      _running = false;

      TweenLite.to(_loaderCircle, 0.8, {
        immediateRender: false,
        opacity: 0,
        scaleX: 0,
        scaleY: 0,
        ease: Power3.easeIn,
        onComplete: function () {
          _loader.hide();
        }
      });
    },
    isRunning: function () {
      return _running;
    }
  };

})();
