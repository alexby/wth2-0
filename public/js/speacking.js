/**
 * Created by Asus on 3/28/2015.
 */

var speacking = function() {
    var yandexApiKey = "350fd046-a6d1-45dd-9336-254c3378810d";
    var apiAddress = "https://tts.voicetech.yandex.net/generate?";
    var audio;

    return {
        play: function() {
            audio.play();
        },
        load: function(text, onLoadCallback) {
            var request = apiAddress + "text=" + text + "&format=mp3&lang=ru%E2%80%91RU&speaker=zahar&key=" + yandexApiKey;
            audio = new Audio(request);

            audio.addEventListener('canplaythrough', function() {
               onLoadCallback && onLoadCallback(audio);
            }, false);
        }
    }
};