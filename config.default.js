module.exports = {

  // 阿里云的根 AK, 用来配置 RAM, 不会暴露在前端
  accessKeyId: '',
  secretAccessKey: '',

  // 在准备工作阶段创建的 OSS bucket
  bucket: 'open5',

  // 根据你的 oss 实例所在地区选择填入
  // 杭州：http://oss-cn-hangzhou.aliyuncs.com
  // 北京：http://oss-cn-beijing.aliyuncs.com
  // 青岛：http://oss-cn-qingdao.aliyuncs.com
  // 深圳：http://oss-cn-shenzhen.aliyuncs.com
  // 香港：http://oss-cn-hongkong.aliyuncs.com
  ossEndpoint: 'http://oss-cn-hangzhou.aliyuncs.com',

  // 阿里云账号 ID, 可以在 https://account.console.aliyun.com/#/secure 找到
  accountId: '',

  // 创建的 RAM 用户的名称, 可以自己设置, 也可以用下面的默认值
  userName: 'user-open5',

  // 创建的 RAM 角色的名称, 可以自己设置, 也可以用下面的默认值
  roleName: 'role-open5',

  // 在 setup 时会在 OSS Bucket 中上传初始的一些静态资源, 并且还会创建一个 demo 用户, 不需要修改
  uid: 'demo',

  // 目前使用 OSS 图片服务, 需要绑定域名并且开通 CDN 加速, 如 http://open5.net 绑定的域名就是
  // http://image.open5.net
  // 如果你已经完成上述工作, 那么可以将域名填入.
  // 之所以会有 4 个 host, 是因为我们假设你希望将 public/image, public/bg, user/image, user/bg 放在 4 个不同的 Bucket 下面, 这样就分别会有 4 个绑定的域名.
  // 一般情况下只需要 1 个 域名.
  // 如果你不填, Open5 也可以工作, 但是涉及到图片服务的地方会显示加载错误.
  publicImageHost: '',
  publicBgHost: '',
  userImageHost: '',
  userBgHost: '',

  // 原理与上面类似, 不过这里不是为了使用图片服务, 而是为了使用 CDN 加速.
  // 如果你已经使用了 OSS 的 CDN 加速, 那么可以将域名填入.
  // 如果你不填, Open5 也可以工作, 并且没有错误产生.
  publicMusicHost: '',
  userMusicHost: ''

};