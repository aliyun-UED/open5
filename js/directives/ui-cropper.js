angular.module('ui.cropper', []).directive('cropperWrap', function() {
  return {
    restrict: 'EA',
    controller: ['$scope', 'ossImageProcess', function($scope, ossImageProcess) {
      var ctrl = this;
      ctrl.init = function($cropperImage) {
        $scope.getData = function() {
          var data = $cropperImage.cropper('getData');
          $scope.cropData = angular.toJson(data);
          console.log(data);
          return data;
        };
        $scope.getZoomRatio = function() {
          var imageData = $cropperImage.cropper('getImageData');
          return Math.round(imageData.width / imageData.naturalWidth * 100);
        };
        $scope.setRatio = function(type) {
          if (type == '4:3') {
            $cropperImage.cropper('setAspectRatio', 4/3);
          }
          if (type == '16:9') {
            $cropperImage.cropper('setAspectRatio', 16/9);
          }
          if (type == '1:1') {
            $cropperImage.cropper('setAspectRatio', 1/1);
          }
          if (type == '2:3') {
            $cropperImage.cropper('setAspectRatio', 2/3);
          }
          if (type == 'free') {
            $cropperImage.cropper('setAspectRatio', NaN);
          }
        };
        $scope.zoom = function(type) {
          if (type == 'in') {
            $cropperImage.cropper('zoom', -0.1);
          } else {
            $cropperImage.cropper('zoom', 0.1);
          }
        };
        $scope.move = function(type) {
          if (type == 'left') {
            $cropperImage.cropper('move', -10, 0);
          }
          if (type == 'right') {
            $cropperImage.cropper('move', 10, 0);
          }
          if (type == 'top') {
            $cropperImage.cropper('move', 0, -10);
          }
          if (type == 'bottom') {
            $cropperImage.cropper('move', 0, 10);
          }
        };
        $scope.rotate = function(plus) {
          if (plus) {
            $cropperImage.cropper('rotate', 45);
          } else {
            $cropperImage.cropper('rotate', -45);
          }
        };
        $scope.flip = function(type) {
          if (type == 'vertical') {
            $cropperImage.cropper('scale', 1, -1);
          } else {
            $cropperImage.cropper('scale', -1, 1);
          }
        };
        $scope.crop = function() {
          $cropperImage.cropper('crop');
        };
        $scope.clear = function() {
          $cropperImage.cropper('clear');
        };
        $scope.store.generate = function() {
          var zoomRatio = $scope.getZoomRatio();
          var data = $scope.getData();
          var rotate;
          if (Math.round(data.rotate) % 360 < 0) {
            rotate = Math.round(data.rotate) % 360 + 360;
          } else {
            rotate = Math.round(data.rotate) % 360;
          }
          var ossString = ossImageProcess({
            scale: 100,
            rotate: rotate,
            x: Math.round(data.x),
            y: Math.round(data.y),
            width: Math.round(data.width),
            height: Math.round(data.height)
          });

          var url = $cropperImage.attr('src');
          if (/@/.test(url)) {
            var ret = url.replace(/@.*$/, '') + '@' + ossString;
          } else {
            var ret = url + '@' + ossString;
          }
          return {
            url: ret,
            width: Math.round(data.width),
            height: Math.round(data.height)
          };
        };
      };
    }]
  }
}).directive('cropper', ['ossImageProcess' , function(ossImageProcess) {
  return {
    restrict: 'EA',
    require: ['?ngModel', '^?cropperWrap'], // 注意需要是cropperWrap的控制器
    template: '<img class="crop-image" />',
    scope: {
      ngModel: '=',
      onBuilt: '&'
    },
    link: function($scope, element, attrs, ctrls) {
      var ngModelCtrl = ctrls[0];
      var wrapCtrl = ctrls[1];
      var $img = element.find('img');

      $img.attr('src', $scope.ngModel);
      $img.cropper({
        preview: '.crop-preview',
        guides: false,
        responsive: false,
        autoCropArea: 0.65,
        mouseWheelZoom: false
      });
      var start = Date.now();
      $img.on('built.cropper', function(e) {
        if (typeof $scope.onBuilt == 'function') $scope.onBuilt();
      });

      if (wrapCtrl) {
        wrapCtrl.init($img);
      }
      $scope.$watch('ngModel', function(newValue, oldValue) {
        if (newValue == oldValue) return;
        $img.cropper('replace', newValue);
      });
      $scope.$on('$destroy', function() {
        $img.cropper('destroy');
      });
    }
  }
}]);