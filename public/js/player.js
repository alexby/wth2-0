var player = {
  init: function(cont){
    var that = this;
    that.channels = [];
    that.iused = -1;
    //console.log('player init');
    that.HTML5MultiAudioPlayer = new HTML5MultiAudioPlayer({
      "urls":['music/movit_vn.ogg','music/movit_s.ogg'],
      onReady: function() {
        var   createChannel =  function(source,dest){
          var channel = {};
          channel.audioSource = that.context.createMediaElementSource(source);
          channel.audioAnalyser = that.context.createAnalyser();
          channel.audioAnalyser.fftSize = 2048;
          channel.audioSource.connect(channel.audioAnalyser);
          channel.audioAnalyser.connect(dest);
          return channel;
        };

        that.context = new webkitAudioContext();
        that.channels.push(createChannel(this._audioList[0]._audio,that.context.destination));
        that.channels.push(createChannel(this._audioList[1]._audio,that.context.destination));
      },
      onPlay: function() {
        //console.log("! onPlay");
      },
      onPlaying: function(data) {
        var time = Math.round(data.current*100) + 240;
        for(var i = 0; i < SUBTITLE.length; i++){
           if(SUBTITLE[i].time <= time && SUBTITLE[i+1] && SUBTITLE[i+1].time > time && that.iused!=i && time>250){
            that.iused = i;
            scene.renewSubtitle(SUBTITLE[i].lyr);
           }
        }
      },
      onFinish: function() {
        //console.log("! onFinish");
      }
    });

    $('<div>').addClass('play large button blue').html('<span class="icon_play"></span>').hide().appendTo(cont).on('click', function(){
      that.HTML5MultiAudioPlayer.Play();
      core.updateSpectrum();
      $(this).hide();
    });
  }
};

function HTML5AudioPlayer(params) {
  var defaults = {
    url: "",
    onReady: null,
    onPlay: null,
    onPlaying: null,
    onPause: null,
    onStop: null,
    onFinish: null,
    onBuffering: null,
    onBuffered: null,
    onError: null
  };
  this._options = jQuery.extend(defaults, params);

  this._audio = null;
  this.isCanBePlaying = false;
  this.isBuffering = false;
  this.isBufferedFinished = false;
  this.isPlaying = false;

  HTML5AudioPlayer.prototype.Free = function(url) {
    this.stop();
    this._audio = null;
  };
  HTML5AudioPlayer.prototype.SetUrl = function(url) {
    var that = this;
    this._audio = new Audio();
    this._audio.src = url;
    this._audio.addEventListener("loadstart", function(){
      that.isBuffering = true;
      if(that._options.onBuffering) that._options.onBuffering.call(that, { "current":that._audio.buffered.end(0), "total":that._audio.duration });
    });
    this._audio.addEventListener("progress", function(){
      if(that._audio.buffered.length <= 0) {
        if(that._options.onBuffering) that._options.onBuffering.call(that, { "current":0, "total":that._audio.duration ? that._audio.duration : 0 });
        return;
      }
      if(that._audio.buffered.end(0) >= that._audio.duration) {
        that.isBufferedFinished = true;
        that.isBuffering = false;
        if(that._options.onBuffered) that._options.onBuffered.call(that, { "current":that._audio.buffered.end(0), "total":that._audio.duration });
      } else {
        if(that._options.onBuffering) that._options.onBuffering.call(that, { "current":that._audio.buffered.end(0), "total":that._audio.duration });
      }
    });
    this._audio.addEventListener("suspend", this.onAudioEvent);
    this._audio.addEventListener("abort", this.onAudioEvent);
    this._audio.addEventListener("error", function() {
      if(that._options.onError) that._options.onError.call(that);
    });
    this._audio.addEventListener("emptied", this.onAudioEvent);
    this._audio.addEventListener("stalled", this.onAudioEvent);
    this._audio.addEventListener("loadedmetadata", this.onAudioEvent);
    this._audio.addEventListener("loadeddata", this.onAudioEvent);
    this._audio.addEventListener("canplay", this.onAudioEvent);
    this._audio.addEventListener("canplaythrough", function() {
      that.isCanBePlaying = true;
      if(that._options.onReady) that._options.onReady.call(that);
    });
    this._audio.addEventListener("playing", function() {
      that.isPlaying = true;
      if(that._options.onPlaying) that._options.onPlaying.call(that, { "current":that._audio.currentTime, "total":that._audio.duration });
    });
    this._audio.addEventListener("waiting", this.onAudioEvent);
    this._audio.addEventListener("seeking", this.onAudioEvent);
    this._audio.addEventListener("seeked", this.onAudioEvent);
    this._audio.addEventListener("ended", function() {
      that.isPlaying = false;
      if(that._options.onFinish) that._options.onFinish.call(that);
    });
    this._audio.addEventListener("durationchange", this.onAudioEvent);
    this._audio.addEventListener("timeupdate", function() {
      if(that._options.onPlaying) that._options.onPlaying.call(that, { "current":that._audio.currentTime, "total":that._audio.duration })
    });
    this._audio.addEventListener("play", this.onAudioEvent);
    this._audio.addEventListener("pause", function() {
      that.isPlaying = false;
    });
    this._audio.addEventListener("ratechange", this.onAudioEvent);
    this._audio.addEventListener("volumechange", this.onAudioEvent);
    this._audio.load();
  };
  HTML5AudioPlayer.prototype.onAudioEvent = function(e) {
    //console.log(e.type, e);
  };
  HTML5AudioPlayer.prototype.Play = function(startPos) {
    if(!this._audio) return;
    if(typeof(startPos) != "undefined" && startPos !== null && startPos !== false)
      this._audio.currentTime = startPos;
    this._audio.play();
  };
  HTML5AudioPlayer.prototype.Pause = function() {
    if(!this._audio) return;
    this._audio.pause();
    if(this._options.onPause) this._options.onPause.call(this);
  };
  HTML5AudioPlayer.prototype.Stop = function() {
    if(!this._audio) return;
    this._audio.pause();
    this._audio.currentTime = 0;
    if(this._options.onStop) this._options.onStop.call(this);
  };
  HTML5AudioPlayer.prototype.GetPosition = function() {
    if(!this._audio) return null;
    return this._audio.currentTime;
  };
  HTML5AudioPlayer.prototype.GetAudio = function() {
    return this._audio;
  };
  // auto load track by param's URL
  if(this._options.url && this._options.url.length > 0) {
    this.SetUrl(this._options.url);
  }
}



function HTML5MultiAudioPlayer(params) {
  var defaults = {
    urls: [],
    onReady: null,
    onPlay: null,
    onPlaying: null,
    onPause: null,
    onStop: null,
    onFinish: null
  };
  this._options = jQuery.extend(defaults, params);
  this._audioList = [];

  HTML5MultiAudioPlayer.prototype.Free = function(url) {
    for(var qq = 0; qq < this._audioList.length; qq++) {
      this._audioList[qq].Free();
    }
    this._audioList = [];
    return this;
  };
  HTML5MultiAudioPlayer.prototype.AddTrack = function(url) {
    var that = this;
    var audio = new HTML5AudioPlayer({
      "url": url,
      onReady: function() {
        for(var qq = 0,tmp = true; qq < that._audioList.length; qq++) {
          tmp = tmp && that._audioList[qq].isCanBePlaying;
        }
        if(tmp && that._options.onReady) that._options.onReady.call(that);
      },
      onPlay: null,
      onPlaying: function(data) {
        if(that._options.onPlaying) that._options.onPlaying.call(that, data);
      },
      onPause: null,
      onStop: null,
      onFinish: function() {
        for(var qq = 0,tmp = true; qq < that._audioList.length; qq++) {
          tmp = tmp && !that._audioList[qq].isPlaying;
        }
        if(tmp && that._options.onFinish) that._options.onFinish.call(that);
      },
      onBuffering: null,
      onBuffered: null,
      onError: function() {
        if(that._options.onError) that._options.onError.call(that);
      }
    });
    this._audioList.push(audio);
    return this;
  };
  HTML5MultiAudioPlayer.prototype.Play = function() {
    // (typeof(startPos) != "undefined" && startPos !== null && startPos !== false) ? startPos : null

    // check for available to start play for all players
    var tmp = true;
    for(var qq = 0; qq < this._audioList.length; qq++) {
      tmp = tmp && this._audioList[qq].isCanBePlaying;
    }
    // check for, can we start playing now ?
    if(!tmp) {
      // we can't start plating, wait for 0.05s and try again
      var that = this;
      this._options._startPlayRequested = true;
      setTimeout(function(){
        if(that._options._startPlayRequested) that.Play();
      },50);
    } else {
      if(this._options.onPlay) {
        this._options.onPlay.call(that);
      }
      // start playing
      for(var qq = 0; qq < this._audioList.length; qq++) {
        this._audioList[qq].Play();
      }
    }
    return this;
  };
  HTML5MultiAudioPlayer.prototype.Pause = function() {
    if(this._options._startPlayRequested) this._options._startPlayRequested = false;
    if(this._options.onPause) this._options.onPause.call(that);
    for(var qq = 0; qq < this._audioList.length; qq++) {
      this._audioList[qq].Pause();
    }
    return this;
  };
  HTML5MultiAudioPlayer.prototype.Stop = function() {
    if(this._options._startPlayRequested) this._options._startPlayRequested = false;
    if(this._options.onStop) this._options.onStop.call(that);
    for(var qq = 0; qq < this._audioList.length; qq++) {
      this._audioList[qq].Stop();
    }
    return this;
  };

  if(this._options.urls && this._options.urls.length > 0) {
    for(var qq = 0; qq < this._options.urls.length; qq++)
      this.AddTrack(this._options.urls[qq]);
  }
}
