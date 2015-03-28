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
          classFlip: "content",
          flipContent: true,
          useTransform: false,
          zIndexByClick: false,
          useFontSizeWhileScale: false
        };

        that.options = jQuery.extend(true, defaults, options);
        that.options.zIndexCounter = 1;

        $that.addClass('crazyObjects');
        if($that.css("position") == "static") $that.css("position", "relative");

        that.addNewItemToLayer = function(obj, nn, iData) {
          var prm = that.options.parameters[nn] || {};
          if(typeof(prm.left) == "undefined" || typeof(prm.top) == "undefined" || typeof(prm.width) == "undefined" || typeof(prm.height) == "undefined") return;
          var content = jQuery("<div>", {"class":"content"}).appendTo(obj).append(iData.object);
          var flip = obj.find(that.options.classFlip);
          obj.css("position", "absolute");
          // get or create content
          obj.css({
            "left": parseInt(prm.left) + "px",
            "top": parseInt(prm.top) + "px",
            "width": parseInt(prm.width) + "px",
            "height": parseInt(prm.height) + "px"
          });
          if(prm.angle) {
          obj.css("-webkit-transform", "rotateZ("+prm.angle+"rad) rotateX(0)")
            .css("-moz-transform", "rotateZ("+prm.angle+"rad) rotateX(0)")
            .css("-ms-transform", "rotateZ("+prm.angle+"rad) rotateX(0)")
            .css("-o-transform", "rotateZ("+prm.angle+"rad) rotateX(0)")
            .css("transform", "rotateZ("+prm.angle+"rad) rotateX(0)");

            var ta = 0;
            var aa = prm.angle; aa=(aa/(2*Math.PI)-Math.floor(aa/(2*Math.PI)))*(2*Math.PI);
            if(that.options.flipContent && Math.abs(aa) > Math.PI/2 && Math.abs(aa) < 3*Math.PI/2) ta = 180;
            flip.css("-webkit-transform", "rotate("+ta+"deg)")
              .css("-moz-transform", "rotate("+ta+"deg)")
              .css("-ms-transform", "rotate("+ta+"deg)")
              .css("-o-transform", "rotate("+ta+"deg)")
              .css("transform", "rotate("+ta+"deg)");
          }

          // the original box's size (with scale x1)
          if(that.options.originalWidth === null || that.options.originalWidth === false) that.options.originalWidth = $that.fullWidth();
          if(that.options.originalHeight === null || that.options.originalHeight === false) that.options.originalHeight = $that.fullHeight();

          var zoomX = prm.width/(iData.originalWidth ? iData.originalWidth : that.options.originalWidth);
          var zoomY = prm.height/(iData.originalHeight ? iData.originalHeight : that.options.originalHeight);
          if(that.options.useFontSizeWhileScale) {
            content.css("font-size", (Math.min(zoomX,zoomY) * 100) + "%");
          }

          // update object z-index
          if(that.options.zIndexByClick) {
            if(!prm.zIndex) prm.zIndex = ++that.options.zIndexCounter;
            else if(prm.zIndex > that.options.zIndexCounter) that.options.zIndexCounter = prm.zIndex;
            obj.css("z-index", prm.zIndex);
          }
        };

        for(var nn in that.options.items) {
          var iData = that.options.items[nn];
          var obj = jQuery("<div>", {"class":"crazyObjects_box"}).appendTo($that);
          that.addNewItemToLayer(obj, nn, iData);
        }
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
