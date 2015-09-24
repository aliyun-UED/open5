"use strict";

(function() {

  function AnimateExcute(element, array, onComplete) {
    // 暂时不用改 这个 find
    this.wraper = element;
    this.element = $(element).find('.element-container');
    this.array = (function() {
      if (!array) return [];
      var animateArr = [];
      array.map(function(item) {
        if (item.type != 'none') {
          animateArr.push(item);
        }
      });
      return animateArr;
    })();
    this.onComplete = onComplete;
    this.paused = false;
    this.current = '';

    // 假如没有动画，将元素设置为可见
    // 所有元素都要经过动画函数处理
    if (!this.array || !this.array.length) {
      $(element).css({'visibility': 'visible'});
    }
  };
  AnimateExcute.prototype.play = function() {
    var array = $.extend(true, [], this.array);
    var animate = array.shift();
    var animateEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    var animateStart = 'webkitAnimationStart mozAnimationStart MSAnimationStart oanimationstart animationstart';
    var $element = $(this.element);
    var $wraper = $(this.wraper);
    var lastAnim = '';
    var self = this;

    function start(animate) {
      if (!animate) {
        if (typeof self.onComplete == 'function') {
          self.onComplete(self.current);
        }
        return;
      }
      if (animate.type == 'none') {
        // 如果动画为none的话，直接跳过执行下一个
        var nextAnimate = array.shift();
        start(nextAnimate);
        return;
      }
      run();
      function run() {
        // $element.addClass('anim_visible').removeClass(lastAnim);
        $element.removeClass(lastAnim);
        var name = animate.direction ? animate.direction : animate.type;
        var animClass = name + ' animated';
        var css = {
          '-webkit-animation-duration': animate.duration + 's',
          'animation-duration': animate.duration + 's',
          '-webkit-animation-delay': animate.delay + 's',
          'animation-delay': animate.delay + 's',
          '-webkit-animation-iteration-count': animate.repeat + '',
          'animation-iteration-count': animate.repeat + ''
        };

        //bug: CSS3动画delay的时候元素会显示出来
        //fix: 定义在css3 keyframe中的visibility属性，会表现出最高的优先级，
        //fix: 而delay的时候，元素其实已经设置成0%的状态，在里面设置visibility: visible
        //fix: 会覆盖 class内设置的值，!important也没有用，因此去掉animation.css 中 0% 时visibility:visible的赋值
        self.current = animClass;
        $element.css(css).addClass(animClass).one(animateStart, function() {
          $element.addClass('anim_visible');
        }).one(animateEnd, function() {
          lastAnim = animClass;
          var nextAnimate = array.shift();
          start(nextAnimate);
        });
      }
    }

    if (animate) {
      start(animate);
    }
  };
  AnimateExcute.prototype.resume = function() {
    this.element.css({
      '-webkit-animation-play-state': 'running',
      'animation-play-state': 'running'
    });
    this.paused = false;
  };
  AnimateExcute.prototype.reset = function() {
    this.resume();
    var $element = $(this.element);
    $element.removeClass(this.current);
    $element.removeClass('anim_visible');
  };
  AnimateExcute.prototype.pause = function() {
    this.element.css({
      '-webkit-animation-play-state': 'paused',
      'animation-play-state': 'paused'
    });
    this.paused = true;
  };

  window.Player.initPage = function(player) {
    var page = {
      constraintViewport: function (baseViewport, pageWidth, pageHeight) {
        var orignWH = baseViewport.width / baseViewport.height;
        var currentWH = pageWidth / pageHeight;
        var viewport;
        if(currentWH >= orignWH) {
          viewport = {
            top: 0,
            height: pageHeight,
            width: Math.round(orignWH * pageHeight)
          };
          viewport.left = (pageWidth - viewport.width) / 2;
          viewport.scale = viewport.width / baseViewport.width;
        }
        else {
          viewport = {
            height: Math.round(pageWidth / orignWH),
            left: 0,
            width: pageWidth
          };
          viewport.top = Math.round((pageHeight - viewport.height) / 2);
          viewport.scale = viewport.width / baseViewport.width;
        }
        return viewport;
      },
      build: function (pageData, pageWidth, pageHeight) {
        pageWidth = pageWidth || pageData.viewport.width;
        pageHeight = pageHeight || pageData.viewport.height;
        var constrainedViewport = page.constraintViewport(pageData.viewport, pageWidth, pageHeight);
        var pageHtml = "<div id='$id' class='$class' page-left='$pageLeft' page-right='$pageRight' page-top='$pageTop' page-bottom='$pageBottom' style='$pageStyle'><div class='page-bg'><div class='page-bg-inner $pageBgEffect' style='$pageBackground'></div></div><div class='viewport' style='$viewportStyle'>$elements</div></div>";
        pageHtml = pageHtml
          .replace("$id", pageData.id)
          .replace("$class", "page")
          .replace("$pageStyle", "width:" + pageWidth + "px; height:" + pageHeight + "px; " +  "; font-size:" + (pageData.viewport.fontSize * constrainedViewport.scale) + "px;")
          .replace("$viewportStyle", "width:" + constrainedViewport.width + "px; height:" + constrainedViewport.height + "px; top:" + constrainedViewport.top + "px; left:" + constrainedViewport.left + "px;")
          .replace("$turnType", pageData.turnType || "")
          .replace("$pageLeft", pageData.leftPageId || "")
          .replace("$pageRight", pageData.rightPageId || "")
          .replace("$pageTop", pageData.topPageId || "")
          .replace("$pageBottom", pageData.bottomPageId || "")
          .replace("$pageBackground", pageData.background.output)
          .replace("$pageBgEffect", makeBgEffectStr(pageData.effect))
          .replace("$elements", page.buildElements(pageData, constrainedViewport));

        return pageHtml;

        function makeBgEffectStr(effect) {
          if (effect && effect.name && effect.mode) {
            return effect.name + '-' + effect.mode;
          } else {
            return '';
          }
        }
      },
      buildElements: function(pageData, constrainedViewport) {
        // elements
        var elementsHtml = '';
        var elementIndex = pageData.elements.length;

        while (elementIndex--) {
          // elements
          var elementData = pageData.elements[elementIndex];
          elementsHtml += page.buildElement(elementData, constrainedViewport);
        }

        return elementsHtml;
      },
      buildElement: function (elementData, constrainedViewport) {
        var cssString = page.getCssString(elementData.css, constrainedViewport);
        var html = "<div class='element " + (elementData.theme || "theme-default") + "' type='$elementType' " + page.getIdString(elementData.id) + cssString.arrange + "><div class='element-container' " + cssString.style + "><div class='element-inner'><div class='element-content' spellcheck='false'>$elementContent</div></div></div></div>";
        var content = page.buildElementContent(elementData);

        return html.replace("$elementType", elementData.type).replace("$elementContent", content);
      },
      buildElementContent: function(elementData) {
        switch(elementData.type) {
          case "text":
            return page.buildText(elementData.content);
          case "image":
            return page.buildImage(elementData.content);
          case "input":
            return page.buildInput(elementData);
          case "submit":
            return page.buildSubmit(elementData);
          case "singleselect":
            return page.buildSingleSelect(elementData);
          case "multiselect":
            return page.buildMultiSelect(elementData);
          case "rating":
            return page.buildRating(elementData);
          default:
            return "";
        }
      },
      buildPageTimeline: function(pageData) {
        var tl = new TimelineLite({ paused: true });

        for(var i = 0; i < pageData.elements.length; i ++) {
          var t = page.buildElementTimeline(pageData.elements[i]);
          if(t) tl.add(t, 0);
        }

        return tl;
      },
      buildPageCss3Timeline: function (pageData) {
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
          var t = page.buildElementCss3Timeline(pageData.elements[i]);
          tl.list.push(t);
        }

        return tl;
      },
      buildElementCss3Timeline: function (elementData, onComplete) {
        var target = player.wrapper.find('#' + elementData.id);
        var animArray = elementData.animations || [];

        return new AnimateExcute(target, animArray, onComplete);
      },
      buildElementTimeline: function (elementData) {
        var animationsData = elementData.animations;
        if(!animationsData || !animationsData.length) return null;
        var target = player.wrapper.find('#' + elementData.id);

        var parseEase = function (string) {
          var easing = string.split(".");
          if (easing.length === 2) return window[easing[0]][easing[1]];
          var cfgExp = /true|false|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig;
          var config = string.match(cfgExp).map(JSON.parse);
          return window[easing[0]][easing[1]].config.apply(null, config);
        };

        var tl = new TimelineLite();

        for(var i = 0; i < animationsData.length; i++) {
          var anim = animationsData[i];
          if(!anim.tweens || !anim.tweens.length) continue;

          for(var j = 0; j < anim.tweens.length; j++) {
            var tween = anim.tweens[j];

            for(var k = 0; k < ((anim.repeat || 0) + 1); k++) {
              switch(tween.action) {
                case "from": // from
                  tl.from(target, tween.duration, { immediateRender: false, delay: tween.delay, css: tween.css, ease: parseEase(tween.ease) });
                  break;
                case "to":   // to
                  tl.to(target, tween.duration, { immediateRender: false, delay: tween.delay, css: tween.css, ease: tween.ease });
                  break;
                default:
                  continue;
              }
            }
          }
        }

        return tl;
      },
      buildText: function(data) {
        return data;
      },
      buildImage: function(data) {
        return "<img style='width:100%;height:100%;' src='" + data + "'>";
      },
      buildInput: function(data) {
        return "<textarea label='" + (data.label || "") + "' target='" + (data.target || "") + "' maxlength='" + (data.maxlength || 300) + "' placeholder='" + (data.placeholder || "") + "'></textarea>";
      },
      buildSubmit: function(data) {
        return "<button>" + (data.title || "") + "</button>";
      },
      buildSingleSelect: function(data) {
        var s = "<div class='radio-title'>" + (data.title || "") + "</div>";
        for(var i = 0; i < data.choices.length; i++) {
          var id = data.id + i;
          var name = 'group' + data.id;
          var value = data.choices[i].label || "";
          s += "<div class='options'><div class='option-group'><label class='option-label' for='" + id + "'><input id='" + id + "' class='option' type='radio' name='" + name + "' value='" + value + "'>" + value + "</label></div></div>";
        }
        return s;
      },
      buildMultiSelect: function(data) {
        var s = "<div class='radio-title'>" + (data.title || "") + "</div>";
        for(var i = 0; i < data.choices.length; i++) {
          var id = data.id + i;
          var value = data.choices[i].label || "";
          s += "<div class='options'><div class='option-group'><label class='option-label' for='" + id + "'><input class='option' id='" + id + "' type='checkbox' value='" + value + "'>" + value +"</label></div></div>";
        }
        return s;
      },
      buildRating: function(data) {
        return "<div class='rating-title'>" + (data.title || "") + "</div><div class='rating-icons'><i class='rating'></i><i class='rating'></i><i class='rating'></i><i class='rating'></i><i class='rating'></i></div>";
      },
      getCssString: function(cssObject, constrainedViewport) {
        var scale = 1;
        if(constrainedViewport && constrainedViewport.scale) {
          scale = constrainedViewport.scale;
        }
        if(!cssObject) return {
          style: '',
          arrange: ''
        };
        var styleCSS = '';
        var arrangeCSS = '';
        var camelToCaps = function (s) {
          if(!s) return s;
          return s.replace(/([A-Z])/g, "-$1").toLowerCase();
        };
        for (var i in cssObject) {
          if (Object.prototype.hasOwnProperty.call(cssObject, i)) {
            // filter top left widht height rotation zIndex
            if(i == "top" || i == "left" || i == "width" || i == "height") {
              arrangeCSS += i + ":" + (parseInt(cssObject[i], 10) * scale) + "px;";
            } else if (i == "rotation") {
              arrangeCSS += "transform:rotate(" + cssObject[i] + "deg);";
            } else if (i == "zIndex") {
              arrangeCSS += "z-index:" + cssObject[i] + ';';
            } else {
              styleCSS += camelToCaps(i) + ":" + cssObject[i] + ";";
            }
          }
        }
        return {
          style: " style='" + styleCSS + "' ",
          arrange: " style='" + arrangeCSS + "' "
        };
      },
      getIdString: function(id) {
        if(!id) return "";
        return " id='" + id + "' ";
      }
    };

    $.extend(player, {
      page: {
        build : page.build,
        buildPageTimeline: page.buildPageTimeline,
        buildElementTimeline: page.buildElementTimeline,
        buildPageCss3Timeline: page.buildPageCss3Timeline,
        buildElementCss3Timeline: page.buildElementCss3Timeline,
        buildElement: page.buildElement,
        buildElementContent: page.buildElementContent,
        AnimateExcute: AnimateExcute
      }
    });
  };

})();
