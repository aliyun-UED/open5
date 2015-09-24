var IFRAME_HTML_CONTENT = (function() {
  var strVar="";
  strVar += "<style>";
  strVar += "      body{";
  strVar += "        margin:0;";
  strVar += "      }";
  strVar += "      .color-input {";
  strVar += "         width: 100%;";
  strVar += "          -webkit-appearance: none;";
  strVar += "          -webkit-box-shadow: rgba(0, 0, 0, 0.0745098) 0px 1px 1px 0px inset;";
  strVar += "          -webkit-rtl-ordering: logical;";
  strVar += "          -webkit-transition-delay: 0s, 0s;";
  strVar += "          -webkit-transition-duration: 0.15s, 0.15s;";
  strVar += "          -webkit-transition-property: border-color, box-shadow;";
  strVar += "          -webkit-transition-timing-function: ease-in-out, ease-in-out;";
  strVar += "          -webkit-user-select: text;";
  strVar += "          -webkit-writing-mode: horizontal-tb;";
  strVar += "          background-color: rgb(255, 255, 255);";
  strVar += "          background-image: none;";
  strVar += "          border-bottom-color: rgb(204, 204, 204);";
  strVar += "          border-bottom-left-radius: 3px;";
  strVar += "          border-bottom-right-radius: 3px;";
  strVar += "          border-bottom-style: solid;";
  strVar += "          border-bottom-width: 1px;";
  strVar += "          border-image-outset: 0px;";
  strVar += "          border-image-repeat: stretch;";
  strVar += "          border-image-slice: 100%;";
  strVar += "          border-image-source: none;";
  strVar += "          border-image-width: 1;";
  strVar += "          border-left-color: rgb(204, 204, 204);";
  strVar += "          border-left-style: solid;";
  strVar += "          border-left-width: 1px;";
  strVar += "          border-right-color: rgb(204, 204, 204);";
  strVar += "          border-right-style: solid;";
  strVar += "          border-right-width: 1px;";
  strVar += "          border-top-color: rgb(204, 204, 204);";
  strVar += "          border-top-left-radius: 3px;";
  strVar += "          border-top-right-radius: 3px;";
  strVar += "          border-top-style: solid;";
  strVar += "          border-top-width: 1px;";
  strVar += "          box-shadow: rgba(0, 0, 0, 0.0745098) 0px 1px 1px 0px inset;";
  strVar += "          box-sizing: border-box;";
  strVar += "          color: rgb(85, 85, 85);";
  strVar += "          cursor: auto;";
  strVar += "          display: block;";
  strVar += "          font-family: 'Microsoft YaHei', 微软雅黑, MicrosoftJhengHei, 华文细黑, STHeiti, MingLiu;";
  strVar += "          font-size: 14px;";
  strVar += "          font-stretch: normal;";
  strVar += "          font-style: normal;";
  strVar += "          font-variant: normal;";
  strVar += "          font-weight: normal;";
  strVar += "          height: 34px;";
  strVar += "          letter-spacing: normal;";
  strVar += "          line-height: 21px;";
  strVar += "          margin-bottom: 0px;";
  strVar += "          margin-left: 0px;";
  strVar += "          margin-right: 0px;";
  strVar += "          margin-top: 0px;";
  strVar += "          padding-bottom: 5px;";
  strVar += "          padding-left: 38px;";
  strVar += "          padding-right: 3px;";
  strVar += "          padding-top: 5px;";
  strVar += "          text-align: start;";
  strVar += "          text-indent: 0px;";
  strVar += "          text-shadow: none;";
  strVar += "          text-transform: none;";
  strVar += "          word-spacing: 0px;";
  strVar += "          writing-mode: lr-tb;";
  strVar += "      }";
  strVar += "      .color-input:focus {";
  strVar += "        border: 1px solid #23b7e5;";
  strVar += "        -webkit-box-shadow: none;";
  strVar += "        box-shadow: none;";
  strVar += "        outline: none;";
  strVar += "      }";
  strVar += "  <\/style>  ";
  strVar += "  <input class=\"color-input\" spellcheck=\"false\" id=\"iframe-input\">";
  strVar += "  <script type=\"text\/javascript\">";
  strVar += "    if (window.document.domain.indexOf('open5.net') > -1) {";
  strVar += "      window.document.domain = 'open5.net';";
  strVar += "    }";
  strVar += "  <\/script>";
  return strVar;
})();

angular.module('ui.colorpicker', []).directive('inputColorpicker', ['$rootScope' ,function($rootScope) {
  return {
    restrict: 'EA',
    replace: false,
    require: '?ngModel',
    scope: {
      ngModel: '=',
      onChange: '&',
      onMove: '&',
      onHide: '&'
    },
    template: "<input class='h5-picker' type='text'/><input spellcheck='false' class='form-control h5-input' />",
    link: function($scope, element, attrs, ctrl) {
      if (!ctrl) return;
      var ngModelCtrl = ctrl;
      var $element = $(element).find('.h5-picker');
      var $input = $(element).find('.h5-input');

      $element.spectrum({
        showAlpha: true,
        allowEmpty:true,
        preferredFormat: 'rgb',
        chooseText: "选择",
        cancelText: "取消",
        hide: function(color) {
          var value;
          if (!color) {
            $element.val('transparent');
            ngModelCtrl.$setViewValue('transparent');
          } else {
            value = color.toRgbString();
            ngModelCtrl.$setViewValue(value);
          }
          if (typeof $scope.onHide == 'function') {
            $scope.onHide(color || 'transparent');
          }
          if (!color) {
            $input.val('');
          }
        },
        change: function(color) {
          if (!color) {
            $element.val('transparent');
          }
          if (typeof $scope.onChange == 'function') {
            $scope.onChange(color || 'transparent');
          }
        },
        move: setValue
      });
      if ($scope.ngModel == 'transparent' || !$scope.ngModel) {
        $input.val('');
      } else {
        $input.val($scope.ngModel);
      }

      $input.on('keydown', function(e) {
        var evt = e || window.event;
        if (evt.keyCode == 13) {
          var colorString = $(this).val();
          $element.spectrum('set', colorString);
          var color = $element.spectrum('get');
          setValue(color);
        }
      });

      function setValue(color) {
        var value;
        if (!color) {
          value = 'transparent';
        } else {
          value = color.toRgbString();
        }
        ngModelCtrl.$setViewValue(value);
        if (typeof $scope.onMove == 'function') {
          $scope.onMove(value);
        }
        $input.val(value);
      }
      $scope.$watch('ngModel', function(value, oldValue) {
        if (value == 'rgb(255, 255, 255)' || value == 'transparent') {
          value = null;
        }
        $element.spectrum('set', value);
      });
      $scope.$on('$destroy', function() {
        $element.spectrum('destroy');
      });
    }
  }
}]).directive('iframeColorpicker', ['$rootScope', function($rootScope) {
  return {
    restrict: 'EA',
    replace: false,
    require: '?ngModel',
    scope: {
      ngModel: '=',
      onChange: '&',
      onMove: '&',
      onHide: '&',
      iframeUrl: '@'
    },
    template: "<input type='text'/><iframe scrolling='no' frameborder='0' id='textBg'></iframe>",
    link: function($scope, element, attrs, ctrl) {
      if (!ctrl) return;
      var ngModelCtrl = ctrl;
      var $iframeContent;
      var $iframeInput;
      var $element = $(element).find('input');
      var $iframe = $(element).find('iframe');

      $element.spectrum({
        showAlpha: true,
        allowEmpty:true,
        preferredFormat: 'hex',
        chooseText: "选择",
        cancelText: "取消",
        hide: function(color) {
          var value;
          if (!color) {
            $element.val('transparent');
            ngModelCtrl.$setViewValue('transparent');
          } else {
            value = color.toRgbString();
            ngModelCtrl.$setViewValue(value);
          }
          if (typeof $scope.onHide == 'function') {
            $scope.onHide(color || 'transparent');
          }
          if ($iframeInput && !color) {
            $iframeInput.val('');
          }
        },
        change: function(color) {
          if (!color) {
            $element.val('transparent');
          }
          if (typeof $scope.onChange == 'function') {
            $scope.onChange(color || 'transparent');
          }
        },
        move: setValue
      });

      // dataurl 不可以 protocol 不匹配
      // http://stackoverflow.com/questions/5050380/set-innerhtml-of-an-iframe
      $iframe[0].contentDocument.write(IFRAME_HTML_CONTENT);
      $iframe[0].contentDocument.close();

      $iframe.on('load', function() {
        $iframeContent = $iframe.contents();
        $iframeInput = $iframeContent.find('input');
        $iframeInput.val($element.spectrum('get'));

        $iframeInput.on('keydown', function(e) {
          var evt = e || window.event;
          if (evt.keyCode == 13) {
            var colorString = $(this).val();
            $element.spectrum('set', colorString);
            var color = $element.spectrum('get');
            setValue(color);
          }
        }).on('focus', function() {
          $element.closest('.edit_panel').click();
        });
      });
      function setValue(color) {
        var value;
        if (!color) {
          value = 'transparent';
        } else {
          value = color.toRgbString();
        }
        ngModelCtrl.$setViewValue(value);
        if (typeof $scope.onMove == 'function') {
          $scope.onMove(value);
        }
        if ($iframeInput) {
          $iframeInput.val(color || '');
        }
      }
      $scope.$watch('ngModel', function(value, oldValue) {
        if (value == 'rgb(255, 255, 255)' || value == 'transparent') {
          value = null;
        }
        $element.spectrum('set', value);
      });
      $scope.$on('$destroy', function() {
        $element.spectrum('destroy');
      });

    }
  }
}]);