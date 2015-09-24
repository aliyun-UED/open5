var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
var path = require('path');
var ALY = require('aliyun-sdk');
var fs = require('fs');

try {
  var configJson = fs.readFileSync('./server.json', 'utf-8');
  var config = JSON.parse(configJson);
} catch (e) {
  console.log('请首次使用, 请先执行setup');
  console.log(e);
  return;
}

var sts = new ALY.STS({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.accessKeySecret,
  endpoint: 'https://sts.aliyuncs.com',
  apiVersion: '2015-04-01'
});

if (process.env.NODE_ENV == 'production') {
  app.use(express.static(__dirname + '/dist'));
  app.set('views', __dirname + '/dist');
}
else {
  app.use(express.static(__dirname));
  app.set('views', __dirname);
}

app.engine('html', require('ejs-mate'));
app.set('view engine', 'html');

app.get('/', function (req, res) {
  res.render('editor', {
    isAdmin: false,
    uid: config.uid,
    bucket: config.bucket,
    ossEndpoint: config.ossEndpoint,
    publicImageHost: config.publicImageHost,
    publicBgHost: config.publicBgHost,
    publicMusicHost: config.publicMusicHost,
    userImageHost: config.userImageHost,
    userBgHost: config.userBgHost,
    userMusicHost: config.userMusicHost
  });
});

app.get('/favicon.ico', function (req, res) {
  res.sendFile('images/favicon.ico', {
    root: __dirname
  });
});

app.get('/token', function (req, res) {
  var uid = config.uid;
  var accountId = config.accountId;
  var bucket = config.bucket;
  var roleArn = config.roleArn;
  var resource = bucket + '/user/' + uid + '/*';

  sts.assumeRole({
    RoleArn: roleArn,
    RoleSessionName: 'RoleSesstionName',
    Policy: '{"Version":"1","Statement":[{"Effect":"Allow","Action":["oss:GetObject","oss:PutObject","oss:DeleteObject"],"Resource":["acs:oss:*:' + accountId + ':' + resource + '"]},{"Effect":"Allow","Action":["oss:GetObject"],"Resource":["acs:oss:*:' + accountId + ':' + bucket + '/public/*' + '"]}]}',
    DurationSeconds: 3600
  }, function (err, data) {
    if (err) {
      console.log(err);
      return res.status(404).send(err);
    }
    res.json(data);
  });
});

var server = app.listen(process.env.PORT || 7000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});