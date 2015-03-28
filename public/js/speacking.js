/**
 * Created by Asus on 3/28/2015.
 */

var speacking = function() {
    var yandexApiKey = "350fd046-a6d1-45dd-9336-254c3378810d";
    var apiAddress = "https://tts.voicetech.yandex.net/generate?";
    var audio;
    var context;
    var analyser;

    return {
        play: function() {
            audio.play();
        },
        load: function(text, onLoadCallback) {
            var request = apiAddress + "text=" + text + "&format=mp3&lang=ru%E2%80%91RU&speaker=zahar&key=" + yandexApiKey;
            audio = new Audio(request);
            audio.autoplay = true;
            document.body.appendChild(audio);

            context = new AudioContext();
            analyser = context.createAnalyser();

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