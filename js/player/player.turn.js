"use strict";

(function () {

  window.Player.initTurn = function(player) {
    var _nextPage;
    var _startX = 0;
    var _startY = 0;
    var _snapping = false;
    var _turn;
    var _turnType;
    var _currentTurnConfig;

    var _resetCss = function () {
      TweenLite.set(player.currentPage, { css: {
        transformPerspective:0,
        backfaceVisibility: "visible",
        WebkitBackfaceVisibility: "visible"
      }});
      TweenLite.set(_nextPage, { css: {
        transformPerspective:0,
        backfaceVisibility: "visible",
        WebkitBackfaceVisibility: "visible"
      }});
    };

    var _config = {
      "overwrite": {
        name: 'overwrite',
        up: {
          require: 'page-bottom',
          currentPage: {
            startCss: {
              top: 0
            },
            endCss: {
              top: 0
            },
            turningCss: function (offsetX, offsetY) {
              return {};
            }
          },
          nextPage: {
            startCss: {
              top: player.height + 'px'
            },
            endCss: {
              top: 0
            },
            turningCss: function (offsetX, offsetY) {
              return {top: player.height + offsetY}
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            return Player.utils.between(offsetY, -player.height * 0.1, 0);
          }
        },
        down: {
          require: 'page-top',
          currentPage: {
            startCss: {
              top: 0
            },
            endCss: {
              top: 0
            },
            turningCss: function (offsetX, offsetY) {
              return {}
            }
          },
          nextPage: {
            startCss: {
              top: -player.height + 'px'
            },
            endCss: {
              top: 0
            },
            turningCss: function (offsetX, offsetY) {
              return {top: -player.height + offsetY}
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            return Player.utils.between(offsetY, 0, player.height * 0.1);
          }
        },
        left: {
          require: 'page-right',
          currentPage: {
            startCss: {
              left: 0
            },
            endCss: {
              left: 0
            },
            turningCss: function (offsetX, offsetY) {
              return {}
            }
          },
          nextPage: {
            startCss: {
              left: player.width + 'px'
            },
            endCss: {
              left: 0
            },
            turningCss: function (offsetX, offsetY) {
              return {left: player.width + offsetX}
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            return Player.utils.between(offsetX, -player.width * 0.1, 0);
          }
        },
        right: {
          require: 'page-left',
          currentPage: {
            startCss: {
              left: 0
            },
            endCss: {
              left: 0
            },
            turningCss: function (offsetX, offsetY) {
              return {}
            }
          },
          nextPage: {
            startCss: {
              left: -player.width + 'px'
            },
            endCss: {
              left: 0
            },
            turningCss: function (offsetX, offsetY) {
              return {left: -player.width + offsetX}
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            return Player.utils.between(offsetX, 0, player.width * 0.1);
          }
        }
      },
      "move": {
        name: 'move',
        up: {
          require: 'page-bottom',
          currentPage: {
            startCss: {
              top: 0
            },
            endCss: {
              top: -player.height + 'px'
            },
            turningCss: function (offsetX, offsetY) {
              return {top: offsetY}
            }
          },
          nextPage: {
            startCss: {
              top: player.height + 'px'
            },
            endCss: {
              top: 0
            },
            turningCss: function (offsetX, offsetY) {
              return {top: player.height + offsetY}
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            return Player.utils.between(offsetY, -player.height * 0.1, 0);
          }
        },
        down: {
          require: 'page-top',
          currentPage: {
            startCss: {
              top: 0
            },
            endCss: {
              top: player.height + 'px'
            },
            turningCss: function (offsetX, offsetY) {
              return {top: offsetY}
            }
          },
          nextPage: {
            startCss: {
              top: -player.height + 'px'
            },
            endCss: {
              top: 0
            },
            turningCss: function (offsetX, offsetY) {
              return {top: -player.height + offsetY}
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            return Player.utils.between(offsetY, 0, player.height * 0.1);
          }
        },
        left: {
          require: 'page-right',
          currentPage: {
            startCss: {
              left: 0
            },
            endCss: {
              left: -player.width + 'px'
            },
            turningCss: function (offsetX, offsetY) {
              return {left: offsetX}
            }
          },
          nextPage: {
            startCss: {
              left: player.width + 'px'
            },
            endCss: {
              left: 0
            },
            turningCss: function (offsetX, offsetY) {
              return {left: player.width + offsetX}
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            return Player.utils.between(offsetX, -player.width * 0.1, 0);
          }
        },
        right: {
          require: 'page-left',
          currentPage: {
            startCss: {
              left: 0
            },
            endCss: {
              left: player.width + 'px'
            },
            turningCss: function (offsetX, offsetY) {
              return {left: offsetX}
            }
          },
          nextPage: {
            startCss: {
              left: -player.width + 'px'
            },
            endCss: {
              left: 0
            },
            turningCss: function (offsetX, offsetY) {
              return {left: -player.width + offsetX}
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            return Player.utils.between(offsetX, 0, player.width * 0.1);
          }
        }
      },
      "rotate": {
        name: 'rotate',
        up: {
          require: 'page-bottom',
          currentPage: {
            startCss: {
              transformPerspective:600,
              rotationX: 0
            },
            endCss: {
              rotationX: 180,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            },
            turningCss: function (offsetX, offsetY) {
              return {
                rotationX: -offsetY,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              }
            }
          },
          nextPage: {
            startCss: {
              transformPerspective:600,
              rotationX: -180
            },
            endCss: {
              rotationX: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            },
            turningCss: function (offsetX, offsetY) {
              return {
                rotationX: -180 - offsetY,
                backfaceVisibility:"hidden",
                WebkitBackfaceVisibility:"hidden"
              }
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            var angle = (offsetY + 360) % 360;
            return Player.utils.between(angle, 0, 90) || Player.utils.between(angle, 270, 360);
          }
        },
        down: {
          require: 'page-top',
          currentPage: {
            startCss: {
              transformPerspective:600,
              rotationX: 0
            },
            endCss: {
              rotationX: -180,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            },
            turningCss: function (offsetX, offsetY) {
              return {
                rotationX: -offsetY,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              }
            }
          },
          nextPage: {
            startCss: {
              transformPerspective:600,
              rotationX: -180
            },
            endCss: {
              rotationX: -360,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            },
            turningCss: function (offsetX, offsetY) {
              return {
                rotationX: -180 - offsetY,
                backfaceVisibility:"hidden",
                WebkitBackfaceVisibility:"hidden"
              }
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            var angle = (offsetY + 360) % 360;
            return Player.utils.between(angle, 0, 90) || Player.utils.between(angle, 270, 360);
          }
        },
        left: {
          require: 'page-right',
          currentPage: {
            startCss: {
              transformPerspective:600,
              rotationY: 0
            },
            endCss: {
              rotationY: -180,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            },
            turningCss: function (offsetX, offsetY) {
              return {
                rotationY: offsetX,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              }
            }
          },
          nextPage: {
            startCss: {
              transformPerspective:600,
              rotationY: 180
            },
            endCss: {
              rotationY: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            },
            turningCss: function (offsetX, offsetY) {
              return {
                rotationY: 180 + offsetX,
                backfaceVisibility:"hidden",
                WebkitBackfaceVisibility:"hidden"
              }
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            var angle = (offsetX + 360) % 360;
            return Player.utils.between(angle, 0, 90) || Player.utils.between(angle, 270, 360);
          }
        },
        right: {
          require: 'page-left',
          currentPage: {
            startCss: {
              transformPerspective:600,
              rotationY: 0
            },
            endCss: {
              rotationY: 180,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            },
            turningCss: function (offsetX, offsetY) {
              return {
                rotationY: offsetX,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              }
            }
          },
          nextPage: {
            startCss: {
              transformPerspective:600,
              rotationY: -180
            },
            endCss: {
              rotationY: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            },
            turningCss: function (offsetX, offsetY) {
              return {
                rotationY: -180 + offsetX,
                backfaceVisibility:"hidden",
                WebkitBackfaceVisibility:"hidden"
              }
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            var angle = (offsetX + 360) % 360;
            return Player.utils.between(angle, 0, 90) || Player.utils.between(angle, 270, 360);
          }
        }
      },
      "scale": {
        name: 'scale',
        // offsetY为负数
        up: {
          require: 'page-bottom',
          currentPage: {
            startCss: {
              scaleX: 1,
              y: 0
            },
            endCss: {
              scaleX: 0.5,
              y: -player.height * 0.3
            },
            turningCss: function (offsetX, offsetY) {
              var scale = 1 + offsetY / player.height * 0.5;
              var y = offsetY * 0.3;
              return {
                scaleX: scale,
                y: y
              };
            }
          },
          nextPage: {
            startCss: {
              scaleX: 1,
              y: player.height
            },
            endCss: {
              scaleX: 1,
              y: 0
            },
            turningCss: function (offsetX, offsetY) {
              var y = (1 + offsetY / player.height) * player.height;
              return {
                y: y
              }
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            return Player.utils.between(offsetY, -player.height * 0.1, 0);
          }
        },
        // offsetY为正数
        down: {
          require: 'page-top',
          currentPage: {
            startCss: {
              scaleX: 1,
              y: 0
            },
            endCss: {
              scaleX: 0.5,
              y: player.height * 0.3
            },
            turningCss: function (offsetX, offsetY) {
              var scale = 1 - offsetY / player.height * 0.5;
              var y = offsetY * 0.3;
              return {
                scaleX: scale,
                y: y
              };
            }
          },
          nextPage: {
            startCss: {
              scaleX: 1,
              y: -player.height
            },
            endCss: {
              scaleX: 1,
              y: 0
            },
            turningCss: function (offsetX, offsetY) {
              var y = -(1 - offsetY / player.height) * player.height;
              return {
                y: y
              }
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            return Player.utils.between(offsetY, player.height * 0.1, 0);
          }
        }
      },
      "cubic": {
        name: 'cubic',
        duration: 0.4,
        // offsetY为负数
        up: {
          require: 'page-bottom',
          currentPage: {
            startCss: {
              y: 0,
              z: 0,
              rotationX: 0,
              transformPerspective:600,
            },
            endCss: {
              y: -243,
              z: 243,
              rotationX: 90
            },
            turningCss: function (offsetX, offsetY) {
              var translateY = offsetY / player.height * 243
              var translateZ = -offsetY / player.height * 243;
              var rotationX = -offsetY / player.height * 90;
              return {
                y: translateY,
                z: translateZ,
                rotationX: rotationX
              };
            }
          },
          nextPage: {
            startCss: {
              y: 243,
              z: 243,
              rotationX: -90,
              transformPerspective:600,
            },
            endCss: {
              y: 0,
              z: 0,
              rotationX: 0
            },
            turningCss: function (offsetX, offsetY) {
              var translateY = (1 + offsetY / player.height) * 243;
              var translateZ = (1 + offsetY / player.height) * 243;
              var rotationX = (offsetY / player.height) * 90;
              return {
                y: translateY,
                z: translateZ,
                rotationX: rotationX
              };
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            return Player.utils.between(offsetY, -player.height * 0.1, 0);
          }
        },
        // offsetY为正数
        down: {
          require: 'page-top',
          currentPage: {
            startCss: {
              y: -243,
              z: 0,
              rotationX: 0
            },
            endCss: {
              y: 0,
              z: 243,
              rotationX: -90
            },
            turningCss: function (offsetX, offsetY) {
              var translateY = offsetY / player.height * 243
              var translateZ = -offsetY / player.height * 243;
              var rotationX = -offsetY / player.height * 90;
              return {
                y: translateY,
                z: translateZ,
                rotationX: rotationX
              };
            }
          },
          nextPage: {
            startCss: {
              transform: 'rotateX(90deg) translateY(-243px) translateZ(243px)',
              // translateY: -243,
              // translateZ: 243,
              // rotationX: 90
            },
            endCss: {
              transform: 'rotateX(0deg) translateY(0px) translateZ(0px)',
              // translateY: 0,
              // translateZ: 0,
              // rotationX: 0
            },
            turningCss: function (offsetX, offsetY) {
              var translateY = -(1 - offsetY / player.height) * 243;
              var translateZ = (1 - offsetY / player.height) * 243
              var rotationX = (1 - offsetY / player.height) * 90;
              return {
                transform: 'rotateX(' + rotationX + 'deg) translateY(' + translateY + 'px) translateZ(' + translateZ + 'px)',
                // translateY: translateY,
                // translateZ: translateZ,
                // rotationX: rotationX
              };
            }
          },
          goBackCondition: function (offsetX, offsetY) {
            return Player.utils.between(offsetY, player.height * 0.1, 0);
          }
        }
      }
      // "push": {
      //   name: 'push',
      //   duration: 0.6,
      //   // offsetY为负数
      //   up: {
      //     require: 'page-bottom',
      //     currentPage: {
      //       startCss: {
      //         transformOrigin: '50% 0 50%',
      //         opacity: 1,
      //         rotationX: 0
      //       },
      //       endCss: {
      //         opacity: 0.3,
      //         rotationX: -90
      //       },
      //       turningCss: function (offsetX, offsetY) {
      //         var opacity = 1 + offsetY / player.height * 0.7;
      //         var rotationX = -offsetY / player.height * 90;
      //         return {
      //           opacity: opacity,
      //           rotationX: rotationX
      //         };
      //       }
      //     },
      //     nextPage: {
      //       startCss: {
      //         rotationX: 0,
      //         transformOrigin: '50% 50%',
      //         opacity: 0.7,
      //         y: player.height
      //       },
      //       endCss: {
      //         rotationX: 0,
      //         opacity: 1,
      //         y: 0
      //       },
      //       turningCss: function (offsetX, offsetY) {
      //         var y = (1 + offsetY / player.height) * player.height;
      //         var opacity = -offsetY / player.height * 0.3 + 0.7;
      //         return {
      //           y: y,
      //           opacity: opacity
      //         }
      //       }
      //     },
      //     goBackCondition: function (offsetX, offsetY) {
      //       return Player.utils.between(offsetY, -player.height * 0.1, 0);
      //     }
      //   },
      //   // offsetY为正数
      //   down: {
      //     require: 'page-top',
      //     currentPage: {
      //       startCss: {
      //         transformOrigin: '50% 0 50%',
      //         opacity: 1,
      //         rotationX: 0
      //       },
      //       endCss: {
      //         opacity: 0.3,
      //         rotationX: 90
      //       },
      //       turningCss: function (offsetX, offsetY) {
      //         var opacity = 1 - offsetY / player.height * 0.7;
      //         var rotationX = offsetY / player.height * 90;
      //         return {
      //           opacity: opacity,
      //           rotationX: rotationX
      //         };
      //       }
      //     },
      //     nextPage: {
      //       startCss: {
      //         transformOrigin: '50% 50%',
      //         opacity: 0.7,
      //         rotationX: 0,
      //         y: -player.height
      //       },
      //       endCss: {
      //         rotationX: 0,
      //         opacity: 1,
      //         y: 0
      //       },
      //       turningCss: function (offsetX, offsetY) {
      //         var y = -(1 - offsetY / player.height) * player.height;
      //         var opacity = offsetY / player.height * 0.3 + 0.7;
      //         return {
      //           y: y,
      //           opacity: opacity
      //         }
      //       }
      //     },
      //     goBackCondition: function (offsetX, offsetY) {
      //       return Player.utils.between(offsetY, player.height * 0.1, 0);
      //     }
      //   }
      // }
    };

    var _init = function (turnType, direction) {
      if(_turnType == turnType)
        return;

      if(!_config[turnType]) {
        console.error('wrong turnType', turnType);
        return;
      }

      _turnType = turnType;

      if (_turn)
        return;

      direction = direction || 'y';

      _turn = Draggable.create(player.dragProxy, {
        type: direction,
        lockAxis: true,
        trigger: player.wrapper,
        zIndexBoost: false,
        onDragStart: function () {

          _startX = this.x;
          _startY = this.y;

          if (_snapping) {
            this.endDrag();
            return;
          }

          _currentTurnConfig = _config[_turnType][this.getDirection()];

          if (!player.currentPage.attr(_currentTurnConfig.require)) {
            this.endDrag();
            return;
          }

          _nextPage = $('#' + player.currentPage.attr(_currentTurnConfig.require));
          _nextPage.addClass('next');

          TweenLite.set(_nextPage, {css: _currentTurnConfig.nextPage.startCss});
          TweenLite.set(player.currentPage, {css: _currentTurnConfig.currentPage.startCss});
        },
        onDrag: function () {
          var offsetX = this.x - _startX;
          var offsetY = this.y - _startY;

          TweenLite.set(_nextPage, {
            css: _currentTurnConfig.nextPage.turningCss(offsetX, offsetY)
          });
          TweenLite.set(player.currentPage, {
            css: _currentTurnConfig.currentPage.turningCss(offsetX, offsetY)
          });
        },
        onDragEnd: function () {

          if (this.x == _startX && this.y == _startY) {
            return;
          }

          var offsetX = this.endX - _startX;
          var offsetY = this.endY - _startY;
          _snapping = true;

          var duration = _currentTurnConfig.duration || 0.45;

          if (_currentTurnConfig.goBackCondition(offsetX, offsetY)) {
            // go back
            TweenLite.to(player.currentPage, 0.45, {
              css: _currentTurnConfig.currentPage.startCss
            });
            TweenLite.to(_nextPage, 0.45, {
              css: _currentTurnConfig.nextPage.startCss,
              onComplete: function () {
                _resetCss();

                _snapping = false;
                _nextPage.removeClass('next');
                _nextPage = null;
              }
            });
          } else {
            // 翻页
            TweenLite.to(player.currentPage, duration, {
              css: _currentTurnConfig.currentPage.endCss,
              ease: Power3.easeOut
            });
            TweenLite.to(_nextPage, duration, {
              css: _currentTurnConfig.nextPage.endCss,
              ease: Power3.easeOut,
              onComplete: function () {
                _resetCss();

                _snapping = false;
                _nextPage.removeClass('next');
                player.setCurrentPage(_nextPage.attr('id'));

                _nextPage = null;
              }
            });
          }
        }
      })[0];
    };

    $.extend(player, {
      turn: {
        init: function (turnType) {
          _init(turnType);
        },
        destroy: function () {

        },
        enable: function () {
          if (_turn)
            _turn.enable();
        },
        disable: function () {
          if (_turn)
            _turn.disable();
        }
      }
    });
  };

})();