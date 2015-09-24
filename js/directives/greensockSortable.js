

var shadow1 = "none" || "0 1px 3px  0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.6)";
var shadow2 = "0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 2px 2px 0 rgba(0, 0, 0, 0.2)";

angular.module('app').directive('sortable', ['$rootScope', '$timeout', '$parse', 'xssList', function ($rootScope, $timeout, $parse, xssList) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      pages: '=',
      options: '='
    },
    link: function ($scope, elem, attrs, controller) {
      var rowSize   = $scope.options.height || 180;
      var colSize   = 90;
      var gutter    = $scope.options.gutter || 7;
      var singleWidth = $scope.options.width || colSize * 2;

      var threshold = "50%";
      var zIndex = 1000;
      var colCount   = null;
      var rowCount   = null;
      var gutterStep = null;

      var pages = $scope.pages;
      var $list = $(elem);
      var tiles  = $list[0].getElementsByClassName("tile"); // Live node list of tiles

      if (typeof $scope.options.buildItem != 'function') return;

      if ($scope.options.preview) {
        $scope.$on('refreshPreview', function(event, pageId) {
          refresh(pageId);
        });
      }
      $scope.$watchCollection('pages', function(newValue, oldValue) {
        if (!newValue || !oldValue) return;
        if (newValue === oldValue) return;
        if (newValue.length === oldValue.length) return;

        function arr_diff(a1, a2) {
          var a = {}, diff = [];
          for (var i = 0; i < a1.length; i++) {
            a[a1[i].id] = a1[i];
          }
          for (var i = 0; i < a2.length; i++) {
            if (a[a2[i].id]) delete a[a2[i].id];
            else a[a2[i].id] = a2[i];
          }
          for (var k in a) {
            diff.push(a[k]);
          }
          return diff;
        }

        if (newValue.length > oldValue.length) {
          // 元素增加
          var addedPageData = arr_diff(oldValue, newValue);
          for (var i = 0; i < addedPageData.length; i++) {
            var index = newValue.indexOf(addedPageData[i]);
            createTile(addedPageData[i], oldValue.length + i, tiles[index - 1]);
          }
          changeIndex();
        } else {
          // 元素减少
          var removedPageData = arr_diff(newValue, oldValue);
          for (var i = 0; i < removedPageData.length; i++) {
            removeTile(removedPageData[i]);
          }
        }
      });

      init();

      function init() {
        var width = singleWidth;
        colSize = singleWidth;

        resize();

        for (var i = 0; i < pages.length; i++) {
          createTile(pages[i], i);
        }
        changeIndex();
      }

      function resize() {
        colCount   = 1;
        rowCount   = 0;
        gutterStep = gutter;
        layoutInvalidated();
      }

      function changePosition(from, to, rowToUpdate) {
        var $tiles = $list.find(".tile");
        var insert = from > to ? "insertBefore" : "insertAfter";

        // Change DOM positions
        $tiles.eq(from)[insert]($tiles.eq(to));
        layoutInvalidated(rowToUpdate);
      }

      function changeIndex() {
        var $tiles = $list.find('.tile');
        for (var i = 0; i < $tiles.length; i++) {
          var $index = $tiles.eq(i).find('.tile-index');
          if ($index) {
            $index.text(i + 1);
          }
        }
      }

      function onUp(tile) {
        var length = tiles.length - 1;
        var index = tile.index;
        if (index == 0) return;
        changePosition(index, index - 1);
        if (typeof $scope.options.onUp == 'function') $scope.options.onUp(tile, tiles[index -1]);
      }
      function onDown(tile) {
        var length = tiles.length - 1;
        var index = tile.index;
        if (index == length) return;
        changePosition(index, index + 1);
        if (typeof $scope.options.onDown == 'function') $scope.options.onDown(tile, tiles[index + 1]);
      }

      function createTile(data, index, relativeElement) {
        var colspan = 1;
        var element = $("<li></li>").addClass("tile").html($scope.options.buildItem(data, index));
        var lastX   = 0;

        var _drag = Draggable.create(element, {
          type        : 'y',
          onDragStart : onDragStart,
          onDrag      : onDrag,
          onDragEnd   : onRelease,
          // onPress     : onPress,
          zIndexBoost : false
        });

        // NOTE: Leave rowspan set to 1 because this demo
        // doesn't calculate different row heights
        var tile = {
          _drag      : _drag,
          _data      : data,
          col        : null,
          colspan    : colspan,
          element    : element,
          height     : 0,
          inBounds   : true,
          index      : null,
          isDragging : false,
          lastIndex  : null,
          newTile    : true,
          positioned : false,
          row        : null,
          rowspan    : 1,
          width      : 0,
          x          : 0,
          y          : 0
        };

        // Add tile properties to our element for quick lookup
        element[0].tile = tile;
        element.on('mouseenter', function() {
          if (!$list.hasClass('dragging')) {
            element.addClass('hover');
          }
        }).on('mouseleave', function() {
          if (!$list.hasClass('dragging')) {
            element.removeClass('hover');
          }
        }).on('click', function() {
          if (typeof $scope.options.onClick == 'function') {
            $scope.options.onClick(data, event);
          }
        });

        element.find('.tile-up').on('click', function() {
          onUp(tile);
          return false;
        });
        element.find('.tile-down').on('click', function() {
          onDown(tile);
          return false;
        });
        element.find('.tile-remove').on('click', function() {
          if (typeof $scope.options.onRemove == 'function') $scope.options.onRemove(tile);
          return false;
        });
        element.find('.tile-span').on('click', function() {
          if (typeof $scope.options.onClickSpan == 'function') $scope.options.onClickSpan(tile);
          return false;
        });

        if ($scope.options.enableFocus) {
          var $input = $('<input type="email" />').addClass('hidden-input');
          element.append($input);
          element.on('click.foucs', function() {
            if (!$input.is(':focus')) {
              $input.focus();
            }
          });
          $input.on('focus', function() {
            element.addClass('tile_focus');
            if (typeof $scope.options.onFocus == 'function') $scope.options.onFocus();
            if ($scope.options.enableKeyNav) bindKeyUpDown();
          }).on('blur', function() {
            element.removeClass('tile_focus');
            if (typeof $scope.options.onBlur == 'function') $scope.options.onBlur();
            unbindKeyUpDown();
          });
        }

        function bindKeyUpDown() {
          $(document).on('keydown.sortable', function(e) {
            var evt = e || window.event;
            var key = evt.keyCode;
            var index = $(tiles).toArray().indexOf(element[0]);
            if (index == -1) return;
            // keyup
            if (key == 38) {
              if (index == 0) return;
              $(tiles[index -1]).click();
            }
            // keydown
            if (key == 40) {
              if (index == tiles.length - 1) return;
              $(tiles[index + 1]).click();
            }
          });
        }
        function unbindKeyUpDown() {
          $(document).off('keydown.sortable');
        }

        if (relativeElement) {
          $(element).insertAfter(relativeElement);
        } else {
          $list.append(element);
        }

        layoutInvalidated();

        function onPress() {
          lastX = this.x;
          tile.isDragging = true;
          tile.lastIndex  = tile.index;

          TweenLite.to(element, 0.2, {
            autoAlpha : 0.75,
            boxShadow : shadow2,
            scale     : 0.95,
            zIndex    : "+=1000"
          });
        }
        function onDragStart() {
          $list.addClass('dragging');
        }

        function onDrag() {
          onPress();
          // Move to end of list if not in bounds
          if (!this.hitTest($list, 0)) {
            tile.inBounds = false;
            changePosition(tile.index, tiles.length - 1);
            return;
          }

          tile.inBounds = true;

          for (var i = 0; i < tiles.length; i++) {

            // Row to update is used for a partial layout update
            // Shift left/right checks if the tile is being dragged
            // towards the the tile it is testing
            var testTile    = tiles[i].tile;
            var onSameRow   = (tile.row === testTile.row);
            var rowToUpdate = onSameRow ? tile.row : -1;
            var shiftLeft   = onSameRow ? (this.x < lastX && tile.index > i) : true;
            var shiftRight  = onSameRow ? (this.x > lastX && tile.index < i) : true;
            var validMove   = (testTile.positioned && (shiftLeft || shiftRight));

            if (this.hitTest(tiles[i], threshold) && validMove) {
              changePosition(tile.index, i, rowToUpdate);
              break;
            }
          }

          lastX = this.x;
        }
        function onRelease() {
          $list.removeClass('dragging');
          // Move tile back to last position if released out of bounds
          this.hitTest($list, 0)
            ? layoutInvalidated()
            : changePosition(tile.index, tile.lastIndex);

          TweenLite.to(element, 0.2, {
            autoAlpha : 1,
            boxShadow: shadow1,
            scale     : 1,
            x         : tile.x,
            y         : tile.y,
            zIndex    : ++zIndex,
            onComplete: function() {
              changeIndex();
              if (typeof $scope.options.onChange == 'function') {
                $scope.options.onChange($tiles);
              }
            }
          });
          var $tiles = $list.find('.tile');
          $tiles.removeClass('tile-first tile-last');
          $tiles.eq(0).addClass('tile-first');
          $tiles.eq($tiles.length - 1).addClass('tile-last');

          tile.isDragging = false;
        }
      }

      function removeTile(data) {
        var tile;
        for (var i = 0; i < tiles.length; i++) {
          if (tiles[i].tile._data == data) {
            tile = tiles[i].tile;
          }
        }
        if (!tile) return;

        var element = tile.element;
        tile._drag[0].kill();
        element.off('mouseleave mouseenter click');
        element.find('input').off('focus blur');
        element.remove();
        layoutInvalidated();
        changeIndex();
      }

      function refresh(pageId) {
        if (typeof $scope.options.onRefresh != 'function') return;
        var element = $list.find('#' + pageId).closest('.tile');
        var pageData, index;
        for (var i = 0; i < pages.length; i++) {
          if (pages[i].id == pageId) {
            pageData = pages[i];
            index = i;
            break;
          }
        }
        if (!pageData) {
          console.log('lack of pageData ... return ...');
          return;
        }
        $scope.options.onRefresh(element, pageData);
        changeIndex();
      }

      function layoutInvalidated(rowToUpdate) {
        var timeline = new TimelineMax();
        var partialLayout = (rowToUpdate > -1);

        var height = 0;
        var col    = 0;
        var row    = 0;
        var time   = 0.35;

        var $tiles = $list.find(".tile");
        $tiles.each(function(index, element) {

          var tile    = this.tile;
          var oldRow  = tile.row;
          var oldCol  = tile.col;
          var newTile = tile.newTile;

          // PARTIAL LAYOUT: This condition can only occur while a tile is being
          // dragged. The purpose of this is to only swap positions within a row,
          // which will prevent a tile from jumping to another row if a space
          // is available. Without this, a large tile in column 0 may appear
          // to be stuck if hit by a smaller tile, and if there is space in the
          // row above for the smaller tile. When the user stops dragging the
          // tile, a full layout update will happen, allowing tiles to move to
          // available spaces in rows above them.
          if (partialLayout) {
            row = tile.row;
            if (tile.row !== rowToUpdate) return;
          }

          // Update trackers when colCount is exceeded
          if (col + tile.colspan > colCount) {
            col = 0; row++;
          }

          $.extend(tile, {
            col    : col,
            row    : row,
            index  : index,
            x      : col * gutterStep + (col * colSize),
            y      : row * gutterStep + (row * rowSize),
            width  : colSize,
            height : rowSize
          });

          col += tile.colspan;

          // If the tile being dragged is in bounds, set a new
          // last index in case it goes out of bounds
          if (tile.isDragging && tile.inBounds) {
            tile.lastIndex = index;
          }

          if (newTile) {

            // Clear the new tile flag
            tile.newTile = false;

            var from = {
              autoAlpha : 0.5,
              boxShadow : shadow1,
              height    : tile.height,
              scale     : 1,
              width     : tile.width
            };

            var to = {
              autoAlpha : 1,
              scale     : 1,
              zIndex    : zIndex
            }
            timeline.fromTo(element, time, from, to, "reflow");
          }

          // Don't animate the tile that is being dragged and
          // only animate the tiles that have changes
          if (!tile.isDragging && (oldRow !== tile.row || oldCol !== tile.col)) {

            var duration = newTile ? 0 : time;

            // Boost the z-index for tiles that will travel over
            // another tile due to a row change
            if (oldRow !== tile.row) {
              timeline.set(element, { zIndex: ++zIndex }, "reflow");
            }

            timeline.to(element, duration, {
              x : tile.x,
              y : tile.y,
              onComplete : function() { tile.positioned = true; },
              onStart    : function() { tile.positioned = false; }
            }, "reflow");
          }
        });

        if (row !== rowCount) {
          rowCount = row;
          height   = rowCount * gutterStep + (++row * rowSize);
          timeline.to($list, 0.2, { height: height }, "reflow");
        }
      }
    }
  }
}]);






