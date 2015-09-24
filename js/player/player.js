"use strict";

(function () {

  var Player = window.Player = {};
  Player.create = function(id, theData) {
    if(!id) return null;

    var player = StateMachine.create({

      target: {
        width: 0,
        height: 0,
        timelines: {},
        links: {},
        currentPage: null,
        pages: {},
        wrapper: null,
        dragProxy: null,
        content: null,
        audioBtn: null,
        music: null,
        firstPageId: "",
        init: function () {
          player.wrapper = $(id);
          player.wrapper.append('<div class="content"></div>').append('<div class="dragproxy"></div>');
          player.content = player.wrapper.find('.content');
          player.width = player.wrapper.width();
          player.height = player.wrapper.height();
          player.dragProxy = player.wrapper.find('.dragproxy');
        },
        destroy: function() {
          if(player.wrapper) {
            player.wrapper.html('');
          }
        },
        buildPage: function (data) {
          // 必须要先初始化 dom 完成后才能初始化 Tweens
          // init pages
          for(var i = 0; i < data.pages.length; i++) {
            if(i == 0) {
              player.firstPageId = data.pages[i].id;
            }
            player.addPage(data.pages[i]);
          }
        },
        buildTurn: function (turnType) {
          player.turn.init(turnType);
        },
        buildMusic: function (musicData) {
          if(!musicData || !musicData.url) return;

          player.wrapper.append($('<div class="audio_btn on"><audio id="bgMusic" src="$music" autoplay="1" preload="none"></audio></div>'.replace('$music', musicData.url)));
          player.audioBtn = player.wrapper.find('.audio_btn');
          player.music = $('#bgMusic');
          player.audioBtn.on('click', function(e) {
            e.stopPropagation();
            if(player.audioBtn.hasClass('on')) {
              player.audioBtn.removeClass('on');
              player.audioBtn.addClass('off');
              player.music[0].pause();
            }
            else {
              player.audioBtn.removeClass('off');
              player.audioBtn.addClass('on');
              player.music[0].play();
            }
          });
        },
        buildLinks: function (data) {
          for(var i = 0; i < data.pages.length; i++) {
            var page = data.pages[i];
            for(var j = 0; j < page.elements.length; j ++) {
              var elem = page.elements[j];
              player.links[elem.id] = elem.link;
            }
          }

          player.wrapper.find('.element').on('click', function(e) {
            var id = e.currentTarget.getAttribute('id');
            var type = e.currentTarget.getAttribute('type');
            var link = player.links[id];
            if(link && link.type) {
              switch(link.type) {
                case 'web':
                  if (!/^http/.test(link.value)) return;
                  if(link.target == 'blank') {
                    window.open(link.value, '_blank');
                  }
                  else {
                    window.open(link.value, '_self');
                  }
                  break;
                case 'tel':
                  window.open('tel:' + link.value);
                  break;
                case 'page':
                  player.setCurrentPage(link.value);
                  break;
              }
            }

            if(type == 'submit') {
              var result = {
                id: '',
                data: []
              };
              var elems = player.currentPage.find('.element');
              for(var i = 0; i < elems.length; i++) {
                var elem = $(elems[i]);
                switch(elem.attr('type')) {
                  case 'input':
                    var input = elem.find('textarea');
                    var label = input.attr('label');
                    if(!input.val()) {
                      alert(label + '不能为空');
                      return;
                    }
                    switch(input.attr('target')) {
                      case 'name':
                        break;
                      case 'email':
                        var re = /\S+@\S+\.\S+/;
                        if(!re.test(input.val())) {
                          alert('邮箱格式错误');
                          return;
                        }
                        break;
                      case 'mobile':
                        if(!/^\d{11}$/.test(input.val())) {
                          alert('手机号码格式错误');
                          return;
                        }
                        break;
                    }
                    result.data.push({
                      key: label,
                      value: input.val()
                    });
                    break;
                  case 'rating':
                    break;
                  case 'singleselect':
                    var v = elem.find('input:checked').val();
                    if(!v) {
                      alert('请填写表单');
                      return;
                    }
                    var obj = {};
                    break;
                  case 'multiselect':
                    var selected = elem.find("input:checked");
                    if(selected.length == 0) {
                      alert('请填写表单');
                      return;
                    }
                    break;
                }
              }
            }
          });
        },
        addPage: function (pageData, noAnimation) {
          var html = player.page.build(pageData, player.width, player.height);
          player.content.append($(html));

          if(noAnimation) return;

          var timeline = player.page.buildPageCss3Timeline(pageData);
          player.timelines[pageData.id] = timeline;
        },
        addElement: function(pageId, elementData) {
          var html = player.page.buildElement(elementData);
          player.content.find("#" + pageId).find('.viewport').append($(html));
        },
        setCurrentPage: function(pageId) {
          if(!pageId) return;

          if(player.currentPage) {
            player.currentPage.removeClass('current');
            player.timelines[player.currentPage.attr('id')].clear();
          }
          player.currentPage = player.wrapper.find('#' + pageId);
          player.currentPage.addClass("current");
          //player.timelines[pageId].clear();
          player.timelines[pageId].play();
        }
      },

      events: [
        {name: 'startLoad', from: 'none', to: 'load_state'},
        {name: 'startPlay', from: 'load_state', to: 'play_state'},
        {name: 'startPlay', from: 'preview_state', to: 'play_state'},
        {name: 'userInputStart', from: 'play_state', to: 'userInput_state'},
        {name: 'userInputStart', from: 'userInput_state', to: 'play_state'},


        {name: 'startEdit', from: 'none', to: 'edit_state'},
        {name: 'startPreview', from: 'none', to: 'preview_state'}

      ],

      callbacks: {

        onedit_state: function (event, from, to) {
          Player.initPage(player);
          Player.initTurn(player);
          Player.initTransformManager(player);
        },

        onpreview_state: function (event, from, to) {
          Player.initPage(player);
          Player.initTurn(player);

          player.buildPage(theData);

          player.buildMusic(theData.properties.music);

          player.buildTurn(theData.properties.turnType);

          player.buildLinks(theData);

          player.setCurrentPage(player.firstPageId);

          player.startPlay();
        },

        onload_state: function (event, from, to) {
          Player.initPage(player);
          Player.initTurn(player);

          var _init = function() {
            $('#loader').hide();

            player.buildPage(theData);

            player.buildMusic(theData.properties.music);

            player.buildTurn(theData.properties.turnType);

            player.buildLinks(theData);

            player.setCurrentPage(player.firstPageId);

            player.startPlay();
          };

          if(typeof theData == 'string') {
            //player.loader.show();
            $.ajax({
              type: 'GET',
              url: theData,
              success: function(data){
                theData = data;
                _init();
              },
              error: function(xhr, type){
              }
            });
          }
          else {
            _init();
          }

        },
        onleaveload_state: function (event, from, to) {
        },

        onplay_state: function (event, from, to) {
          player.buildTurn(theData.properties.turnType);
        },
        onleaveplay_state: function (event, from, to) {
        },

        onuserInput_state: function (event, from, to) {
        },
        onleaveuserInput_state: function (event, from, to) {
        },

        onchangestate: function (event, from, to) {
        }
      }
    });

    player.init();

    return player;
  };
})();

