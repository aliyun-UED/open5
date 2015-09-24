'use strict';
angular.module('app').config(['$stateProvider', function ($stateProvider) {
  $stateProvider.state('app.music', {
    url: '/music',
    template: '<div ui-view></div>',
    params: {
      type: null,
      elementId: null
    },
    onEnter: showModal
  }).state('app.music.library', {
    url: '/library',
    views: {
      'tab@': {
        templateUrl: '/tpl/custom/music/library.html',
        controller: 'music-substate'
      }
    }
  }).state('app.music.my', {
    url: '/my',
    views: {
      'tab@': {
        templateUrl: '/tpl/custom/music/library.html',
        controller: 'music-substate'
      }
    }
  });
  function showModal($modal, $previousState, docService, $stateParams) {
    if (!$previousState.get()) {
      return docService.directToDefault($stateParams);
    }
    $previousState.memo("musicInvoker");
    var size = 'lg';
    $modal.open({
      animation: true,
      size: size,
      templateUrl: '/tpl/custom/music/index.html',
      controller: 'music-modal',
      // backdrop: 'static',
      windowClass: 'music-wrap',
      resolve: {
        items: function () {
          // 这里用来从服务端获取素材图片
          var items = {};
          return items;
        }
      }
    });
  }
  showModal.$inject = ["$modal", "$previousState", "docService", "$stateParams"];
}]);

angular.module('app').controller('music-modal', ['$scope', '$modalInstance', 'items', '$previousState', '$stateParams', '$rootScope', '$state', '$filter', 'ossService', function($scope, $modalInstance, items, $previousState, $stateParams, $rootScope, $state, $filter, ossService) {
  $scope.cancel = function() {
    $modalInstance.dismiss();
  };
  $scope.$on('modal.closing', function(event, isClose) {
    if (isClose === true) return;
    setTimeout(function() {
      $previousState.go("musicInvoker");
    }, 100);
  });
  $scope.save = function() {
    $modalInstance.close(true);
    $previousState.go("musicInvoker");
    if ($scope.vm.selectedItem) {
      $rootScope.$broadcast('SELECT_MUSIC', $scope.vm.selectedItem);
    }
  };
  $scope.currentPage = 1;
  $scope.vm = {};
  $scope.vm.selectItem = function(item) {
    $scope.vm.selectedItem = item;
    $scope.vm.musicCollection.map(function(item) {
      if (item.$$active) {
        item.$$active = false;
      }
    });
    item.$$active = true;
  };
  var audio5js = new Audio5js({
    throw_errors:true
  });
  $scope.vm.play = function(event, url, music) {
    if (music) {
      clearPlaying();
      music.$$playing = true;
    }
    audio5js.pause();

    setTimeout(function() {
      audio5js.load(url);
      audio5js.play();
    },100);
    event.stopPropagation();
  };
  $scope.vm.stop = function(event, music) {
    if (music) {
      music.$$playing = false;
    }
    audio5js.pause();
    event.stopPropagation();
  };
  function clearPlaying() {
    $scope.vm.musicCollection.map(function(item) {
      if (item.$$playing) {
        item.$$playing = false;
      }
    });
    audio5js.pause();
  }

  $scope.vm.openOuter = function() {
    $scope.vm.creatOuterLink = true;
  };
  $scope.vm.cancel = function() {
    $scope.vm.creatOuterLink = false;
    $scope.vm.isValidate = false;
  };
  $scope.vm.addMusic = function(type) {
    var obj = {};
    if (!isURL($scope.vm.outerLink)) {
      $scope.vm.isValidate = true;
      return;
    }
    obj.type = 'outer';
    obj.name = getNameFromUrl($scope.vm.outerLink);
    obj.url = $scope.vm.outerLink;

    ossService.addMusicItem(obj, false);

    $scope.vm.creatOuterLink = false;
    $scope.vm.isValidate = false;
  };
  $scope.vm.deleteMusic = function(event, music) {
    var index = $scope.vm.musicCollection.indexOf(music);
    $scope.vm.musicCollection.splice(index, 1);
    ossService.deleteMusics([music.id], $scope.vm.isPublic, music.type).then(function() {
      console.log('delete success');
    });
    // pause current playing music
    if (music.$$playing) {
      music.$$playing = false;
      audio5js.pause();
    }
    // delete current selected item
    if (music.$$active) {
      $scope.vm.selectedItem = null;
    }
    event.stopPropagation();
  };

  // 分页配置
  $scope.maxSize = 5;
  $scope.numPages = '';
  $scope.currentPage = 1;
  $scope.itemsPerPage = 14;

  $scope.$on("$stateChangeStart", function(evt, toState) {
    if (!toState.$$state().includes['app.music']) {
      $modalInstance.dismiss();
    }
  });
  $scope.$on('$destory', function() {
    clearPlaying();
  });

  function isURL(str_url) {// 验证url
    var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
    + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" // ftp的user@
    + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
    + "|" // 允许IP和DOMAIN（域名）
    + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
    + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
    + "[a-z]{2,6})" // first level domain- .com or .museum
    + "(:[0-9]{1,4})?" // 端口- :80
    + "((/?)|" // a slash isn't required if there is no file name
    + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
    var re = new RegExp(strRegex);
    return re.test(str_url);
  }
  function getNameFromUrl(url) {
    var arr = url.split('/');
    return arr[arr.length - 1];
  }
}]);
angular.module('app').controller('music-substate', ['$scope', '$state', 'ossService', function($scope, $state, ossService) {
  // load data
  var isPublic = $state.current.name == 'app.music.library' ? true : false;
  ossService.getMusicList(isPublic).then(function(list) {
    $scope.vm.musicCollection = list.list || [];
    var config;
    if (isPublic) {
      config = window.appConfig.public['music'];
    } else {
      config = window.appConfig.user['music'];
    }
    angular.forEach($scope.vm.musicCollection, function (item) {
      if (item.type != 'outer') {
        item.url = config.host + '/' + config.path + '/' + item.id;
      }
    });
    $scope.tags = list.property.tags;
    $scope.property = list.property;
  });

  // tag methods
  $scope.vm.moveToTag = function (currentGroup) {
    $scope.vm.musicCollection.map(function (item) {
      if (item.$$isSelect) {
        if (!item.tags) {
          item.tags = [];
        }
        if (item.tags.indexOf(currentGroup) == -1) {
          item.tags.push(currentGroup);
        }
      }
    });
    uploadList();
  };
  $scope.vm.moveFromTag = function (currentGroup) {
    $scope.vm.musicCollection.map(function (item) {
      if (item.$$isSelect) {
        if(!item.tags) {
          item.tags = [];
        }

        if(item.tags) {
          var index = item.tags.indexOf(currentGroup);
          if(index != -1) {
            item.tags.splice(index, 1);
          }
        }
      }
    });
    uploadList();
  };
  $scope.vm.addTag = function () {
    var tag = $scope.vm.newGroup;;
    for (var i = 0; i < $scope.tags; i++) {
      var t = $scope.tags[i];
      if (t.name == tag) {
        $scope.vm.addError = '标签重复了';
        return;
      }
    }

    $scope.property.latestTag += 1;
    $scope.tags.push({
      id: $scope.property.latestTag,
      name: tag
    });
    ossService.uploadMusicList(isPublic);
    $scope.vm.creatGroup = false;
    $scope.vm.newGroup = '';
  };
  $scope.vm.deleteTag = function (tagId) {
    for (var i = 0; i < $scope.tags.length; i++) {
      var t = $scope.tags[i];
      if (t.id == tagId) {
        $scope.tags.splice(i, 1);
      }
    }
    ossService.uploadMusicList(isPublic);
  };
  function uploadList() {
    var uploadMethod = 'uploadMusicList';
    ossService[uploadMethod](isPublic).then(function() {
      console.log('success', uploadMethod);
    });
  }

  $scope.vm.createTagPanel = function () {
    $scope.vm.creatGroup = true;
  };
  $scope.vm.closeTagPanel = function () {
    $scope.vm.creatGroup = false;
  };


  // reset when state change
  if ($scope.vm.selectedItem) {
    $scope.vm.selectedItem.$$active = false;
    $scope.vm.selectedItem = null;
  }

  // 上传配置
  $scope.vm.isPublic = isPublic;
  $scope.vm.type = 'music';
}]);




