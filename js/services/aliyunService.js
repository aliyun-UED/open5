"use strict";

angular.module('aliyunService', [])
    .factory('getStsToken',
    ['$http', '$q',
      function ($http, $q) {
        var stsToken = window.appConfig.token.sts;

        return function () {
          var deferred = $q.defer();

          if (stsToken && stsToken.Credentials && stsToken.Credentials.Expiration) {
            var d = new Date(stsToken.Credentials.Expiration);
            var now = new Date();
            if (d.getTime() - now.getTime() > 1000) {
              deferred.resolve({
                token: stsToken,
                refresh: false
              });
            }
          }
          else if (window.appConfig.token.url) {
            $http.get(window.appConfig.token.url)
                .then(function (resp) {
                  stsToken = resp.data;
                  deferred.resolve({
                    token: stsToken,
                    refresh: true
                  });
                }, function (resp) {
                  deferred.reject(resp);
                });
          }
          else {
            deferred.reject();
          }

          return deferred.promise;
        }
      }])
    .factory('ossService',
    ['$http', '$q', 'toaster', '$state', '$timeout', '$rootScope', 'getStsToken',
      function ($http, $q, toaster, $state, $timeout, $rootScope, getStsToken) {
        var s = {};
        var ALY = window.ALY;
        var _oss;
        var listCache = {};
        var jsonCache = {};

        var uuid = function (size, chars) {
          size = size || 8;
          var code_string = chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          var max_num = code_string.length + 1;
          var new_pass = '';
          while (size > 0) {
            new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
            size--;
          }
          return new_pass;
        };

        var getOss = function () {
          var deferred = $q.defer();

          getStsToken().then(function (result) {
            var token = result.token;
            if (!_oss || token.refresh) {
              _oss = new ALY.OSS({
                accessKeyId: token.Credentials.AccessKeyId,
                secretAccessKey: token.Credentials.AccessKeySecret,
                securityToken: token.Credentials.SecurityToken,
                endpoint: window.appConfig.oss.endpoint,
                apiVersion: '2013-10-15'
              });

              deferred.resolve(_oss);
            }
            else {
              deferred.resolve(_oss);
            }
          }, function (reason) {
            alert(reason);
          });

          return deferred.promise;
        };

        var getObject = function (bucket, key) {
          var deferred = $q.defer();

          getOss().then(function (oss) {
            oss.getObject({
              Bucket: bucket,
              Key: key
            },
            function (err, data) {
              if (err) {
                deferred.reject(err);
                return;
              }
              deferred.resolve(data);
            });
          });

          return deferred.promise;
        };

        var putObject = function (bucket, key, body, contentType) {
          var deferred = $q.defer();

          getOss().then(function (oss) {
            oss.putObject({
              Bucket: bucket,
              Key: key,
              Body: body,
              ContentType: contentType
            },
            function (err, data) {
              if (err) {
                deferred.reject(err);
              }
              deferred.resolve(data);
            });
          });

          return deferred.promise;
        };

        var copyObject = function (bucket, sourceKey, key) {
          var deferred = $q.defer();

          getOss().then(function (oss) {
            oss.copyObject({
                  Bucket: bucket,
                  CopySource: '/' + bucket + '/' + sourceKey,
                  Key: key
                },
                function (err, data) {

                  if (err) {
                    deferred.reject(err);
                  }

                  deferred.resolve(data);
                });
          });

          return deferred.promise;
        };

        var deleteObjects = function (bucket, keys) {
          var deferred = $q.defer();

          var arr = [];
          angular.forEach(keys, function (k) {
            arr.push({
              Key: k
            });
          });

          getOss().then(function (oss) {
            oss.deleteObjects({
              Bucket: bucket,
              "Delete": {
                "Objects": arr,
                "Quiet": true
              }
            }, function (err, res) {
              if (err) {
                alert(err);
                return;
              }

              deferred.resolve();
            });
          });

          return deferred.promise;
        };

        var loadList = function (type, isPublic) {
          var deferred = $q.defer();

          var bucket;
          var key;
          if (isPublic) {
            bucket = window.appConfig.public[type].bucket;
            key = window.appConfig.public[type].path + '/list.json';
          }
          else {
            bucket = window.appConfig.user[type].bucket;
            key = window.appConfig.user[type].path + '/list.json';
          }

          if (listCache[key]) {
            deferred.resolve(listCache[key]);
          }
          else {
            console.log('loadlist ... ', bucket, key);
            getObject(bucket, key).then(function (data) {
              listCache[key] = JSON.parse(data.Body.toString());
              deferred.resolve(listCache[key]);
            }, function(reason) {
              console.log(reason);
              console.log('在本地初始化 list.json');
              // todo: 这里是假设只要出错就是 list.json 不存在, 实际上需要根据具体错误判断.
              listCache[key] = {
                property: {
                  latestTag: 0,
                  tags: []
                },
                list: []
              };
              deferred.resolve(listCache[key]);
            });
          }

          return deferred.promise;
        };

        var saveList = function (type, isPublic) {
          var deferred = $q.defer();

          var bucket;
          var key;
          if (isPublic) {
            bucket = window.appConfig.public[type].bucket;
            key = window.appConfig.public[type].path + '/list.json';
          } else {
            bucket = window.appConfig.user[type].bucket;
            key = window.appConfig.user[type].path + '/list.json';
          }

          if (!listCache[key]) {
            return;
          }

          putObject(bucket, key, angular.toJson(listCache[key]), 'application/json').then(function () {
            deferred.resolve(listCache[key]);
          });

          return deferred.promise;
        };

        var loadJSON = function (type, id, isPublic) {
          var deferred = $q.defer();

          var bucket;
          var key;
          if (isPublic) {
            bucket = window.appConfig.public[type].bucket;
            key = window.appConfig.public[type].path + '/' + id;
          } else {
            bucket = window.appConfig.user[type].bucket;
            key = window.appConfig.user[type].path + '/' + id;
          }

          if (jsonCache[key]) {
            deferred.resolve(jsonCache[key]);
          } else {
            getObject(bucket, key).then(function (data) {
              jsonCache[key] = JSON.parse(data.Body.toString());
              deferred.resolve(jsonCache[key]);
            });
          }

          return deferred.promise;
        };

        var uploadItem = function (data, contentType, type, isPublic, options) {
          var deferred = $q.defer();

          if ('application/json' == contentType) {
            data = angular.toJson(data);
          }

          loadList(type, isPublic).then(function (list) {
            var bucket;
            var key;
            var oid = uuid();

            if (isPublic) {
              bucket = window.appConfig.public[type].bucket;
              key = window.appConfig.public[type].path + '/' + oid;
            } else {
              bucket = window.appConfig.user[type].bucket;
              key = window.appConfig.user[type].path + '/' + oid;
            }

            var obj = $.extend({}, options);
            obj.$$status = 20;
            list.list.unshift(obj);

            putObject(bucket, key, data, contentType).then(function () {
              // 上传成功, 上传 json
              obj.id = oid;
              obj.$$status = 30;

              saveList(type, isPublic).then(function () {
                obj.$$test = list;
                deferred.resolve(obj, list.list);
              });
            }, function() {
              console.log('upload error ...');
            });
          });

          return deferred.promise;
        };
        var _uploadItem = function(data, contentType, type, isPublic) {
          var deferred = $q.defer();

          if ('application/json' == contentType) {
            data = angular.toJson(data);
          }
          loadList(type, isPublic).then(function (list) {
            var bucket;
            var key;
            var oid = uuid();

            if (isPublic) {
              bucket = window.appConfig.public[type].bucket;
              key = window.appConfig.public[type].path + '/' + oid;
            } else {
              bucket = window.appConfig.user[type].bucket;
              key = window.appConfig.user[type].path + '/' + oid;
            }

            var obj = {};
            putObject(bucket, key, data, contentType).then(function () {
              // 上传成功, 上传 json
              obj.id = oid;
              list.list.unshift(obj);

              saveList(type, isPublic).then(function () {
                console.log(type, isPublic,'saveList ...');
                deferred.resolve(obj);
              });
            });
          });

          return deferred.promise;
        };

        var deleteItems = function (ids, type, isPublic) {
          var deferred = $q.defer();
          if (!ids || !ids.length || ids.length == 0) {
            return;
          }

          loadList(type, isPublic).then(function (list) {
            var bucket;
            var keys = [];
            if (isPublic) {
              bucket = window.appConfig.public[type].bucket;
              for (var i = 0; i < ids.length; i++) {
                keys.push(window.appConfig.public[type].path + '/' + ids[i]);
              }
            }
            else {
              bucket = window.appConfig.user[type].bucket;
              for (var i = 0; i < ids.length; i++) {
                keys.push(window.appConfig.user[type].path + '/' + ids[i]);
              }
            }

            deleteObjects(bucket, keys).then(function () {
              var newList = [];
              for(var i = 0; i < list.list.length; i++) {
                var l = list.list[i];
                if(ids.indexOf(l.id) == -1) {
                  newList.push(l);
                }
              }
              list.list = newList;
              saveList(type, isPublic).then(function () {
                deferred.resolve();
              });
            });
          });
          return deferred.promise;
        };

        // 单独添加list，不上传文件
        var addListItem = function(type, isPublic, options) {
          var deferred = $q.defer();

          loadList(type, isPublic).then(function (list) {
            var bucket;
            var key;
            var oid = uuid();

            if (isPublic) {
              bucket = window.appConfig.public[type].bucket;
              key = window.appConfig.public[type].path + '/' + oid;
            } else {
              bucket = window.appConfig.user[type].bucket;
              key = window.appConfig.user[type].path + '/' + oid;
            }
            console.log('add to list .... only be triggered once ...');
            var obj = $.extend({}, options);
            list.list.unshift(obj);

            obj.id = oid;

            saveList(type, isPublic).then(function () {
              deferred.resolve(obj);
            });

          });

          return deferred.promise;
        };
        var deleteListItem = function(ids, type, isPublic) {
          var deferred = $q.defer();
          if (!ids || !ids.length || ids.length == 0) {
            return;
          }

          loadList(type, isPublic).then(function (list) {
            var newList = [];
            for(var i = 0; i < list.list.length; i++) {
              var l = list.list[i];
              if(ids.indexOf(l.id) == -1) {
                newList.push(l);
              }
            }
            list.list = newList;
            saveList(type, isPublic).then(function () {
              deferred.resolve();
            });
          });
          return deferred.promise;
        };

        s.getPageList = function (isPublic) {
          return loadList('page', isPublic);
        };
        s.getImageList = function (isPublic) {
          return loadList('image', isPublic);
        };
        s.loadPage = function (pageId, isPublic) {
          return loadJSON('page', pageId, isPublic);
        };
        s.uploadPage = function (data, isPublic) {
          return _uploadItem(data, 'application/json', 'page', isPublic);
        };
        s.getBgList = function (isPublic) {
          return loadList('bg', isPublic);
        };
        s.getMusicList = function (isPublic) {
          return loadList('music', isPublic);
        };
        s.uploadPageList = function (isPublic) {
          return saveList('page', isPublic);
        };
        s.uploadImageList = function (isPublic) {
          return saveList('image', isPublic);
        };
        s.uploadBgList = function (isPublic) {
          return saveList('bg', isPublic);
        };
        s.uploadMusicList = function (isPublic) {
          return saveList('music', isPublic);
        };
        s.savePublicImageList = function () {
        };
        s.deletePages = function  (ids, isPublic) {
          return deleteItems(ids, 'page', isPublic);
        };
        s.deleteImages = function  (ids, isPublic) {
          return deleteItems(ids, 'image', isPublic);
        };
        s.deleteBgs = function  (ids, isPublic) {
          return deleteItems(ids, 'bg', isPublic);
        };
        s.deleteMusics = function (ids, isPublic) {
          return deleteItems(ids, 'music', isPublic);
        };

        s.uploadBg = function (data, contentType, isPublic) {
          return uploadItem(data, contentType, 'bg', isPublic);
        };
        s.uploadImage = function (data, contentType, isPublic) {
          return uploadItem(data, contentType, 'image', isPublic);
        };
        s.uploadMusic = function (data, contentType, isPublic, options) {
          return uploadItem(data, contentType, 'music', isPublic, options);
        };

        s.addMusicItem = function(options, isPublic) {
          return addListItem('music', isPublic, options)
        };
        s.deleteMusicItem = function(id, isPublic, type) {
          if (type == 'outer') {
            return deleteListItem([id], 'music', isPublic);
          } else {
            return deleteItems([id], 'music', isPublic)
          }
        };

        s.delFiles = deleteObjects;

        s.saveDoc = function (data, docId) {
          var deferred = $q.defer();

          putObject(window.appConfig.user.doc.bucket,
            window.appConfig.user.doc.path + '/' + docId,
            angular.toJson(data), 'application/json').then(function () {
              deferred.resolve();
            }, function () {
              // 上传图片失败
              deferred.reject(1);
            });

          return deferred.promise;
        };

        s.publishDoc = function (data, docId) {
          var deferred = $q.defer();
          s.saveDoc(data, docId)
              .then(function () {
                putObject(window.appConfig.publish.bucket,
                    window.appConfig.publish.path + '/' + docId,
                    angular.toJson(data), 'application/json').then(function () {
                      deferred.resolve();
                    }, function () {
                      deferred.reject(1);
                    });
              });

          return deferred.promise;
        };

        s.loadDoc = function (docId) {
          var deferred = $q.defer();

          getObject(window.appConfig.user.doc.bucket,
              window.appConfig.user.doc.path + '/' + docId)
              .then(function (data) {
                deferred.resolve(JSON.parse(data.Body.toString()));
              }, function () {
                deferred.reject(1);
              });

          return deferred.promise;
        };

        s.setupUser = function (uid) {
          var deferred = $q.defer();


          return deferred.promise;
        };

        return s;
      }]);
