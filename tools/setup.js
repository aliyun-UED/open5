var async = require('async');
var fs = require('fs');
var path = require('path');
var replace = require('gulp-replace');
var ALY = require('aliyun-sdk');
var config = require('../config.js');
var ram = new ALY.RAM({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  endpoint: 'https://ram.aliyuncs.com',
  apiVersion: '2015-05-01'
});

// 必需要准备账号 ID, 可以在 https://account.console.aliyun.com/#/secure 找到
var accountId = config.accountId;
// 创建的用户的名称, 可以自己设置
var userName = config.userName;
// 创建的角色的名称, 可以自己设置
var roleName = config.roleName;

async.waterfall([function(callback) {
  console.log('设置之前会进行清理工作....');
  console.log('如果你是首次设置，请忽略清理时角色不存在的错误...');
  clearRAM(callback);
}, function(data, callback) {
  setupRAM(callback);
}, function(data, callback) {
  // 上传文件
  var upload = require('./upload.js');
  upload(callback);
}], function(err) {
  if (err) {
    console.log('上传 resources 失败');
    console.log(err);
  }

  console.log('上传 resources 成功');
});

// 清除已经设置的 RAM 用户和角色
// 注意, 清除后就不能使用该用户和角色调用 assumeRole 方法, 生产环境慎用!
function clearRAM(cb) {
  async.waterfall([
    function (callback) {
      console.log('正在 detachPolicyFromRole');
      ram.detachPolicyFromRole({
        PolicyType: 'System',
        PolicyName: 'AliyunOSSFullAccess',
        RoleName: roleName
      }, function (err, res) {
        if (err) {
          console.error('失败', '原因:', err);
        }
        callback(null, res);
      });
    },
    function (data, callback) {
      console.log('正在 deleteRole');
      ram.deleteRole({
        RoleName: roleName
      }, function (err, res) {
        if (err) {
          console.error('失败', '原因:', err);
        }

        callback(null, res);
      });
    },
    function (data, callback) {
      console.log('正在 detachPolicyFromUser');
      ram.detachPolicyFromUser({
        PolicyType: 'System',
        PolicyName: 'AliyunSTSAssumeRoleAccess',
        UserName: userName
      }, function (err, res) {
        if (err) {
          console.error('失败', '原因:', err);
        }

        callback(null, res);
      });
    },
    function (data, callback) {
      console.log('正在 deleteUser');
      ram.deleteUser({
        UserName: userName
      }, function (err, res) {
        if (err) {
          console.error('失败', '原因:', err);
        }

        callback(null, res);
      });
    }
  ], function (err, res) {
    console.log('执行完毕');
    if (typeof cb == 'function') cb(err, res);
  });
}

// 创建用户和角色
function setupRAM(cb) {
  async.waterfall([
    function (callback) {
      var data = {};
      console.log('正在 createUser');
      ram.createUser({
        UserName: userName
      }, function (err, res) {
        if (err) {
          console.error('失败', '原因:', err);
          return callback(true);
        }

        callback(null, data);
      });
    },
    function (data, callback) {
      console.log('正在 attachPolicyToUser');
      ram.attachPolicyToUser({
        PolicyType: 'System',
        PolicyName: 'AliyunSTSAssumeRoleAccess',
        UserName: userName
      }, function (err, res) {
        if (err) {
          console.error('失败', '原因:', err);
          return callback(true);
        }

        callback(null, data);
      });
    },
    function (data, callback) {
      console.log('正在 createAccessKey');
      ram.createAccessKey({
        UserName: userName
      }, function (err, res) {
        if (err) {
          console.error('失败', '原因:', err);
          return callback(true);
        }

        data.accessKeyId = res.AccessKey.AccessKeyId;
        data.accessKeySecret = res.AccessKey.AccessKeySecret;

        callback(null, data);
      });
    },
    function (data, callback) {
      console.log('正在 createRole');
      ram.createRole({
        RoleName: roleName,
        AssumeRolePolicyDocument: '{"Statement":[{"Action":"sts:AssumeRole","Effect":"Allow","Principal":{"RAM":["acs:ram::' + accountId +':root"]}}],"Version":"1"}'
      }, function (err, res) {
        if (err) {
          console.error('失败', '原因:', err);
          return callback(true);
        }

        data.roleArn = res.Role.Arn;

        callback(null, data);
      });
    },
    function (data, callback) {
      console.log('正在 attachPolicyToRole');
      ram.attachPolicyToRole({
        PolicyType: 'System',
        PolicyName: 'AliyunOSSFullAccess',
        RoleName: roleName
      }, function (err, res) {
        if (err) {
          console.error('失败', '原因:', err);
          return callback(true);
        }

        callback(null, data);
      });
    },
    function (data, callback) {
      console.log('将用户和角色信息写入server.json文件中');
      var configForServer = {
        uid: config.uid,
        accountId: config.accountId,
        roleArn: data.roleArn,
        accessKeyId: data.accessKeyId,
        accessKeySecret: data.accessKeySecret,
        bucket: config.bucket,
        ossEndpoint: config.ossEndpoint,
        publicImageHost: config.publicImageHost,
        publicBgHost: config.publicBgHost,
        publicMusicHost: config.publicMusicHost,
        userImageHost: config.userImageHost,
        userBgHost: config.userBgHost,
        userMusicHost: config.userMusicHost
      };

      fs.writeFile(path.resolve(__dirname, '../server.json'), JSON.stringify(configForServer, null, "\t"), function(err) {
        if (err) console.log('写入 server.json err:', err);
        callback(err, data);
      });
    }
  ], function (err, data) {
    if (typeof cb == 'function') cb(err, data);
    if (err) {
      console.log('setup 失败');
      console.log('请根据错误提示进行修改');
      console.log('然后重新运行 setup.js');
      return;
    }

    console.log('setup 成功');
  });
}
