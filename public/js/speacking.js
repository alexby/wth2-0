/**
 * Created by Asus on 3/28/2015.
 */

var speacking = function() {
    var yandexApiKey = "350fd046-a6d1-45dd-9336-254c3378810d";
    var apiAddress = "https://tts.voicetech.yandex.net/generate?";
    var audio;
    var context;
    var analyser;

    context = new AudioContext();
    analyser = context.createAnalyser();

    return {
        play: function() {
            audio.play();
        },
        load: function(text, onLoadCallback) {
            var request = apiAddress + "text=" + text + "&format=mp3&lang=ru%E2%80%91RU&speaker=zahar&key=" + yandexApiKey;
			this.playSound(request, onLoadCallback);
        },
		
		playSound: function(url, onLoadCallback) {
			audio = new Audio(url);
			audio.autoplay = false;
			document.body.appendChild(audio);

			audio.addEventListener('canplaythrough', function() {
				var source = context.createMediaElementSource(audio);
				source.connect(analyser);
				analyser.connect(context.destination);
				onLoadCallback && onLoadCallback(audio);
			}, false);	
		},

        getAnalyzer: function() {
            return analyser;
        }
    }
};