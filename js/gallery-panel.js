var app = angular.module('app');
app.controller('gallery-panel',
    ['$scope', '$modalInstance', 'items', '$previousState', '$state', '$stateParams', 'docService', 'ossService', '$rootScope', 'common',
      function ($scope, $modalInstance, items, $previousState, $state, $stateParams, docService, ossService, $rootScope, common) {
        var isPublic = $state.includes('app.gallery.common') ? true : false;
        var method;
        var host;
        var path;
        var type;

        if ($stateParams.type == 'background') {
          method = ossService.getBgList;
          type = 'bg';
        }
        else if ($stateParams.type == 'image') {
          method = ossService.getImageList;
          type = 'image';
        }
        method(isPublic).then(function (list) {
          var images = [];
          angular.forEach(list.list, function (item) {
            var config;
            if(isPublic) {
              config = window.appConfig.public[type];
            }
            else {
              config = window.appConfig.user[type];
            }
            images.push({
              url: config.host + '/' + config.path + '/' + item.id
            });
          });
          $scope.images = images;
          $scope.tags = list.property.tags;
          $scope.property = list.property;
        });

        $scope.ok = function () {
          $modalInstance.close();
          $previousState.go("modalInvoker");
        };
        $scope.cancel = function () {
          $modalInstance.dismiss();
          $previousState.go("modalInvoker");
        };
        $scope.add = function () {
          $scope.store.loading = true;
          setImage($scope.store.cropImage, function () {
            $scope.store.loading = false;
            $scope.ok();
            $scope.$digest();
          });
        };
        $scope.cropToAdd = function () {
          $scope.store.loading = true;
          // mock code
          setTimeout(function () {
            $scope.store.loading = false;
            $scope.$digest();
          }, 3000);
        };
        $scope.directToMy = function () {
          $state.go('app.gallery.my');
        };
        $scope.$on("$stateChangeStart", function (evt, toState) {
          if (!toState.$$state().includes['app.gallery']) {
            $modalInstance.dismiss('close');
          }
          $scope.drop();
        });

        $scope.del = function (item) {
          var index = $scope.images.indexOf(item);
          $scope.images.splice(index, 1);
          // ossService.delFiles()
        }

        $scope.myPhoto = [
          {
            _id: "55854b6bcb3c563744581499",
            category: "static",
            createdTime: "2015-06-20 19:15:55",
            name: "20150329-DSC_0650.jpg",
            status: 30,
            url: 'images/paint.png'
          },
          {
            _id: "55854b6bcb3c563744581499",
            category: "static",
            createdTime: "2015-06-20 19:15:55",
            name: "20150329-DSC_0650.jpg",
            status: 30,
            url: 'images/finger.png'
          }
        ];
        $scope.choose = function (img) {
          $scope.images.map(function (item) {
            item.active = false;
          });
          img.active = true;
          $scope.store.cropImage = img.url;
          $('.tab-content').addClass('croping');
          $('.crop-panel').addClass('active');
        };
        $scope.drop = function () {
          $scope.images.map(function (item) {
            item.active = false;
          });
          $('.tab-content').removeClass('croping');
          $('.crop-panel').removeClass('active');
        };
        $scope.store = {};
        $scope.store.cropImage = null;
        $scope.store.loading = false;

        function setImage(url, cb) {
          var type = $stateParams.type;
          if (type == 'image') {
            var id = $stateParams.elementId;
            // var viewImg = $('#player #' + id);
            // var thumbImg = $('#sortContainer #' + id);
            // viewImg.find('img').prop('src', url);
            // thumbImg.find('img').prop('src', url);

            var elementData = docService.getElement($stateParams.elementId);
            elementData.content = url;
            common.calImageSize(url, function (size) {
              elementData.css.width = size.width;
              elementData.css.height = size.height;
              if (typeof cb == 'function') cb();
            });
          } else {
            var pageId = $stateParams.pageId;
            var page = docService.getPage(pageId);
            page.background.input.image = url ? 'url(' + url + ')' : '';
            if (typeof cb == 'function') cb();
          }
        }

      }]);
app.controller('galleryController', ['$scope', 'ossService', '$state', '$stateParams',
  function ($scope, ossService, $state, $stateParams) {
    var isPublic = $state.includes('app.gallery.common') ? true : false;

    $scope.vm = {};
    $scope.vm.myPhoto = $scope.myPhoto;
    $scope.del = function (item) {
      var index = vm.myPhoto.indexOf(item);
      vm.myPhoto.splice(index, 1);
      // 删除服务器数据
    };
    $scope.choose = function (img) {
      if (img.status != 30) return;
      $scope.vm.myPhoto.map(function (item) {
        item.active = false;
      });
      img.active = true;
      $scope.store.cropImage = img.url;
      $('.tab-content').addClass('croping');
      $('.crop-panel').addClass('active');
    };

    $scope.addTag = function () {
      var tag = window.prompt("请输入标签名");
      for (var i = 0; i < $scope.tags; i++) {
        var t = $scope.tags[i];
        if (t.name == tag) {
          alert('标签重复');
          return;
        }
      }

      $scope.property.latestTag += 1;

      $scope.tags.push({
        id: $scope.property.latestTag,
        name: tag
      });

      ossService.uploadPageList(isPublic);
    };

    $scope.deleteTag = function (tagId) {
      for (var i = 0; i < $scope.tags.length; i++) {
        var t = $scope.tags[i];
        if (t.id == tagId) {
          $scope.tags.splice(i, 1);
        }
      }

      ossService.uploadPageList(isPublic);
    };

  }]);