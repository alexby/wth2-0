/*
 * IMPORTANT -- please attach element to DOM-tree before apply
 */
(function(jQuery) {
  var methods = {
    init: function(options) {
      return this.each(function() {
        var that = {};
        var $that = jQuery(this);
        this.userTransformation = that;

        var defaults = {
          edit: false, // is user can edit element
          classCommon: "userTransform",
          classResize: "resize", // resize button class name
          classRotate: "rotate", // rotate button class name
          classRemove: "remove", // remove button class name
          classContent: "content", // content element class name
          classFlip: "content", // flipped element class name
          resizeTitle: "resize", // title for resize button
          rotateTitle: "rotate", // title for rotate button
          removeTitle: "remove", // title for remove button
          backObject: "body", // the object to associate events, then user changing element
          design: 1,
          flipContent: true, // flip content when rotate
          useBounds: true, // the bounds parameters to validate move
          rotateable: true, // is user can rotate element
          moveable: true, // is user can move element
          scaleable: true, // is user can resize element
          proportionalScale: false, // save proportions when user resize element
          pos: {}, // current element position data
          movableArea: { // the area where element can be moved
            left: -Number.Infinity,
            top: -Number.Infinity,
            width: Number.Infinity,
            height: Number.Infinity,
            /*
             * TODO: need update to set region dependenced by parent object
             * and add resize event to recalculate values
             * null or false -- use this for no apply
             */
            right: null,
            bottom: null
          },
          minSize: { width:1, height:1 }, // minimal size for element
          maxSize: { width:Number.Infinity, height:Number.Infinity }, // maximal size for element
          originalWidth: null,
          originalHeight: null,
          // when element zooming by mouse, do it from center
          mouseZoomFromCenter: true,
          // working mode
          //  0 - different resize and rotate for mouse and touches for mobile
          //  1 - one button for resize and rotate for desktop and mobile
          workMode: 0,
          useTransform: false,
          deleteButton: false,
          useFontSizeWhileScale: false,
          onUserDetect: function() {},
          onChanging: function(data) {},
          onChanged: function(data) {},
          onRemove: function() {},
          // variables for inner use
          zoomData: {}
        };
        that.params = jQuery.extend(true, defaults, options);
        that.curBounds = {};
        $that.addClass(that.params.classCommon + " utdesign" + that.params.design);

        var getLineLength = function(x1,y1,x2,y2) {
          return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
        };

        $that.css("position", "absolute");

        // the current box's size
        if(typeof(that.params.pos.width) == "undefined") that.params.pos.width = that.params.originalWidth ? that.params.originalWidth : $that.fullWidth();
        if(typeof(that.params.pos.height) == "undefined") that.params.pos.height = that.params.originalHeight ? that.params.originalHeight : $that.fullHeight();
        // the current box's position
        if(typeof(that.params.pos.left) == "undefined") that.params.pos.left = $that.posLeft(); //parseInt($that.position().left);
        if(isNaN(that.params.pos.left)) that.params.pos.left = (that.params.movableArea.width - that.params.pos.width)/2 + that.params.movableArea.left;
        if(typeof(that.params.pos.top) == "undefined") that.params.pos.top = $that.posTop(); //parseInt($that.position().top);
        if(isNaN(that.params.pos.top)) that.params.pos.top = (that.params.movableArea.height - that.params.pos.height)/2 + that.params.movableArea.top;
        // the angle in radians
        if(typeof(that.params.pos.angle) == "undefined") that.params.pos.angle = 0;
        // the original box's size (with scale x1)
        if(that.params.originalWidth === null || that.params.originalWidth === false) that.params.originalWidth = $that.fullWidth();
        if(that.params.originalHeight === null || that.params.originalHeight === false) that.params.originalHeight = $that.fullHeight();
        // scale value for X and Y osis
        if(typeof(that.params.zoomData.zoomX) == "undefined") that.params.zoomData.zoomX = that.params.pos.width/that.params.originalWidth;
        if(typeof(that.params.zoomData.zoomY) == "undefined") that.params.zoomData.zoomY = that.params.pos.height/that.params.originalHeight;

        // get or create rotate button
        if((that._rotate = $that.find("> ."+that.params.classRotate)).length <= 0) {
          that._rotate = jQuery("<div>", {"class": that.params.classRotate, "title":that.params.rotateTitle}).appendTo($that);
        }
        // get or create remove button
        if((that._remove = $that.find("> ."+that.params.classRemove)).length <= 0) {
          if(that.params.deleteButton) that._remove = jQuery("<div>", {"class": that.params.classRemove, "title":that.params.removeTitle}).appendTo($that);
        }
        // get or create resize button if mode = 0
        if(that.params.workMode == 1) {
          that._resize = null;
          that.params.proportionalScale = true;
        } else {
          if((that._resize = $that.find("> ."+that.params.classResize)).length <= 0) {
            that._resize = jQuery("<div>", {"class": that.params.classResize, "title":that.params.resizeTitle}).appendTo($that);
          }
        }
        // get or create content
        if((that._content = $that.find("> ."+that.params.classContent)).length <= 0) {
          that._content = jQuery("<div>", {"class": that.params.classContent}).appendTo($that);
        }
        that._flip = $that.find(that.params.classFlip);

        if(that._remove) {
          that._remove.on("mousedown touchstart", function(e) {
            if(that.params.onRemove) that.params.onRemove.call($that[0]);
            e.stopPropagation();
            e.preventDefault();
            return false;
          });
        }
        if(!that.params.rotateable && that._rotate) that._rotate.css("display", "none");
        if(!that.params.scaleable && that._resize) that._resize.css("display", "none");
        if(!that.params.moveable) $that.css("cursor", "auto");

        that.updateObjectTransformValue = function() {
          $that.css("-webkit-transform", "rotateZ("+that.params.pos.angle+"rad) scaleX("+that.params.zoomData.zoomX+") rotateX(0) scaleY("+that.params.zoomData.zoomY+")")
            .css("-moz-transform", "rotateZ("+that.params.pos.angle+"rad) scaleX("+that.params.zoomData.zoomX+") rotateX(0) scaleY("+that.params.zoomData.zoomY+")")
            .css("-ms-transform", "rotateZ("+that.params.pos.angle+"rad) scaleX("+that.params.zoomData.zoomX+") rotateX(0) scaleY("+that.params.zoomData.zoomY+")")
            .css("-o-transform", "rotateZ("+that.params.pos.angle+"rad) scaleX("+that.params.zoomData.zoomX+") rotateX(0) scaleY("+that.params.zoomData.zoomY+")")
            .css("transform", "rotateZ("+that.params.pos.angle+"rad) scaleX("+that.params.zoomData.zoomX+") rotateX(0) scaleY("+that.params.zoomData.zoomY+")");

          if(that.params.moveable) $that.posLeft(that.params.pos.left).posTop(that.params.pos.top);
          if(that.params.flipContent) that.updateContentAngle();
        };

        that.updateAngle = function() {
          if(that.params.useTransform) that.updateObjectTransformValue();
          else
          {
            $that.css("-webkit-transform", "rotateZ("+that.params.pos.angle+"rad) rotateX(0)")
              .css("-moz-transform", "rotateZ("+that.params.pos.angle+"rad) rotateX(0)")
              .css("-ms-transform", "rotateZ("+that.params.pos.angle+"rad) rotateX(0)")
              .css("-o-transform", "rotateZ("+that.params.pos.angle+"rad) rotateX(0)")
              .css("transform", "rotateZ("+that.params.pos.angle+"rad) rotateX(0)");
            if(that.params.useFontSizeWhileScale) that._content.css("font-size", (Math.min(that.params.zoomData.zoomX,that.params.zoomData.zoomY) * 100) + "%");
          }
          if(that.params.flipContent) that.updateContentAngle();
          that.updatePosition(false);
        };

        that.updateContentAngle = function() {
          var ta = 0;
          var aa = that.params.pos.angle; aa=(aa/(2*Math.PI)-Math.floor(aa/(2*Math.PI)))*(2*Math.PI);
          if(that.params.flipContent && Math.abs(aa) > Math.PI/2 && Math.abs(aa) < 3*Math.PI/2) ta = 180;
          that._flip.css("-webkit-transform", "rotate("+ta+"deg)")
            .css("-moz-transform", "rotate("+ta+"deg)")
            .css("-ms-transform", "rotate("+ta+"deg)")
            .css("-o-transform", "rotate("+ta+"deg)")
            .css("transform", "rotate("+ta+"deg)");
        };

        that.updatePosition = function(update) {
          if(!that.params.moveable) return;
          if(update !== false) {
            // check position
            if(!that.params.useBounds) {
              if(that.params.pos.left < that.params.movableArea.left) that.params.pos.left = that.params.movableArea.left;
              if(that.params.pos.top < that.params.movableArea.top) that.params.pos.top = that.params.movableArea.top;

              if((that.params.pos.left + that.params.pos.width) > (that.params.movableArea.left + that.params.movableArea.width))
                that.params.pos.left = (that.params.movableArea.left + that.params.movableArea.width) - that.params.pos.width;
              if((that.params.pos.top + that.params.pos.height) > (that.params.movableArea.top + that.params.movableArea.height))
                that.params.pos.top = (that.params.movableArea.top + that.params.movableArea.height) - that.params.pos.height;
            }
            // update element position
            if(that.params.useTransform) that.updateObjectTransformValue();
            else {
              $that.posLeft(that.params.pos.left).posTop(that.params.pos.top)
                .width(that.params.pos.width).height(that.params.pos.height);
            }
          }

          if(that.params.useBounds) {
            // get bound for element
            that.curBounds = $that.getBounds(false, $that.parent());

            // check position
            var updatePos = false;
            if(that.curBounds.left < that.params.movableArea.left) {
              that.params.pos.left += that.params.movableArea.left - that.curBounds.left;
              updatePos = true;
            }
            if(that.curBounds.top < that.params.movableArea.top) {
              that.params.pos.top += that.params.movableArea.top - that.curBounds.top;
              updatePos = true;
            }
            if((that.curBounds.left + that.curBounds.width) > (that.params.movableArea.left + that.params.movableArea.width)) {
              that.params.pos.left -= (that.curBounds.left + that.curBounds.width) - (that.params.movableArea.left + that.params.movableArea.width);
              updatePos = true;
            }
            if((that.curBounds.top + that.curBounds.height) > (that.params.movableArea.top + that.params.movableArea.height)) {
              that.params.pos.top -= (that.curBounds.top + that.curBounds.height) - (that.params.movableArea.top + that.params.movableArea.height);
              updatePos = true;
            }
            // update element position
            if(updatePos) {
              if(that.params.useTransform) that.updateObjectTransformValue();
              else {
                $that.posLeft(that.params.pos.left).posTop(that.params.pos.top)
                  .width(that.params.pos.width).height(that.params.pos.height);
              }
              that.curBounds = $that.getBounds(false, $that.parent());
            }
          }
        };

        that.updateZoomValueBySize = function() {
          that.params.zoomData.zoomX = that.params.pos.width / that.params.originalWidth;
          that.params.zoomData.zoomY = that.params.pos.height / that.params.originalHeight;
          that.updateSizeByZoom();
        };

        that.updateSizeByZoom = function() {
          if(that.params.proportionalScale) {
            that.params.zoomData.zoomX = that.params.zoomData.zoomX = (that.params.zoomData.zoomX + that.params.zoomData.zoomY) / 2;
          }
          var ww = that.params.zoomData.zoomX * that.params.originalWidth;
          var hh = that.params.zoomData.zoomY * that.params.originalHeight;

          if(ww < that.params.minSize.width) {
            ww = that.params.minSize.width;
            that.params.zoomData.zoomX = ww / that.params.originalWidth;
            if(that.params.proportionalScale) {
              hh = (that.params.zoomData.zoomY = that.params.zoomData.zoomX) * that.params.originalHeight;
            }
          } else if(ww > that.params.maxSize.width) {
            ww = that.params.maxSize.width;
            that.params.zoomData.zoomX = ww / that.params.originalWidth;
            if(that.params.proportionalScale) {
              hh = (that.params.zoomData.zoomY = that.params.zoomData.zoomX) * that.params.originalHeight;
            }
          }

          if(hh < that.params.minSize.height) {
            hh = that.params.minSize.height;
            that.params.zoomData.zoomY = hh / that.params.originalHeight;
            if(that.params.proportionalScale) {
              ww = (that.params.zoomData.zoomX = that.params.zoomData.zoomY) * that.params.originalWidth;
            }
          } else if(hh > that.params.maxSize.height) {
            hh = that.params.maxSize.height;
            that.params.zoomData.zoomY = hh / that.params.originalHeight;
            if(that.params.proportionalScale) {
              ww = (that.params.zoomData.zoomX = that.params.zoomData.zoomY) * that.params.originalWidth;
            }
          }

          var dx = that.params.mouseZoomFromCenter ? ((that.params.pos.width - ww) / 2) : 0;
          var dy = that.params.mouseZoomFromCenter ? ((that.params.pos.height - hh) / 2) : 0;

          that.params.pos.left += dx;
          that.params.pos.top += dy;
          that.params.pos.width = ww;
          that.params.pos.height = hh;
          that.updatePosition();
        };

        $that.catchUserEvents({
          edit: that.params.edit,
          backObject: that.params.backObject,
          scaleObject: that._resize,
          rotateObject: that._rotate,
          workMode: that.params.workMode,
          onUserDetect: function() {
            try {
              that.params.onUserDetect && that.params.onUserDetect.call($that[0]);
            } catch(e) { window.console && console.log && console.log("!!! exception:", e); }
          },
          onMove: function(dx, dy) {
            if(!that.params.moveable) return;
            that.params.pos.left += dx;
            that.params.pos.top += dy;
            that.updatePosition();
            try {
              that.params.onChanging && that.params.onChanging.call($that[0], that.params.pos);
            } catch(e) { window.console && console.log && console.log("!!! exception:", e); }
          },
          onScale: function(scale, cx, cy) {
            if(!that.params.scaleable || that.params.workMode != 0) return;
            //proportionalScale
            if(typeof(scale.dScale) != "undefined") {
              // processing scale by touch
              that.params.zoomData.zoomX *= scale.dScale;
              that.params.zoomData.zoomY *= scale.dScale;
            } else if(typeof(scale.dx) != "undefined" && typeof(scale.dy) != "undefined") {
              // processing scale by mouse (apply rotation angle)
              // if scale from center -- do double increment for zoom
              var tx = scale.dx * Math.cos(that.params.pos.angle) + scale.dy * Math.sin(that.params.pos.angle);
              var ty = -scale.dx * Math.sin(that.params.pos.angle) + scale.dy * Math.cos(that.params.pos.angle);
              var sx = tx * (that.params.mouseZoomFromCenter ? 2 : 1);
              var sy = ty * (that.params.mouseZoomFromCenter ? 2 : 1);
              that.params.zoomData.zoomX += sx / that.params.originalWidth;
              that.params.zoomData.zoomY += sy / that.params.originalHeight;
            }
            that.updateSizeByZoom();
            try {
              that.params.onChanging && that.params.onChanging.call($that[0], that.params.pos);
            } catch(e) { window.console && console.log && console.log("!!! exception:", e); }
          },
          onRotate: function(angle, cx, cy) {
            if(that.params.scaleable && that.params.workMode == 1) {
              var lorg = Math.sqrt((that.params.originalWidth/2)*(that.params.originalWidth/2) + (that.params.originalHeight/2)*(that.params.originalHeight/2));
              var l2 = Math.sqrt(cx*cx+cy*cy);
              that.params.zoomData.zoomX = l2/lorg;
              that.params.zoomData.zoomY = l2/lorg;
              that.updateSizeByZoom();
            }
            if(!that.params.rotateable) return;
            that.params.pos.angle += angle;
            that.updateAngle();
            try {
              that.params.onChanging && that.params.onChanging.call($that[0], that.params.pos);
            } catch(e) { window.console && console.log && console.log("!!! exception:", e); }
          },
          onUserLeave: function() {
            try {
              that.params.onChanged && that.params.onChanged.call($that[0], that.params.pos);
            } catch(e) { window.console && console.log && console.log("!!! exception:", e); }
          }
        });



        that.view = function() {
          that.params.edit = false;
          $that.catchUserEvents("view", true);
          $that.removeClass("userTransform_edit");
        };
        that.edit = function() {
          that.params.edit = true;
          $that.catchUserEvents("edit", true);
          $that.addClass("userTransform_edit");
        };
        that.breakUserEvents = function() {
          $that.catchUserEvents("breakUserEvents");
        };
        that.changeOptions = function(newOptions) {
          that.params = jQuery.extend(true, that.params, newOptions);
          $that.catchUserEvents("changeOptions", { edit: that.params.edit });

          that._rotate.css("display", (!that.params.rotateable && that._rotate) ? "none" : "");
          that._resize.css("display", (!that.params.scaleable && that._resize) ? "none" : "");
          $that.css("cursor", (!that.params.moveable) ? "auto" : "");

          that.updateContentAngle();
          that.updateAngle();
          that.updateZoomValueBySize();
        };



        that.updateAngle();
        that.updateZoomValueBySize();
        if(that.params.edit) that.edit();

        for(var tmp in that.params.pos) {
          if(that.params.pos[tmp] != options.pos[tmp]) {
            that.params.onChanged && that.params.onChanged.call($that[0], that.params.pos);
            break;
          }
        }

        that.edit();
      });
    },

    edit: function() {
      this.each(function() {
        if(this.userTransformation) this.userTransformation.edit();
      });
      return this;
    },

    view: function() {
      this.each(function() {
        if(this.userTransformation) this.userTransformation.view();
      });
      return this;
    },

    breakUserEvents: function() {
      this.each(function() {
        if(this.userTransformation) this.userTransformation.breakUserEvents();
      });
      return this;
    },

    getContent: function() {
      var res = null;
      this.each(function() {
        if(this.userTransformation) {
          res ? res.add(this.userTransformation._content) : res = jQuery(this.userTransformation._content);
        }
      });
      return res;
    },

    changeOptions: function(options) {
      this.each(function() {
        if(this.userTransformation) this.userTransformation.changeOptions(options);
      });
      return this;
    }
  };

  jQuery.fn.userTransformation = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      methods.init.apply(this, arguments);
    } else {
      jQuery.error('Method ' + method + ' does not exist on jQuery.webdraw');
    }
    return this;
  };
})(jQuery);









(function(jQuery) {
  var methods = {
    init: function(inputOptions) {
      return this.each(function() {
        var that = {};
        var $that = jQuery(this);
        this.catchUserEvents = that;
        var defaults = {
          edit: false,
          startPos: {},
          touchCaptured: 0,
          methodApplyed: false,
          dobleClickTime: 750,
          lastMouseDownTime: 0,
          backObject: null,
          processLeaveMessage: true,
          scaleObject: null,
          rotateObject: null,
          workMode: 0, // 0 - two buttons, 1 - one button
          onMove: function(dx,dy) {},
          onScale: function(scale, cx, cy) {},
          onRotate: function(angle, cx, cy) {},
          onDblClick: function(cx, cy) {},
          onUserDetect: function() {},
          onUserLeave: function() {}
        };
        that.options = jQuery.extend(true, defaults, inputOptions);

        // check background object
        if(!that.options.backObject) that.options.backObject = $that;
        else that.options.backObject = jQuery(that.options.backObject);

        var getLineLength = function(x1,y1,x2,y2) {
          return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
        };
        var getCenterBetweenPoints = function(p1, p2) {
          return (p2-p1)/2 + p1;
        };
        var getAngelInRadian = function(y,x) {
          return Math.atan(y/x) + (x < 0 ? Math.PI : 0);
        };

        /********************************************************************************
         * get cursor coords functions
         ********************************************************************************/

        var getXCoordFromEvent = function(event, num) {
          if(!event) return 0;
          if(event.pageX) return event.pageX;
          if(!event.originalEvent) return 0;
          var touch = event.originalEvent.touches ? event.originalEvent.touches : event.originalEvent.changedTouches;
          return (touch.length == 1 ? touch[num ? num : 0].pageX : 0);
        };
        var getYCoordFromEvent = function(event, num) {
          if(!event) return 0;
          if(event.pageY) return event.pageY;
          if(!event.originalEvent) return 0;
          var touch = event.originalEvent.touches ? event.originalEvent.touches : event.originalEvent.changedTouches;
          return (touch.length == 1 ? touch[num ? num : 0].pageY : 0);
        };

        /********************************************************************************
         * touch events processing
         ********************************************************************************/

        that.onEventTouchStart = function(e) {
//          console.log("that.onEventTouchStart");
          that.options.backObject.off("touchmove", that.onEventTouchMove).on("touchmove", that.onEventTouchMove);
          that.options.backObject.off("touchend", that.onEventTouchEnd).on("touchend", that.onEventTouchEnd);
          that.options.backObject.off("touchcancel", that.onEventTouchEnd).on("touchcancel", that.onEventTouchEnd);
          try {
            that.options.onUserDetect && that.options.onUserDetect.call($that[0]);
          } catch(e) { window.console && console.log && console.log("!!! exception:", e); }

          var touch = e.originalEvent.touches ? e.originalEvent.touches : e.originalEvent.changedTouches;
          // check for double click
          if(touch.length == 1) {
            var curTime = (new Date()).getTime();
            if((curTime - that.options.lastMouseDownTime) < that.options.dobleClickTime) {
              that.options.onDblClick && that.options.onDblClick.call($that[0], touch[0].pageX, touch[0].pageY);
              e.stopPropagation();
              e.preventDefault();
              return false;
            }
            that.options.lastMouseDownTime = curTime;

            // processing move event
            that.options.startPos.x1 = touch[0].pageX;
            that.options.startPos.y1 = touch[0].pageY;
            that.options.touchCaptured = 1;
            e.stopPropagation();
            e.preventDefault();
            return false;
          }

          // processing scale and rotate events
          if(touch.length == 2 && that.options.workMode == 0) {
            that.options.lastMouseDownTime = 0;
            that.options.startPos.x1 = touch[0].pageX;
            that.options.startPos.y1 = touch[0].pageY;
            that.options.startPos.x2 = touch[1].pageX;
            that.options.startPos.y2 = touch[1].pageY;
            that.options.startPos.distance = getLineLength(that.options.startPos.x1,that.options.startPos.y1,that.options.startPos.x2,that.options.startPos.y2);
            that.options.startPos.angle = getAngelInRadian((that.options.startPos.y2 - that.options.startPos.y1),(that.options.startPos.x2 - that.options.startPos.x1));
            that.options.touchCaptured = 2;
            e.stopPropagation();
            e.preventDefault();
            return false;
          }
        };

        that.onEventTouchMove = function(e) {
//          console.log("that.onEventTouchMove");
          if(!that.options.touchCaptured) return;
          that.options.lastMouseDownTime = 0;
          var touch = e.originalEvent.touches ? e.originalEvent.touches : e.originalEvent.changedTouches;

          // processing move event
          if(that.options.touchCaptured == 1) {
            that.options.onMove && that.options.onMove.call($that[0], touch[0].pageX - that.options.startPos.x1, touch[0].pageY - that.options.startPos.y1);
            that.options.startPos.x1 = touch[0].pageX;
            that.options.startPos.y1 = touch[0].pageY;
            e.preventDefault();
            return false;
          }

          // processing scale and rotate events
          if(that.options.touchCaptured == 2) {
            var tcx = getCenterBetweenPoints(touch[0].pageX,touch[1].pageX);
            var tcy = getCenterBetweenPoints(touch[0].pageY,touch[1].pageY);

            var curDistance = getLineLength(touch[0].pageX, touch[0].pageY, touch[1].pageX, touch[1].pageY);
            var newA = getAngelInRadian((touch[1].pageY - touch[0].pageY),(touch[1].pageX - touch[0].pageX));

            that.options.onScale && that.options.onScale.call($that[0], { "dScale": curDistance/that.options.startPos.distance, "angle":newA }, tcx, tcy);
            that.options.onRotate && that.options.onRotate.call($that[0], newA - that.options.startPos.angle, tcx, tcy);

            that.options.startPos.x1 = touch[0].pageX;
            that.options.startPos.y1 = touch[0].pageY;
            that.options.startPos.x2 = touch[1].pageX;
            that.options.startPos.y2 = touch[1].pageY;
            that.options.startPos.distance = curDistance;
            that.options.startPos.angle = newA;
            e.preventDefault();
            return false;
          }
        };

        that.onEventTouchEnd = function(e) {
//          console.log("that.onEventTouchEnd");
          that.options.touchCaptured = 0;
          that.options.backObject.off("touchmove", that.onEventTouchMove);
          that.options.backObject.off("touchend", that.onEventTouchEnd);
          that.options.backObject.off("touchcancel", that.onEventTouchEnd);
          if(e) e.preventDefault();
          that.options.onUserLeave && that.options.onUserLeave.call($that[0]);
        };

        /********************************************************************************
         * mouse move events processing
         ********************************************************************************/

        that.onEventMouseDown = function(e) {
          that.options.backObject.off("mousemove", that.onEventMouseMove).on("mousemove", that.onEventMouseMove);
          that.options.backObject.off("mouseup", that.onEventMouseUp).on("mouseup", that.onEventMouseUp);
          if(that.options.processLeaveMessage) {
            that.options.backObject.off("mouseleave", that.onEventMouseUp).on("mouseleave", that.onEventMouseUp);
          }

          try {
            that.options.onUserDetect && that.options.onUserDetect.call($that[0]);
          } catch(e) { window.console && console.log && console.log("!!! exception:", e); }

          var curTime = (new Date()).getTime();
          if((curTime - that.options.lastMouseDownTime) < that.options.dobleClickTime) {
            that.options.onDblClick && that.options.onDblClick.call($that[0], getXCoordFromEvent(e), getYCoordFromEvent(e));
            e.stopPropagation();
            e.preventDefault();
            return false;
          }
          that.options.lastMouseDownTime = curTime;

          // processing move event
          that.options.startPos.x1 = getXCoordFromEvent(e);
          that.options.startPos.y1 = getYCoordFromEvent(e);
          that.options.touchCaptured = 1;
          e.preventDefault();
          e.stopPropagation();
        };

        that.onEventMouseMove = function(e) {
          if(!that.options.touchCaptured) return;
          that.options.lastMouseDownTime = 0;

          that.options.onMove && that.options.onMove.call($that[0], getXCoordFromEvent(e) - that.options.startPos.x1, getYCoordFromEvent(e) - that.options.startPos.y1);
          that.options.startPos.x1 = getXCoordFromEvent(e);
          that.options.startPos.y1 = getYCoordFromEvent(e);
          e.preventDefault();
        };

        that.onEventMouseUp = function(e) {
          that.options.touchCaptured = 0;
          that.options.backObject.off("mousemove", that.onEventMouseMove);
          that.options.backObject.off("mouseup", that.onEventMouseUp);
          if(that.options.processLeaveMessage)
            that.options.backObject.off("mouseleave", that.onEventMouseUp);
          if(e) e.preventDefault();
          that.options.onUserLeave && that.options.onUserLeave.call($that[0]);
        };

        /********************************************************************************
         * scale button events
         ********************************************************************************/

        that.onEventMouseScaleDown = function(e) {
//          console.log("that.onEventMouseScaleDown");
          that.options.startPos.x1 = getXCoordFromEvent(e);
          that.options.startPos.y1 = getYCoordFromEvent(e);
          that.options.backObject.off("mousemove", that.onEventMouseScaleMove).on("mousemove", that.onEventMouseScaleMove);
          that.options.backObject.off("mouseup", that.onEventMouseScaleUp).on("mouseup", that.onEventMouseScaleUp);
          if(that.options.processLeaveMessage)
            that.options.backObject.off("mouseleave", that.onEventMouseRotateUp).on("mouseleave", that.onEventMouseRotateUp);
          that.options.onUserDetect && that.options.onUserDetect.call($that[0]);
          e.stopPropagation();
          e.preventDefault();
        };

        that.onEventMouseScaleMove = function(e) {
//          console.log("that.onEventMouseScaleMove");
          var cx = ($that.posLeft() + $that.fullWidth()/2);
          var cy = ($that.posTop() + $that.fullHeight()/2);
          var dx = getXCoordFromEvent(e) - that.options.startPos.x1;
          var dy = getYCoordFromEvent(e) - that.options.startPos.y1;
          that.options.onScale && that.options.onScale.call($that[0], { "dx":dx, "dy":dy }, cx, cy);
          that.options.startPos.x1 = getXCoordFromEvent(e);
          that.options.startPos.y1 = getYCoordFromEvent(e);
          e.preventDefault();
        };

        that.onEventMouseScaleUp = function(e) {
//          console.log("that.onEventMouseScaleUp");
          that.options.backObject.off("mousemove", that.onEventMouseScaleMove);
          that.options.backObject.off("mouseup", that.onEventMouseScaleUp);
          if(that.options.processLeaveMessage)
            that.options.backObject.off("mouseleave", that.onEventMouseScaleUp);
          if(e) e.preventDefault();
          that.options.onUserLeave && that.options.onUserLeave.call($that[0]);
        };

        /********************************************************************************
         * rotate button events
         ********************************************************************************/

        that.onEventMouseRotateDown = function(e) {
//          console.log("that.onEventMouseRotateDown");
          var ox = parseInt($that.parent().offset().left) + $that.posLeft();
          var oy = parseInt($that.parent().offset().top) + $that.posTop();
          var cx = getXCoordFromEvent(e) - (ox + $that.fullWidth()/2);
          var cy = getYCoordFromEvent(e) - (oy + $that.fullHeight()/2);
          that.options.startPos.x1 = getXCoordFromEvent(e);
          that.options.startPos.y1 = getYCoordFromEvent(e);
          that.options.startPos.angle = getAngelInRadian(cy,cx);
          if(e.type == "touchstart") {
            that.options.backObject.off("touchmove", that.onEventMouseRotateMove).on("touchmove", that.onEventMouseRotateMove);
            that.options.backObject.off("touchend touchcancel", that.onEventMouseRotateUp).on("touchend touchcancel", that.onEventMouseRotateUp);
          } else {
            that.options.backObject.off("mousemove", that.onEventMouseRotateMove).on("mousemove", that.onEventMouseRotateMove);
            that.options.backObject.off("mouseup", that.onEventMouseRotateUp).on("mouseup", that.onEventMouseRotateUp);
          }
          if(that.options.processLeaveMessage)
            that.options.backObject.off("mouseleave", that.onEventMouseRotateUp).on("mouseleave", that.onEventMouseRotateUp);
          that.options.onUserDetect && that.options.onUserDetect.call($that[0]);
          e.stopPropagation();
          e.preventDefault();
        };

        that.onEventMouseRotateMove = function(e) {
//          console.log("that.onEventMouseRotateMove");
          var ox = parseInt($that.parent().offset().left) + $that.posLeft();
          var oy = parseInt($that.parent().offset().top) + $that.posTop();
          var cx = getXCoordFromEvent(e) - (ox + $that.fullWidth()/2);
          var cy = getYCoordFromEvent(e) - (oy + $that.fullHeight()/2);
          var newA = getAngelInRadian(cy,cx);
          that.options.onRotate && that.options.onRotate.call(that, newA - that.options.startPos.angle, cx, cy);
          that.options.startPos.x1 = getXCoordFromEvent(e);
          that.options.startPos.y1 = getYCoordFromEvent(e);
          that.options.startPos.angle = newA;
          e.preventDefault();
        };

        that.onEventMouseRotateUp = function(e) {
//          console.log("that.onEventMouseRotateUp");
          if(e.type == "touchend" || e.type == "touchcancel") {
            that.options.backObject.off("touchmove", that.onEventMouseRotateMove);
            that.options.backObject.off("touchend touchcancel", that.onEventMouseRotateUp);
          } else {
            that.options.backObject.off("mousemove", that.onEventMouseRotateMove);
            that.options.backObject.off("mouseup", that.onEventMouseRotateUp);
          }
          if(that.options.processLeaveMessage)
            that.options.backObject.off("mouseleave", that.onEventMouseRotateUp);
          if(e) e.preventDefault();
          that.options.onUserLeave && that.options.onUserLeave.call($that[0]);
        };

        /* switch plugin to edit mode */
        that.edit = function(important) {
//          console.log("that.edit", important);
          if(that.options.edit && !important) return;
          if(important) that.view();
          $that.on("touchstart", that.onEventTouchStart);
          $that.on("mousedown", that.onEventMouseDown);
          if(that.options.scaleObject)
            jQuery(that.options.scaleObject).on("mousedown touchstart", that.onEventMouseScaleDown);
          if(that.options.rotateObject)
            jQuery(that.options.rotateObject).on("mousedown touchstart", that.onEventMouseRotateDown);
          that.options.edit = true;
        };

        /* switch plugin to view mode */
        that.view = function(important) {
//          console.log("that.view", important);
          if(!that.options.edit && !important) return;
          $that.off("touchstart", that.onEventTouchStart);
          $that.off("mousedown", that.onEventMouseDown);
          if(that.options.scaleObject)
            jQuery(that.options.scaleObject).off("mousedown touchstart", that.onEventMouseScaleDown);
          if(that.options.rotateObject)
            jQuery(that.options.rotateObject).off("mousedown touchstart", that.onEventMouseRotateDown);
          that.options.edit = false;
        };

        that.breakUserEvents = function() {
          that.onEventTouchEnd();
          that.onEventMouseUp();
          that.onEventMouseRotateUp();
          that.onEventMouseScaleUp();
        };

        that.changeOptions = function(newOptions) {
          that.view();
          that.options = jQuery.extend(true, that.options, newOptions);
          if(that.options.edit) {
            that.edit(true);
          }
        };

        if(that.options.edit) that.edit();
      });
    },

    edit: function(important) {
      this.each(function() {
        this.catchUserEvents.edit(important);
      });
      return this;
    },

    view: function(important) {
      this.each(function() {
        this.catchUserEvents.view(important);
      });
      return this;
    },

    breakUserEvents: function() {
      this.each(function() {
        this.catchUserEvents.breakUserEvents();
      });
      return this;
    },

    changeOptions: function(newOptions) {
      this.each(function() {
        this.catchUserEvents.changeOptions(newOptions);
      });
      return this;
    }
  };

  jQuery.fn.catchUserEvents = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      jQuery.error('Method ' + method + ' does not exist on jQuery.webdraw');
    }
  };
})(jQuery);

if(!jQuery.fn.fullWidth) {
  jQuery.fn.fullWidth = function() {
    return parseFloat(this.css("width"))
      + parseFloat(this.css("padding-left")) + parseInt(this.css("padding-right"))
      + parseFloat(this.css("border-left-width")) + parseInt(this.css("border-right-width"));
  };
}
if(!jQuery.fn.fullHeight) {
  jQuery.fn.fullHeight = function() {
    return parseFloat(this.css("height"))
      + parseFloat(this.css("padding-top")) + parseInt(this.css("padding-bottom"))
      + parseFloat(this.css("border-top-width")) + parseInt(this.css("border-bottom-width"));
  };
}
if(!jQuery.fn.posLeft) {
  jQuery.fn.posLeft = function(n) {
    if(typeof(n) == "undefined") return parseFloat(this.css("left"));
    this.css("left", parseFloat(n) + "px");
    return this;
  };
}
if(!jQuery.fn.posTop) {
  jQuery.fn.posTop = function(n) {
    if(typeof(n) == "undefined") return parseFloat(this.css("top"));
    this.css("top", parseFloat(n) + "px");
    return this;
  };
}

if(!jQuery.fn.getBounds) {
  jQuery.fn.getBounds = function(transformObject, refObject) {
    var bounds = {
      left: Number.POSITIVE_INFINITY,
      top: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY,
      width: Number.NaN,
      height: Number.NaN
    };
    if(this.length <= 0) {
      return { left:0,top:0,right:0,bottom:0,width:0,height:0 };
    }
    if(typeof(transformObject) == "undefined" || transformObject === null || transformObject === false) transformObject = this;

    var dx = 0;
    var dy = 0;
    this.each(function (i, item) {
      var obj = jQuery(item);
      var off = obj.offset();
      off.left += dx;
      off.top += dy;
      var ww = obj.width() + parseInt(obj.css("border-left-width")) + parseInt(obj.css("border-right-width"))
        + parseInt(obj.css("padding-left")) + parseInt(obj.css("padding-right"));
      var hh = obj.height() + parseInt(obj.css("border-top-width")) + parseInt(obj.css("border-bottom-width"))
        + parseInt(obj.css("padding-top")) + parseInt(obj.css("padding-bottom"));

      var dd = jQuery(transformObject).css("transform");
      if(!dd || dd == "") dd = jQuery(transformObject).css("-o-transform");
      if(!dd || dd == "") dd = jQuery(transformObject).css("-ms-transform");
      if(!dd || dd == "") dd = jQuery(transformObject).css("-moz-transform");
      if(!dd || dd == "") dd = jQuery(transformObject).css("-webkit-transform");
      if(dd) dd = dd.match(/matrix\([0-9\.\,\s\+\-]+\)/);
      if(dd && dd[0]) dd = dd[0];
      if(dd) dd = dd.substr(7,dd.length - 8);
      if(dd) dd = dd.split(",");
      if(dd) {
        var wdt = Math.abs(ww*dd[0]) + Math.abs(hh*dd[1]);
        var hgt = Math.abs(ww*dd[2]) + Math.abs(hh*dd[3]);
      } else {
        var wdt = ww;
        var hgt = hh;
      }

      // calculate object with full width and height
      off.right = off.left + wdt;
      off.bottom = off.top + hgt;
      if(bounds.left > off.left)     bounds.left = off.left;
      if(bounds.top > off.top)       bounds.top = off.top;
      if(bounds.right < off.right)   bounds.right = off.right;
      if(bounds.bottom < off.bottom) bounds.bottom = off.bottom;
    });
    bounds.width = bounds.right - bounds.left;
    bounds.height = bounds.bottom - bounds.top;
    if(refObject) {
      var rooff = jQuery(refObject).offset();
      bounds.left -= rooff.left;
      bounds.right -= rooff.left;
      bounds.top -= rooff.top;
      bounds.bottom -= rooff.top;
    }
    return bounds;
  };
}
