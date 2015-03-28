var scene = {
  init: function(container){
    var that = this;
    that.scene = $(container);
    try {
      that.imageCanvas = fx.canvas(); // try to create a WebGL canvas (will fail if WebGL isn't supported)
      that.scene.prepend(that.imageCanvas);
    } catch (e) {
      alert(e);
      return;
    }
    that.stroboCount = 0;
    that.moveItCrazyItems = [
      {'key':'mouth','object':'<div></div>', originalWidth: 140, originalHeight:80, maxSize: { width:450, height:450 }, minSize: { width:20, height:20 }},
      {'key':'eye1','object':'<div></div>', originalWidth: 80, originalHeight:60, maxSize: { width:450, height:450 }, minSize: { width:20, height:20 }},
      {'key':'eye2','object':'<div></div>', originalWidth: 80, originalHeight:60, maxSize: { width:450, height:450 }, minSize: { width:20, height:20 }},
    ];

    for (var i = 0; i < CURRENT_DATA.moveItCrazyParameters.length; i++) {
      CURRENT_DATA.moveItCrazyParameters[i].top *= 1;
      CURRENT_DATA.moveItCrazyParameters[i].left *= 1;
      CURRENT_DATA.moveItCrazyParameters[i].right *= 1;
      CURRENT_DATA.moveItCrazyParameters[i].width *= 1;
    }

    that.crazyObjectsContainer = $('<div>',{'class':'crazy_objects_container'}).appendTo(that.scene);
    that.crazyObjectsContainer.crazyObjects({
      items: that.moveItCrazyItems,
      parameters: CURRENT_DATA.moveItCrazyParameters,
      proportionalScale: true,
      deleteButton: false,
      //flipContent: false,
      //movableArea: {left:0, top:0, width:640, height:480},
      //zIndexByClick: true,
      design: 3,
      onRemove: function(key, data) {

      },
      onChanging: function() {

      },
      onChanged: function(moveItCrazyParameters) {
        CURRENT_DATA.moveItCrazyParameters = moveItCrazyParameters;
        that.extendMoveItCrazyParameters();
        //console.log(JSON.stringify(CURRENT_DATA.moveItCrazyParameters));
      }
    });

    scene.crazyObjectsContainer.crazyObjects("hide");
    that.extendMoveItCrazyParameters();
  },

  extendMoveItCrazyParameters:function(p){
    $.each(CURRENT_DATA.moveItCrazyParameters,function(i, v){
      v.center = {x: v.left + v.width/2, y: v.top + v.height/2};
      v.keydots = [{x: v.left, y: v.top + v.height/2}, {x: v.left + v.width, y: v.top + v.height/2}];
    });
  },

  renewSubtitle: function(text){
    var that = this;
    $('.subtitle').addClass('fade');
    var deg = (Math.random()*(6)-3);
    var bottom = (Math.random()*(10)+20);
    var font = (Math.random()*(10)+20);
    //console.log(deg, scale);
    var a = $('<div class="subtitle">').appendTo(that.scene).html(text).css({
      "font-size":65-text.length+"px",
      "bottom":bottom+"px",
      "-webkit-transform": "scale(1) rotate("+deg+"deg) translateX(0px) translateY(0px) skewX(0deg) skewY(0deg)",
    });

    setTimeout(function(){
       a.addClass('fadein');
    },100);
  },

  updateParams:function(v){
    var that = this;
    CURRENT_DATA.moveItCrazyParameters = v;
    that.extendMoveItCrazyParameters();
  },


  addImage: function(url, edit){
    var that = this;
    var img = new Image();
    img.onload = function(){
      that.imageTexture = that.imageCanvas.texture(img);
      that.imageCanvas.draw(that.imageTexture).update();
      that.imageCanvasCtx = that.imageCanvas.getContext('2d');

      that.scene.crazyObjects("show");
      that.scene.crazyObjects("edit");
    };
    img.src = url;
  },

  update: function(spectrum1, spectrum2){
    var that = this;
    var say = function(src, sounds, channel){
      var out;
      var mouth = CURRENT_DATA.moveItCrazyParameters[0];
      var eye1 = CURRENT_DATA.moveItCrazyParameters[1];
      var eye2 = CURRENT_DATA.moveItCrazyParameters[2];

      if(channel == 0){
        out = src.bulgePinch(mouth.center.x, mouth.center.y, mouth.width/2, sounds.a*3-1);
        out = src.bulgePinch(mouth.center.x+mouth.width/4, mouth.center.y, mouth.width/2, sounds.a*3-1.5);
        out = src.bulgePinch(mouth.center.x-mouth.width/4, mouth.center.y, mouth.width/2, sounds.a*3-1.5);
        //out = src.bulgePinch(400, 360, 100, -0.2);
        out = src.swirl(mouth.keydots[0].x, mouth.keydots[0].y, mouth.width/3, (sounds.i*2-1));
        out = src.swirl(mouth.keydots[1].x, mouth.keydots[1].y, mouth.width/3, -(sounds.i*2-1));

        out = src.bulgePinch(eye1.center.x, eye1.center.y, eye1.width/2, sounds.a);
        out = src.bulgePinch(eye2.center.x, eye2.center.y, eye2.width/2, sounds.a);

      } else {

        out = src.bulgePinch(320, 240, 600, sounds.bass/5);
        out = src.vignette(0.32, sounds.middle*2);

        that.stroboCount++;
        if(sounds.strobo > 0.5 && that.stroboCount%3 == 0) {
          sounds.strobo = 0.2;
        } else {
          sounds.strobo = 0;
        }
        out = src.brightnessContrast(sounds.strobo, -sounds.strobo);
        out = src.sepia(sounds.strobo);
        out = src.hueSaturation(sounds.middle/10, 0);

      }
      return out;
    };


    var src = that.imageCanvas.draw(that.imageTexture);
    if(1){
      var out = say(src, spectrum1.sounds,0);
      var out = say(src, spectrum2.sounds,1);
      out.update();
    } else {
      out = src;
      out.update();
    }
  }
};
