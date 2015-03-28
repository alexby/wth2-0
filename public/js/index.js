var core = {
  init:function(){
    var that = this;
    //div.save.large.green.button Save


    $('.gear').on('click', function(){
      $('aside').toggleClass('hidden');
    });

    $('.close').on('click', function(){
      $('aside').addClass('hidden');
    });




    // var url = "http://api.musixmatch.com/ws/1.1/matcher.subtitle.get?q_track=I%20like%20to%20move%20it&q_artist=Reel%202%20Real&apikey=5f5c5942967409d48dc854f5026f057a&format=JSONP&callback=?";
    // jQuery.getJSON(url, function(response) {
    //   var arr = response.message.body.subtitle.subtitle_body.split('[');
    //   console.log(response.message.body.subtitle.subtitle_body);
    //   var obj = {};
    //   for (var i = 0; i < arr.length; i++) {
    //     var timelyrarr = arr[i].split(']');
    //     var timearr = timelyrarr[0].split(':');
    //     var time = Math.round(timearr[0])*6000 + Math.round(timearr[1]*100);
    //     SUBTITLE.push({time:time, lyr:timelyrarr[1]});
    //   }
    //   if (response.resultsPage) that.processSearchArtist(loc, response.resultsPage);
    // });



    that.spectrumCanvas = document.getElementById('spectrum_canvas');
    that.spectrumCtx = that.spectrumCanvas.getContext('2d');

    this.scene = $('<div>').addClass('scene').appendTo('body article');

    $('<div class="save_info info large green button">').html('You can now adjust your face and eyes with music</br><b>Be Sure, it looks cool!...</b> Then save it').hide().appendTo('body article');

    $('<div class="save large orange button">').html('<span class="icon_play_alt"></span>Save').hide().appendTo(this.scene).on('click',function(){
      $(this).html('Saving... wait a bit please...');
      var req = $.post("json/save",CURRENT_DATA).error(function() { alert("error"); });

      req.success(function(obj){
        //console.log(obj);
        history.pushState(null,null,"/"+obj.enjoyid+window.location.hash);
        window.location.href = "/"+obj.enjoyid+window.location.hash;
      });
    });

    scene.init(this.scene);
   // player.init(this.scene);

    if(!CURRENT_DATA.url){
      tap.init(this.scene);
    } else {
      scene.addImage(CURRENT_DATA.url);
      $('.play').show();
      scene.crazyObjectsContainer.crazyObjects("hide");

      $.each(PREDEFINED, function(i, v){
        $('<div class="face">').appendTo(that.scene).css('left',(i-1)*44+4+'px').css('top','4px').css('backgroundImage', 'url('+v.url+')')
          .on('click', function(){
            scene.addImage(v.url);
            scene.updateParams(v);
        });
      });
    }

    $(".c").slider({
      from: 0,
      to: 512,
      //heterogeneity: ['50/100', '75/250'],
      scale: [0, '|', 128, '|' , '256', '|', 372, '|', 512],
      limits: false,
      step: 1,
      dimension: '&nbsp;',
      onstatechange : function(v){
        if(!CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')]){CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')] = {};}
        CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')].from      = this.inputNode[0].value.split(';')[0];
        CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')].to        = this.inputNode[0].value.split(';')[1];
        CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')].color     = $(this.domNode[0]).find('i.v').css('backgroundColor');
        CURRENT_DATA.letters[$(this.inputNode[0]).data('letter')].channel   = $(this.inputNode[0]).data('channel');
      }

    });

    function calcSpectrum(source, channel){
      var slight = (channel==0?10:0)
      var data = new Uint8Array(source.frequencyBinCount);
      source.getByteFrequencyData(data);
      var sounds = {};
      var oSpectrum = [];
      for(var l in CURRENT_DATA.letters){
        var letter = CURRENT_DATA.letters[l];
        if(letter.channel == channel){
          sounds[l] = 0;
        }
      }

      for (var i = 0; i < data.length; i++) {
        for(var l in CURRENT_DATA.letters){
          var letter = CURRENT_DATA.letters[l];
          if(letter.channel == channel && i>letter.from && i<letter.to){
            sounds[l] += data[i];
          }
        }
        var ls = 0;
        var ln = 0;
        for(var j = -slight; j <= slight; j++){
          if(data[i+j]){
            ls += data[i+j];
            ln++;
          }
        }
        oSpectrum[i] = Math.round(ls/ln);
      }

      for(var s in sounds){
        var letter = CURRENT_DATA.letters[s];
        sounds[s]= sounds[s] / (letter.to - letter.from) / 256;
      }
      return {data:data, oData:oSpectrum, sounds: sounds, letters: CURRENT_DATA.letters};
    }

    function clearDataCanvases(){
      that.spectrumCtx.clearRect(0, 0, that.spectrumCanvas.width, that.spectrumCanvas.height);
    }

    function drawSpectrum(spectrum, color){
      that.spectrumCtx.lineCap = 'round';
      for (var i = 0; i < that.spectrumCanvas.width; ++i) {
        var magnitude = spectrum.oData[i];

        that.spectrumCtx.globalAlpha = 1;
        that.spectrumCtx.fillStyle = color;
        that.spectrumCtx.fillRect(i, that.spectrumCanvas.height, 1, -magnitude);

        that.spectrumCtx.globalAlpha = 0.5;
        for(var l in spectrum.sounds){
          var letter = spectrum.letters[l];
          if(i>letter.from && i<letter.to){
            that.spectrumCtx.fillStyle = letter.color;
            that.spectrumCtx.fillRect(i, that.spectrumCanvas.height, 1, -magnitude);
          }
        }
        that.spectrumCtx.fillStyle = 'rgba(0,0,0,0.2)';
        that.spectrumCtx.fillRect(i, that.spectrumCanvas.height, 1, -magnitude+3);
      }
    }

    that.updateSpectrum = function (time) {
      clearDataCanvases();
      if ( that.analyser ) {
        window.requestAnimationFrame(core.updateSpectrum);
        var soundSpectrum = calcSpectrum( that.analyser ,1);
        var voiceSpectrum = calcSpectrum( that.analyser ,0);
        scene.update(voiceSpectrum,soundSpectrum);
      }
    };
  },
  analyser: null,
  setAnalyser: function(analyser) {
    this.analyser = analyser;
  }
};

window.onload = function() {
  var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  $('body').addClass(!is_chrome?'nochrome':'');
  core.init();
};


