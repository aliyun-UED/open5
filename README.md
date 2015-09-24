Open5 - 基于阿里云 [Open API](https://docs.aliyun.com) 的开源 H5 生成工具
======

--------------

**项目主页：** http://open5.net/

**查看演示：** http://open5.net/demo#/app/demo.json

---------------

## 特性

+ 基于阿里云 Open API, 抛弃传统的服务器开发方式, Open5 直接连接阿里云 Open API, 更高开发效率, 更低维护成本; 海量的存储空间，能支持同时间内高并发、大流量的读写访问; 对存储空间、网络流量、请求次数，按照用户实际使用量进行计费，节省用户的成本
+ 简单 -- 为设计而优化的场景编辑界面
+ 强大 -- 支持图片, 文字, 音乐, 动画以及模板
+ 有用 -- 活动促销, 企业宣传, 移动上云

## 环境

+ Git
+ Node 安装: [node.js官网](https://nodejs.org/en/download/)
+ gulp 安装: npm install -g gulp
+ bower 安装: npm install -g bower

## 准备工作

+ 申请阿里云账号: [注册账号](https://account.aliyun.com/login/login.htm)
+ 进入ak控制台，创建Access Key: [创建](https://ak-console.aliyun.com/#/accesskey)
+ 进入ram控制台，创建账户:[账户](https://ram.console.aliyun.com/#/user/list), 创建角色:[角色](https://ram.console.aliyun.com/#/role/list)
+ 完成之后，进入oss控制台，创建bucket([https://oss.console.aliyun.com/index#/]), 创建完成之后，在bucket管理中，找到你新创的条目，选择设置，在bucket属性中，配置 读写权限(ACL)设置 为 公共读；在 Cors配置中添加一条新的规则: 来源为 * ，Method全选，Allowed Header为 *。点击确定，开启跨域访问。
+ 如何创建oss，[查看文档](https://docs.aliyun.com/#/pub/oss/getting-started/get-started)

## 使用方法

+ 从github上下载代码

```bash
git clone https://github.com/aliyun/open5
```

+ 安装模块依赖

```bash
npm install
```
+ 安装bower第三方库

```bash
bower install
```
+ 在config.default.js中填写你的ak

```javascript
module.exports = {
  version: '0.0.1',

  accessKeyId: 'your accessKeyId',
  secretAccessKey: 'your secretAccessKey',

  // 根据你的 oss 实例所在地区选择填入
  // 杭州：http://oss-cn-hangzhou.aliyuncs.com
  // 北京：http://oss-cn-beijing.aliyuncs.com
  // 青岛：http://oss-cn-qingdao.aliyuncs.com
  // 深圳：http://oss-cn-shenzhen.aliyuncs.com
  // 香港：http://oss-cn-hongkong.aliyuncs.com
  ossEndpoint: 'http://oss-cn-hangzhou.aliyuncs.com',

  // ram endpoint 为定值
  endpoint: 'https://ram.aliyuncs.com',
  apiVersion: '2015-05-01',
  // bucket name
  bucket: 'instancetest',

  // 初始化oss bucket空间所需用到的文件
  // 该目录下的所有文件将会被上传到这个指定的bucket下
  h5ResourceDir: './.tmp',

  // ram设置的账号id
  accountId: '31611321',
  // ram设置的用户名字
  userName: 'user-open5',
  // ram设置的角色名字
  roleName: 'role-open5',

  // check if really need
  // 上传文件中的user目录下的文件夹
  // 里面存储用户的信息，每个用户生成一个文件夹
  // 该值不能重复
  uid: 'demo',

  // 为固定值
  roleSessionName: 'demo'
  // roleARN: 'acs:ram::31611321:role/role-open5',
};

```
+ 按要求填写完config.default.js后，将文件名字改为config.js

+ 执行setup，配置账户

```bash
node setup
```
+ 启动应用

```bash
node server
```

+ 打开浏览器访问: http://localhost:7000/

## License

GNU GENERAL PUBLIC LICENSE Version 2
