var ALY = require('aliyun-sdk');
var fs = require('fs');
var path = require('path');
var walk = require('walk');
var config = require('../config.js');
var bucketName = config.bucket;
var h5ResourceDir = path.resolve(__dirname, 'resources');

var oss = new ALY.OSS({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  endpoint: config.ossEndpoint,
  apiVersion: '2013-10-15'
});

module.exports = function (callback) {
  var walker  = walk.walk(h5ResourceDir, { followLinks: false });
  walker.on('file', function(root, stat, next) {
    var filepath = root + '/' + stat.name;
    var tmpPath = filepath.replace(/^(\.\/|\/)/, '');
    console.log(filepath, tmpPath);
    var uploadpath = tmpPath.split('resources/').splice(1).join('/');

    console.log('upload file: ', uploadpath);
    upload(bucketName, filepath, uploadpath, next);
  });
  walker.on('end', function(err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('upload success!');
    }
    callback(err);
  });
};
function upload(bucketName, filepath, filename, callback) {
  fs.readFile(filepath, function (err, data) {
    if (err) {
      console.log('read file err: ', err);
      return;
    }
    oss.putObject({
      Bucket: bucketName,
      Key: filename,
      Body: data,
      CacheControl: 'no-cache',
      ContentDisposition: '',
      ContentEncoding: 'utf-8'
    }, function (err, data) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, data);
      console.log("success to upload " + filename);
    });
  });
}

