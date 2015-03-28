(function(jQuery) {
  var methods = {
    init: function(options) {
      this.each(function() {
        var that = {};
        this.crazyObjects = that;
        var $that = $(this);

        var defaults = {
          items: [
            /*
             object: '<div class="img" style="background-image:url(images/Hats/downTonAbbey_hat4.png)"></div>',
             key: "object_key_for_user_identity", -- used for onDelete event
             width:155,
             height:134,
             minSize: { width:90, height:31 },
             maxSize: { width:450, height:240 }
             rotateable: true, // is user can rotate element
             moveable: true, // is user can move element
             scaleable: true, // is user can resize element
             proportionalScale: true,
             deleteButton: false,
            */
          ],
          parameters: [],
          isMobile: false,
          proportionalScale: true,
          movableArea: undefined,
          flipContent: true,
          useTransform: false,
          useBounds: true,
          rotateable: true, // is user can rotate element
          moveable: true, // is user can move element
          scaleable: true, // is user can resize element
          deleteButton: false,
          zIndexByClick: false,
          design: 1,
          onRemove: function(key, data) {},
          onChanging: function(data) {},
          onChanged: function(data) {}
        };

        that.options = jQuery.extend(true, defaults, options);
        that.options.zIndexCounter = 1;

        $that.addClass('crazyObjects type' + that.options.design);
        if($that.css("position") == "static") $that.css("position", "relative");

        that.addNewItemToLayer = function(obj, nn, iData) {
          jQuery("<div>", {"class":"content"}).appendTo(obj).append(iData.object);
          if(!that.options.parameters[nn]) that.options.parameters[nn] = {};
          if(iData.key) obj.attr("data-key", iData.key);
          obj[0].utParameters = that.options.parameters[nn];
          obj.userTransformation({
            edit: $that.hasClass("crazyObjects_edit"),
            isMobile: that.options.isMobile,
            classResize: "resize",
            classRotate: "rotate",
            classContent: "content",
            backObject: jQuery("body"),
            pos: that.options.parameters[nn],
            useBounds: that.options.useBounds,
            proportionalScale: typeof(iData.proportionalScale) != "undefined" ? iData.proportionalScale : that.options.proportionalScale,
            movableArea: that.options.movableArea,
            originalWidth: iData.width,
            originalHeight: iData.height,
            workMode: 1,
            flipContent: typeof(iData.flipContent) != "undefined" ? iData.flipContent : that.options.flipContent,
            useTransform: that.options.useTransform,
            minSize: typeof(iData.minSize) != "undefined" ? iData.minSize : that.options.minSize,
            maxSize: typeof(iData.maxSize) != "undefined" ? iData.maxSize : that.options.maxSize,
            rotateable: typeof(iData.rotateable) != "undefined" ? iData.rotateable : that.options.rotateable,
            moveable: typeof(iData.moveable) != "undefined" ? iData.moveable : that.options.moveable,
            scaleable: typeof(iData.scaleable) != "undefined" ? iData.scaleable : that.options.scaleable,
            onUserDetect: function() {
              if(that.options.zIndexByClick && $that.hasClass("crazyObjects_edit")) {
                this.utParameters.zIndex = ++that.options.zIndexCounter;
                jQuery(this).css("z-index", this.utParameters.zIndex);
              }
              $that.find(".crazyObjects_box").removeClass("selected");
              obj.addClass("selected");
              that.options.onChanging && that.options.onChanging();
            },
            onChanging: function() {
              that.options.onChanging && that.options.onChanging();
            },
            onChanged: function(data) {
              for(var pp in data) {
                this.utParameters[pp] = data[pp];
              }
              that.options.onChanged && that.options.onChanged(that.options.parameters);
            }
          });

          // update object z-index
          if(that.options.zIndexByClick) {
            if(!obj[0].utParameters.zIndex) obj[0].utParameters.zIndex = ++that.options.zIndexCounter;
            else if(obj[0].utParameters.zIndex > that.options.zIndexCounter) that.options.zIndexCounter = obj[0].utParameters.zIndex;
            obj.css("z-index", obj[0].utParameters.zIndex);
          }

          // add remove button with handler
          if(iData.deleteButton || (typeof(iData.deleteButton) == "undefined" && that.options.deleteButton)) {
            jQuery("<div>", {"class":"remove", "title":"remove"}).appendTo(obj).on("click touchstart", function() {
              var oo = jQuery(this).closest(".crazyObjects_box");
              var pp = oo[0].utParameters;
              for(var qq = 0; qq < that.options.parameters.length; qq++) {
                if(that.options.parameters[qq] === pp) {
                  that.options.items.splice(qq, 1);
                  that.options.parameters.splice(qq, 1);
                  if(that.options.onRemove) that.options.onRemove.call(that, oo.attr("data-key"), that.options.parameters);
                  oo.remove();
                  return false;
                }
              }
//              console.log("!!!!!!!!!!!!!! not found");
              return false;
            });
          }
        };

        for(var nn in that.options.items) {
          var iData = that.options.items[nn];
          var obj = jQuery("<div>", {"class":"crazyObjects_box"}).appendTo($that);
          that.addNewItemToLayer(obj, nn, iData);
        }

        that.edit = function() {
          $that.addClass("crazyObjects_edit");
          $that.find(".crazyObjects_box").userTransformation("edit");
        };

        that.view = function() {
          $that.removeClass("crazyObjects_edit");
          $that.find(".crazyObjects_box").userTransformation("view");
        };

        that.show = function(){
          $that.css({"display":"block", "visibility":"visible"});
        };

        that.hide = function(){
          $that.css({"display":"none", "visibility":"hidden"});
        };

        that.addItem = function(data) {
          var iData = jQuery.extend(true, {}, data);
          var nn = that.options.items.push(iData) - 1;
          if(typeof(iData.pos) != "undefined") {
            that.options.parameters[nn] = jQuery.extend(true, {}, iData.pos);
            delete iData.pos;
          }
          var obj = jQuery("<div>", {"class":"crazyObjects_box"}).appendTo($that);
          that.addNewItemToLayer(obj, nn, iData);
          $that.find(".crazyObjects_box").removeClass("selected");
          obj.addClass("selected");

//          jQuery("<div>", {"class":"content"}).appendTo(obj).append(iData.object);
//          if(!that.options.parameters[nn]) that.options.parameters[nn] = {};
//          obj[0].utParameters = that.options.parameters[nn];
//          obj.userTransformation({
//            edit: $that.hasClass("crazyObjects_edit"),
//            isMobile: that.options.isMobile,
//            classResize: "resize",
//            classRotate: "rotate",
//            classContent: "content",
//            backObject: jQuery("body"),
//            pos: that.options.parameters[nn],
//            useBounds: that.options.useBounds,
//            proportionalScale: typeof(iData.proportionalScale) != "undefined" ? iData.proportionalScale : that.options.proportionalScale,
//            movableArea: that.options.movableArea,
//            originalWidth: iData.width,
//            originalHeight: iData.height,
//            workMode: 1,
//            flipContent: typeof(iData.flipContent) != "undefined" ? iData.flipContent : that.options.flipContent,
//            useTransform: that.options.useTransform,
//            minSize: typeof(iData.minSize) != "undefined" ? iData.minSize : that.options.minSize,
//            maxSize: typeof(iData.maxSize) != "undefined" ? iData.maxSize : that.options.maxSize,
//            rotateable: typeof(iData.rotateable) != "undefined" ? iData.rotateable : that.options.rotateable,
//            moveable: typeof(iData.moveable) != "undefined" ? iData.moveable : that.options.moveable,
//            scaleable: typeof(iData.scaleable) != "undefined" ? iData.scaleable : that.options.scaleable,
//            onChanging: function() {
//              that.options.onChanging && that.options.onChanging();
//            },
//            onChanged: function(data) {
//              for(var pp in data) {
//                this.utParameters[pp] = data[pp];
//              }
//              that.options.onChanged && that.options.onChanged(that.options.parameters);
//            }
//          });
        };
      });
      return this;
    },

    edit: function() {
      this.each(function() {
        this.crazyObjects && this.crazyObjects.edit.call(this);
      });
      return this;
    },

    view: function() {
      this.each(function() {
        this.crazyObjects && this.crazyObjects.view.call(this);
      });
      return this;
    },

    show: function() {
      this.each(function() {
        this.crazyObjects && this.crazyObjects.show.call(this);
      });
      return this;
    },

    hide: function() {
      this.each(function() {
        this.crazyObjects && this.crazyObjects.hide.call(this);
      });
      return this;
    },

    addItem: function(data) {
      this.each(function() {
        this.crazyObjects && this.crazyObjects.addItem.call(this, data);
      });
      return this;
    }
  };

  jQuery.fn.crazyObjects = function(method) {
    if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      jQuery.error('Method ' + method + ' does not exist on jQuery.crazyObjects');
    }
    return this;
  };

})(jQuery);
