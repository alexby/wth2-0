var tap = {
  init:function(container){
    var that = this;

    that.tapContainer = $('<div>',{'class':'tap_container'}).appendTo(container);
    that.tapVideo     = $('<video>',{'autoplay':'autoplay','class':'tap_video'}).attr({width:640, height:480}).appendTo(that.tapContainer);
    that.tapCanvas    = $('<canvas>',{'class':'tap_canvas'}).attr({width:640, height:480}).appendTo(that.tapContainer);
    that.tapCanvasCtx = that.tapCanvas[0].getContext('2d');
    that.tapStream = false;

    // standards ... shit
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL.createObjectURL = window.URL.createObjectURL || window.URL.webkitCreateObjectURL || window.URL.mozCreateObjectURL || window.URL.msCreateObjectURL;
    $('<div>').addClass('allow large blue button headMessage').insertBefore('#before_images').html('<span class="icon_arrow_up"></span><span class="icon_arrow_up"></span><span class="icon_arrow_up"></span>&nbsp;&nbsp;&nbsp;Hey, allow us to use your camera ;)&nbsp;&nbsp;&nbsp;<span class="icon_arrow_up"></span><span class="icon_arrow_up"></span><span class="icon_arrow_up"></span>');
    navigator.getUserMedia({video: true}, function(stream) {
      that.tapVideo[0].src = window.URL.createObjectURL(stream);
      $('.allow').hide();
      scene.crazyObjectsContainer.crazyObjects("show");
      that.tapStream = stream;
      $('<div>').addClass('capture_info info large blue button').html('Open your mouth a bit and adjust your face with the squares<br>Then click <b>"capture"</b>').appendTo('body article');
      $('<div>').addClass('capture large red button').html('<span class="icon_camera"></span>Capture').appendTo(container).on('click',function(){
        that.captureImage();
      });
    }, function(){
      console.log('stream failed :P');
    });

  },

  captureImage:function(){
    var that = this;
    if (that.tapStream) {
		//сохранение изображения
      that.tapCanvasCtx.translate(that.tapCanvas[0].width, 0);
      that.tapCanvasCtx.scale(-1, 1);
      that.tapCanvasCtx.drawImage(that.tapVideo[0], 0, 0, that.tapVideo[0].width, that.tapVideo[0].height);
      var url = that.tapCanvas[0].toDataURL('image/png');
	  that.tapCanvasCtx.scale(-1, 1);
      scene.addImage(url);
      CURRENT_DATA.url = url;
	  
	  sendImage(CURRENT_DATA.moveItCrazyParameters, CURRENT_DATA.url);
	  saveOwnPhoto(CURRENT_DATA);
	  this.hide();
    }
	appendOwnImages();
  },
  
  load:function() {
      this.tapContainer.show();
      $('.capture').show();
      $('.capture_info').show();
	  $('.crazy_objects_container').show();
  },
  
  hide:function() {
      this.tapContainer.hide();
      $('.capture').hide();
      $('.capture_info').hide();
	  $('.crazy_objects_container').hide();	  
  }
};
