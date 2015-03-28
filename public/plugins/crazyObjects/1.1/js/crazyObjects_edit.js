(function(jQuery) {
  var methods = {
    init: function(options) {
      this.each(function() {
        var that = {};
        this.crazyObjects = that;
        var $that = jQuery(this);

        var defaults = {
          items: [
            /*
             object: '<div class="img" style="background-image:url(images/Hats/downTonAbbey_hat4.png)"></div>',
             key: "object_key_for_user_identity", -- used for onDelete event
             originalWidth:155,
             originalHeight:134,
             flipContent: true, // flip content when rotate
             useBounds: true, // the bounds parameters to validate move
             minSize: { width:90, height:31 },
             maxSize: { width:450, height:240 }
             rotateable: true, // is user can rotate element
             moveable: true, // is user can move element
             scaleable: true, // is user can resize element
             selectable: true, // Hi Alexey, wat's up :)  -- 2@Dmitry your brake my ideas.... :(
             deleteButton: true,
             movableArea: {},
             proportionalScale: true,
             deleteButton: false,
            */
          ],
          selectClass: 'crazyObjects_selected_box',
          classContent: "content",
          classFlip: "content",
          parameters: [],
          proportionalScale: true,
          movableArea: undefined,
          flipContent: true,
          useTransform: false,
          useBounds: true,
          rotateable: true, // is user can rotate element
          moveable: true, // is user can move element
          scaleable: true, // is user can resize element
          selectable: true,
          deleteButton: true,
          zIndexByClick: false,
          design: 1,
          workMode: 1,
          useFontSizeWhileScale: false,
          onRemove: function(key, data) {},
          onChanging: function(data) {},
          onChanged: function(data) {},
          onSelected: function(key){}
        };

        that.options = jQuery.extend(true, defaults, options);
        that.options.zIndexCounter = 1;
        if(!that.options.rotateable) that.options.workMode = 0;

        $that.addClass('crazyObjects type' + that.options.design);
        if($that.css("position") == "static") $that.css("position", "relative");

        that.addNewItemToLayer = function(obj, nn, iData) {
          jQuery("<div>", {"class":"content"}).appendTo(obj).append(iData.object);
          if(!that.options.parameters[nn]) that.options.parameters[nn] = {};
          if(iData.key) obj.attr("data-key", iData.key);
          obj[0].utParameters = that.options.parameters[nn];
          obj.userTransformation({
            edit: $that.hasClass("crazyObjects_edit"),
            classResize: "resize",
            classRotate: "rotate",
            classRemove: "remove",
            classContent: that.options.classContent,
            classFlip: that.options.classFlip,
            backObject: jQuery("body"),
            design: that.options.design,
            pos: that.options.parameters[nn],
            useBounds: typeof(iData.useBounds) != "undefined" ? iData.useBounds : that.options.useBounds,
            proportionalScale: typeof(iData.proportionalScale) != "undefined" ? iData.proportionalScale : that.options.proportionalScale,
            movableArea: (typeof(iData.movableArea) != "undefined" && !jQuery.isEmptyObject(iData.movableArea)) ? iData.movableArea : that.options.movableArea,
            originalWidth: iData.originalWidth,
            originalHeight: iData.originalHeight,
            workMode: that.options.workMode,
            flipContent: typeof(iData.flipContent) != "undefined" ? iData.flipContent : that.options.flipContent,
            useTransform: that.options.useTransform,
            minSize: (typeof(iData.minSize) != "undefined" && !jQuery.isEmptyObject(iData.minSize)) ? iData.minSize : that.options.minSize,
            maxSize: (typeof(iData.maxSize) != "undefined" && !jQuery.isEmptyObject(iData.maxSize)) ? iData.maxSize : that.options.maxSize,
            rotateable: typeof(iData.rotateable) != "undefined" ? iData.rotateable : that.options.rotateable,
            moveable: typeof(iData.moveable) != "undefined" ? iData.moveable : that.options.moveable,
            scaleable: typeof(iData.scaleable) != "undefined" ? iData.scaleable : that.options.scaleable,
            deleteButton: typeof(iData.deleteButton) != "undefined" ? iData.deleteButton : that.options.deleteButton,
            useFontSizeWhileScale: typeof(iData.useFontSizeWhileScale) != "undefined" ? iData.useFontSizeWhileScale : that.options.useFontSizeWhileScale,
            onUserDetect: function() {
              // check for edit mode and selectable item's ability
              if(!$that.hasClass("crazyObjects_edit") || iData.selectable === false) return;
              // update selected state
              $that.find('.userTransform.'+that.options.selectClass).removeClass(that.options.selectClass);
              obj.addClass(that.options.selectClass);
              that.options.onSelected.call(that, obj.attr("data-key"));
              // change z-order
              if(that.options.zIndexByClick) {
                this.utParameters.zIndex = ++that.options.zIndexCounter;
                jQuery(this).css("z-index", this.utParameters.zIndex);
                that.options.onChanging && that.options.onChanging();
              }
            },
            onChanging: function(params) {
              that.options.onChanging && that.options.onChanging.call(this, params);
            },
            onChanged: function(data) {
              for(var pp in data) {
                this.utParameters[pp] = data[pp];
              }
              that.options.onChanged && that.options.onChanged(that.options.parameters);
            },
            onRemove: function() {
              var oo = jQuery(this);
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
            }
          });

          // update object z-index
          if(that.options.zIndexByClick) {
            if(!obj[0].utParameters.zIndex) obj[0].utParameters.zIndex = ++that.options.zIndexCounter;
            else if(obj[0].utParameters.zIndex > that.options.zIndexCounter) that.options.zIndexCounter = obj[0].utParameters.zIndex;
            obj.css("z-index", obj[0].utParameters.zIndex);
          }
        };

        for(var nn in that.options.items) {
          var iData = that.options.items[nn];
          var obj = jQuery("<div>").appendTo($that);
          that.addNewItemToLayer(obj, nn, iData);
        }

        that.edit = function() {
          $that.addClass("crazyObjects_edit");
          $that.find(".userTransform").userTransformation("edit");
        };

        that.view = function() {
          $that.removeClass("crazyObjects_edit");
          $that.find(".userTransform").userTransformation("view");
        };

        that.show = function(){
          $that.css({"display":"block", "visibility":"visible"});
        };

        that.hide = function(){
          $that.css({"display":"none", "visibility":"hidden"});
        };

        that.addItem = function(data) {
          var iData = jQuery.extend(true, {}, data);
          if(typeof(iData.selectable) == "undefined") iData.selectable = that.options.selectable;
          var nn = that.options.items.push(iData) - 1;
          if(typeof(iData.pos) != "undefined") {
            that.options.parameters[nn] = jQuery.extend(true, {}, iData.pos);
            delete iData.pos;
          }
          var obj = jQuery("<div>").appendTo($that);
          that.addNewItemToLayer(obj, nn, iData);
          if(iData.selectable && $that.hasClass("crazyObjects_edit")) {
            $that.find(".userTransform."+that.options.selectClass).removeClass(that.options.selectClass);
            obj.addClass(that.options.selectClass);
          }
        };

        that.selectItem = function(key) {
          // check for edit mode
          if(!$that.hasClass("crazyObjects_edit")) return;

          // look for item by key
          var obj = $that.find(".userTransform[data-key='" + key + "']");
          if(obj.length <= 0) return;

          // get parameters and checkk for selectable
          var iData = obj[0].utParameters;
          if(iData.selectable === false) return;

          // update selected state
          $that.find('.userTransform.'+that.options.selectClass).removeClass(that.options.selectClass);
          obj.addClass(that.options.selectClass);
          that.options.onSelected.call(that, obj.attr("data-key"));

          // change z-order
          if(that.options.zIndexByClick) {
            iData.zIndex = ++that.options.zIndexCounter;
            jQuery(this).css("z-index", iData.zIndex);
            that.options.onChanging && that.options.onChanging();
          }

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
    },

    selectItem: function(key) {
      this.each(function() {
        this.crazyObjects && this.crazyObjects.selectItem.call(this, key);
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
