angular.module('app')
    .directive('uploader',
    ['$q', 'ossService', '$state', '$stateParams',
      function ($q, ossService, $state, $stateParams) {
        return {
          restrict: 'A',
          replace: false,
          scope: {
            files: "=",
            uploadType: "=",
            isPublic: "="
          },
          link: function ($scope, elem, attrs, ngModel) {
            var config;
            var type;
            var isPublic;

            checkConfig();

            var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
            var upload = function (file) {
              var deferred = $q.defer();
              var options = {
                name: file.name,
                size: file.size,
                _type: file.type
              };
              var frOnload = function (e) {
                var arrayBuffer = e.target.result;
                var type = $scope.uploadType.replace(/^\w/, function(s) {
                  return s.toUpperCase();
                });
                var method = 'upload' + type;
                checkConfig();
                ossService[method](arrayBuffer, file.type || "", isPublic, options).then(function(id) {
                  console.log(file.name, id);
                  deferred.resolve(id);
                }, function(reason) {
                  deferred.reject(reason);
                });
              };
              var frOnerror = function () {
                console.log('error');
                deferred.reject(reason);
              };

              function loadNext() {
                var fileReader = new FileReader();
                fileReader.onload = frOnload;
                fileReader.onerror = frOnerror;
                fileReader.readAsArrayBuffer(blobSlice.call(file));
              }

              loadNext();
              return deferred.promise;
            };
            elem.change(function (e) {
              var files = e.target.files;
              angular.forEach(files, function(item) {
                var promise = upload(item);
                promise.then(function(obj) {
                  obj.url = config.host + '/' + config.path + '/' + obj.id;
                  obj.$$originUrl = obj.url;
                  obj.$$url = obj.url + '@0e_80w_80h_0c_0i_1o_1x.jpg';
                }, function(obj) {
                  console.log('upload error...')
                });
              });

              elem.value = "";
            });
            function checkConfig() {
              type = $scope.uploadType;
              isPublic = $scope.isPublic;
              if (isPublic) {
                config = window.appConfig.public[type];
              } else {
                config = window.appConfig.user[type];
              }
            }
          }
        };
      }]);