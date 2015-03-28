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
          classCommon: "userTransform",
          classContent: "content", // content element class name
          classFlip: "content",
          backObject: "body", // the object to associate events, then user changing element
          design: 1,
          flipContent: true, // flip content when rotate
          moveable: true,
          originalWidth: null,
          originalHeight: null,
          pos: {}, // current element position data,
          useFontSizeWhileScale: false
        };
        that.params = jQuery.extend(true, defaults, options);
        $that.addClass(that.params.classCommon + " utdesign" + that.params.design);

        // get or create content
        if((that._content = $that.find("> ."+that.params.classContent)).length <= 0) {
          that._content = jQuery("<div>", {"class": that.params.classContent}).appendTo($that);
        }
        // the original box's size (with scale x1)
        if(that.params.originalWidth === null || that.params.originalWidth === false) that.params.originalWidth = $that.fullWidth();
        if(that.params.originalHeight === null || that.params.originalHeight === false) that.params.originalHeight = $that.fullHeight();

        var zoomX = that.params.pos.width/that.params.originalWidth;
        var zoomY = that.params.pos.height/that.params.originalHeight;
        if(that.params.useFontSizeWhileScale) {
          that._content.css("font-size", (Math.min(zoomX,zoomY) * 100) + "%");
        }

        var flip = $that.find(that.params.classFlip);

        that.updateAngle = function() {
          $that.css("-webkit-transform", "rotateZ("+that.params.pos.angle+"rad)")
            .css("-moz-transform", "rotateZ("+that.params.pos.angle+"rad)")
            .css("-ms-transform", "rotateZ("+that.params.pos.angle+"rad)")
            .css("-o-transform", "rotateZ("+that.params.pos.angle+"rad)")
            .css("transform", "rotateZ("+that.params.pos.angle+"rad)");
          that.updatePosition(false);
        };

        that.updateContentAngle = function() {
          var ta = 0;
          var aa = that.params.pos.angle; aa=(aa/(2*Math.PI)-Math.floor(aa/(2*Math.PI)))*(2*Math.PI);
          if(that.params.flipContent && Math.abs(aa) > Math.PI/2 && Math.abs(aa) < 3*Math.PI/2) ta = 180;
          flip.css("-webkit-transform", "rotate("+ta+"deg)")
            .css("-moz-transform", "rotate("+ta+"deg)")
            .css("-ms-transform", "rotate("+ta+"deg)")
            .css("-o-transform", "rotate("+ta+"deg)")
            .css("transform", "rotate("+ta+"deg)");
        };

        that.updatePosition = function() {
          if(!that.params.moveable) return;
          $that.posLeft(that.params.pos.left).posTop(that.params.pos.top).width(that.params.pos.width).height(that.params.pos.height);
        };

        that.changeOptions = function(newOptions) {
          that.params = jQuery.extend(true, that.params, newOptions);
          that.updateAngle();
          that.updateContentAngle();
          that.updatePosition();
        };
        that.updateAngle();
        that.updateContentAngle();
        that.updatePosition();
      });
    },

    changeOptions: function(options) {
      this.each(function() {
        if(this.userTransformation) this.userTransformation.changeOptions(options);
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
