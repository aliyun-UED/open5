window.config = {
  animTypeEnum: [
    {
      id: "none",
      name: '无'
    },
    {
      id: "fadeIn",
      name: '淡入',
      cat: '进入',
      direction: [
        {
          label: '中心淡入',
          value: 'fadeIn'
        },
        {
          label: '从下淡入',
          value: 'fadeInDown'
        },
        {
          label: '从左淡入',
          value: 'fadeInLeft'
        },
        {
          label: '从右淡入',
          value: 'fadeInRight'
        },
        {
          label: '从上淡入',
          value: 'fadeInUp'
        }
      ]
    },
    {
      id: "sliding",
      name: '移入',
      cat: '进入',
      direction: [
        {
          label: '向上移入',
          value: 'slideInUp'
        },
        {
          label: '向下移入',
          value: 'slideInDown'
        },
        {
          label: '向左移入',
          value: 'slideInLeft'
        },
        {
          label: '向右移入',
          value: 'slideInRight'
        },
      ]
    },
    {
      id: "lightSpeedIn",
      name: '光速进入',
      cat: '进入'
    },
    {
      id: "bounceIn",
      name: '弹入',
      cat: '进入',
      direction: [
        {
          label: '中心弹入',
          duration: 0.75,
          value: 'bounceIn'
        },
        {
          label: '向下弹入',
          value: 'bounceInDown'
        },
        {
          label: '从左弹入',
          value: 'bounceInLeft'
        },
        {
          label: '从右弹入',
          value: 'bounceInRight'
        },
        {
          label: '向上弹入',
          value: 'bounceInUp'
        },
      ]
    },
    {
      id: "rotateIn",
      name: '旋转进入',
      cat: '进入',
      direction: [
        {
          label: '旋转淡入',
          value: 'rotateIn'
        },
        {
          label: '左下旋转',
          value: 'rotateInDownLeft'
        },
        {
          label: '右下旋转',
          value: 'rotateInDownRight'
        },
        {
          label: '左上旋转',
          value: 'rotateInUpLeft'
        },
        {
          label: '右上旋转',
          value: 'rotateInUpRight'
        },
      ]
    },
    {
      id: "flip",
      name: '翻转',
      cat: '进入',
      direction: [
        {
          label: '中心翻转',
          value: 'flipInX'
        },
        {
          label: '水平翻转',
          value: 'flip'
        },
        {
          label: '垂直翻转',
          value: 'flipInY'
        }
      ]
    },
    {
      id: "zoomIn",
      name: '放大进入',
      cat: '进入',
      direction: [
        {
          label: '中心放大',
          value: 'zoomIn'
        },
        {
          label: '向下放大',
          value: 'zoomInDown'
        },
        {
          label: '从左放大',
          value: 'zoomInLeft'
        },
        {
          label: '从右放大',
          value: 'zoomInRight'
        },
        {
          label: '向上放大',
          value: 'zoomInUp'
        },
      ]
    },
    {
      id: "rollIn",
      name: '翻滚进入',
      cat: '进入'
    },

    {
      id: "rotation",
      name: '旋转',
      cat: '强调',
      direction: [
        {
          label: '顺时针',
          value: 'rotation'
        },
        {
          label: '逆时针',
          value: 'rotationAnti'
        },
        {
          label: '水平',
          value: 'rotationVertical'
        }
      ]
    },
    {
      id: "bounce",
      name: '跳动',
      cat: '强调'
    },
    {
      id: "flash",
      name: '闪烁',
      cat: '强调'
    },
    {
      id: "pulse",
      name: '缓动',
      cat: '强调'
    },
    {
      id: "rubberBand",
      name: '拉伸',
      cat: '强调'
    },
    {
      id: "shake",
      name: '摇摆',
      cat: '强调'
    },
    {
      id: "swing",
      name: '悬摆',
      cat: '强调'
    },
    {
      id: "tada",
      name: '抖动',
      cat: '强调'
    },
    {
      id: "wobble",
      name: '倾斜摇摆',
      cat: '强调'
    },
    {
      id: "jello",
      name: '倾斜抖动',
      cat: '强调'
    },
    {
      id: "slideOut",
      name: '移出',
      cat: '退出',
      direction: [
        {
          label: '向上移出',
          value: 'slideOutUp'
        },
        {
          label: '向下移出',
          value: 'slideOutDown'
        },
        {
          label: '向左移出',
          value: 'slideOutLeft'
        },
        {
          label: '向右移出',
          value: 'slideOutRight'
        },
      ]
    },
    {
      id: "zoomOut",
      name: '缩小退出',
      cat: '退出',
      direction: [
        {
          label: '中心缩小',
          value: 'zoomOut'
        },
        {
          label: '向下缩小',
          value: 'zoomOutDown'
        },
        {
          label: '从左缩小',
          value: 'zoomOutLeft'
        },
        {
          label: '从右缩小',
          value: 'zoomOutRight'
        },
        {
          label: '向上缩小',
          value: 'zoomOutUp'
        },
      ]
    },
    {
      id: "fadeOut",
      name: '淡出',
      cat: '退出',
      direction: [
        {
          label: '无',
          value: ''
        },
        {
          label: '从下淡出',
          value: 'fadeOutDown'
        },
        {
          label: '从左淡出',
          value: 'fadeOutLeft'
        },
        {
          label: '从右淡出',
          value: 'fadeOutRight'
        },
        {
          label: '从上淡出',
          value: 'fadeOutUp'
        }
      ]
    },
    {
      id: "flipOut",
      name: '翻转消失',
      cat: '退出',
      direction: [
        {
          label: '水平翻转',
          duration: 0.75,
          value: 'flipOutX'
        },
        {
          label: '垂直翻转',
          duration: 0.75,
          value: 'flipOutY'
        }
      ]
    },
    {
      id: "rotateOut",
      name: '旋转退出',
      cat: '退出',
      direction: [
        {
          label: '旋转淡出',
          value: 'rotateOut'
        },
        {
          label: '左下旋转',
          value: 'rotateOutDownLeft'
        },
        {
          label: '右下旋转',
          value: 'rotateOutDownRight'
        },
        {
          label: '左上旋转',
          value: 'rotateOutUpLeft'
        },
        {
          label: '右上旋转',
          value: 'rotateOutUpRight'
        },
      ]
    },
    {
      id: "bounceOut",
      name: '弹出',
      cat: '退出',
      direction: [
        {
          label: '中心弹出',
          duration: 0.75,
          value: 'bounceOut'
        },
        {
          label: '向下弹出',
          value: 'bounceOutDown'
        },
        {
          label: '从左弹出',
          value: 'bounceOutLeft'
        },
        {
          label: '从右弹出',
          value: 'bounceOutRight'
        },
        {
          label: '向上弹出',
          value: 'bounceInUp'
        },
      ]
    },
    {
      id: "rollOut",
      name: '翻滚退出',
      cat: '退出'
    },
    {
      id: "hinge",
      name: '吊挂退出',
      duration: 2,
      cat: '退出'
    },
    {
      id: "lightSpeedOut",
      name: '光速退出',
      cat: '退出'
    }
  ],
  animRepeat: [
    {
      label: '1',
      value: 1
    },
    {
      label: '2',
      value: 2
    },
    {
      label: '3',
      value: 3
    },
    {
      label: '4',
      value: 4
    },
    {
      label: '5',
      value: 5
    },
    {
      label: '6',
      value: 6
    },
    {
      label: '7',
      value: 7
    },
    {
      label: '8',
      value: 8
    },
    {
      label: '9',
      value: 9
    },
    {
      label: '10',
      value: 10
    },
    {
      label: '无限',
      value: 'infinite'
    },
  ],
  pageTransition: [
    {
      label: "覆盖",
      value: "overwrite"
    },
    {
      label: "移动",
      value: "move"
    },
    {
      label: "旋转",
      value: "rotate"
    },
    {
      label: "缩放",
      value: "scale"
    },
    {
      label: "立方",
      value: "cubic"
    }
    // {
    //   label: "推进",
    //   value: "push"
    // }
  ],
  tweens: {
    "none": [],
    "fadeIn": [
      {
        "delay": "animate.delay || 0",
        "action": "from",
        "duration": "animate.duration",
        "ease": "Power2.easeOut",
        "css": {
          "opacity": "0"
        }
      },
      {
        "timeLabel": "25 50 100",
        "css": {
          "opacity": 1
        }
      },
      {
        "delay": "10 30",
        "css": {
          "opacity": 0
        }
      }
    ],
    "moveIn": [
      {
        "delay": "animate.delay || 0",
        "action": "from",
        "duration": "animate.duration",
        "ease": "Power2.easeOut",
        "css": {
          "left": "-100"
        }
      }
    ],
    "dropIn": [
      {
        "delay": "animate.delay || 0",
        "action": "from",
        "css": {
          "left": "'-' + animate.distance"
        },
        "duration": "animate.duration",
        "ease": "Bounce.easeOut"
      }
    ],
    "bounceIn": [
      {
        "delay": "animate.delay || 0",
        "action": "from",
        "css": {
          "left": "-100"
        },
        "duration": "animate.duration",
        "ease": "Elastic.easeOut.config(1, 0.3)"
      }
    ]
  },
  globalFontFamily: '"Segoe UI","Lucida Grande",Helvetica,Arial,"Microsoft YaHei",FreeSans,Arimo,"Droid Sans","wenquanyi micro hei","Hiragino Sans GB","Hiragino Sans GB W3",sans-serif',
  fontFamily: [
    {
      label: '雅黑',
      value: 'Microsoft YaHei'
    },
    {
      label: '宋体',
      value: '宋体, SimSun'
    },
    {
      label: '仿宋',
      value: '仿宋, 仿宋_gb2312, fangsong_gb2312'
    },
    {
      label: '楷体',
      value: '楷体, 楷体_GB2312, SimKai'
    },
    {
      label: '黑体',
      value: '黑体, SimHei'
    },
    {
      label: 'cuisive',
      value: 'cuisive'
    },
    {
      label: 'fantasy',
      value: 'fantasy'
    },
    {
      label: 'helvetica',
      value: 'helvetica'
    },
    {
      label: 'serif',
      value: 'serif'
    },
    {
      label: 'sans-serif',
      value: 'sans-serif'
    }
  ],
  fontSizeList: [
    // {
    //   value: 1,
    //   label: '9px'
    // },
    {
      value: 2,
      label: '10px'
    },
    {
      value: 3,
      label: '11px'
    },
    {
      value: 4,
      label: '12px'
    },
    {
      value: 5,
      label: '14px'
    },
    {
      value: 6,
      label: '16px'
    },
    {
      value: 7,
      label: '18px'
    },
    {
      value: 8,
      label: '20px'
    },
    {
      value: 9,
      label: '24px'
    },
    {
      value: 10,
      label: '28px'
    },
    {
      value: 11,
      label: '32px'
    },
    {
      value: 12,
      label: '36px'
    },
    {
      value: 13,
      label: '40px'
    },
    {
      value: 14,
      label: '44px'
    },
    {
      value: 15,
      label: '48px'
    },
    {
      value: 16,
      label: '54px'
    },
    {
      value: 17,
      label: '60px'
    },
    {
      value: 18,
      label: '66px'
    },
    {
      value: 19,
      label: '72px'
    },
    {
      value: 20,
      label: '80px'
    },
    {
      value: 21,
      label: '88px'
    },
    {
      value: 22,
      label: '96px'
    },
    {
      value: 23,
      label: '108px'
    },
    {
      value: 24,
      label: '120px'
    },
    {
      value: 25,
      label: '136px'
    },
    {
      value: 26,
      label: '150px'
    }
  ],
  linkList: [
    {
      name: '无',
      type: 'none'
    },
    {
      name: '网页',
      type: 'web'
    },
    {
      name: '电话',
      type: 'tel'
    },
    {
      name: '页面',
      type: 'page'
    }
  ],
  defaultResourceList: {
    "property": {
      "latest": 0,
      "latestTag": 0,
      "tags": []
    },
    "list": []
  },
  defaultDropInAnimationData: {
    "type": "dropIn",
    "duration": 1,
    "delay": 0,
    "repeat": 0,
    "direction": "top",
    "offset": ""
  },
  defaultAnimationData: {
    "type": "none",
    "duration": 0,
    "delay": 0,
    "repeat": 0
  },
  defaultPageData: {
    "rightPageId": "",
    "bottomPageId": "",
    "name": "未命名",
    "viewport": {
      "fontSize": 14,
      "width": 320,
      "height": 506
    },
    "background": {
      "output": "",
      "input": {
        "image": "",
        "size": "",
        "position": "",
        "color": ""
      }
    },
    "elements": [],
    "leftPageId": "",
    "topPageId": ""
  },
  defaultTextData: {
    "name": '文本1',
    "pageId": "1",
    "content": "<p>双击编辑文字</p>",
    "link": {},
    "css": {
      "top": 229,
      "left": 71,
      "height": 48,
      "width": 178,
      "rotation": "0",
      "paddingTop": "13px",

      "fontSize": "14px",
      "color": "#333",
      "backgroundColor": "transparent", // "rgba(255,255,255,0)",
      "fontWeight": "300", // 700
      "fontStyle": "normal", // "italic"
      "textDecoration": "none", // "none"
      "textAlign": "center", // left right justify
      "letterSpacing": "0",
      "lineHeight": "1.5",

      "paddingLeft": "0",
      "paddingRight": "0",

      "borderStyle": "none", // "solid" "dashed" "dotted" "double"
      "borderColor": "transparent",
      "borderWidth": "0",

      "opacity": "1",
      "boxShadow": "none", // "rgb(40,40,40) 0px 0px 10px 2px;"
      "borderRadius": "0",
    },
    "animations": [],
    "id": "8614326967", // 这个要随机生成
    "type": "text"
  },
  defaultImageData: {
    "name": "图片1",
    "pageId": "1",
    "content": "http://image-demo-beijing.img-cn-beijing.aliyuncs.com/example.jpg@1e_200w_200h_1c_0i_1o_90Q_1x.jpg",
    "link": {},
    "css": {
      "top": 0,
      "left": 0,
      "height": 200,
      "width": 200,
      "rotation": "0",

      "fontSize": "14px",
      "color": "#333",
      "backgroundColor": "transparent", // "rgba(255,255,255,0)",
      "fontWeight": "300", // 700
      "fontStyle": "normal", // "italic"
      "textDecoration": "underline", // "none"
      "textAlign": "center", // left right justify
      "letterSpacing": "0",
      "lineHeight": "14px",

      "paddingLeft": "0",
      "paddingRight": "0",

      "borderStyle": "none", // "solid" "dashed" "dotted" "double"
      "borderColor": "transparent",
      "borderWidth": "0",

      "opacity": "1",
      "boxShadow": "none", // "rgb(40,40,40) 0px 0px 10px 2px;"
      "borderRadius": "0",
    },
    "animations": [],
    "id": "", // 这个要随机生成
    "type": "image"
  }
};