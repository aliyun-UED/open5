module.exports = {

  // 阿里云的根 AK, 用来配置 RAM, 不会暴露在前端
  accessKeyId: '',
  secretAccessKey: '',

  // oss
  bucket: 'open5',

  // 根据你的 oss 实例所在地区选择填入
  // 杭州：http://oss-cn-hangzhou.aliyuncs.com
  // 北京：http://oss-cn-beijing.aliyuncs.com
  // 青岛：http://oss-cn-qingdao.aliyuncs.com
  // 深圳：http://oss-cn-shenzhen.aliyuncs.com
  // 香港：http://oss-cn-hongkong.aliyuncs.com
  ossEndpoint: 'http://oss-cn-hangzhou.aliyuncs.com',

  // ram设置的账号id
  accountId: '',

  // ram设置的用户名字
  userName: 'user-open5',

  // ram设置的角色名字
  roleName: 'role-open5',

  // 上传文件中的user目录下的文件夹
  // 里面存储用户的信息，每个用户生成一个文件夹
  // 该值不能重复
  uid: 'demo',

  // 如果需要使用 oss 图片服务, 需要为
  // http://image.open5.net
  publicImageHost: '',
  publicBgHost: '',
  userImageHost: '',
  userBgHost: '',
  publicMusicHost: '',
  userMusicHost: ''

};