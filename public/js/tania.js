var speechConvertor = function() {
    var start_btn = $("#start_btn");
    var stop_btn = $("#stop_btn");
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
            });

    var key = "350fd046-a6d1-45dd-9336-254c3378810d"; //You can get it here: https://developer.tech.yandex.ru

    var tts = new webspeechkit.Tts({key: key, emotion: 'evil', speaker: 'jane'});
    var dict = new webspeechkit.Dictation("wss://webasr.yandex.net/asrsocket.ws", uuid, key);

    console.log("CLICK000!");
    start_btn.click (function() {
        console.log("CLICK!");
        var format = webspeechkit.FORMAT["PCM44"];

        $('#content_uttr').html('');
        $('#content_curr').html('');
        dict.start({
            format: format,
            bufferSize: 1024,
            errorCallback: function(msg) {console.log(msg); alert(msg);},
            dataCallback: function(text, uttr, merge) {
                console.log(text);
                if (uttr) {
                    $('#content_uttr').append(' ' + text);                            
                    text = "";
                }
                $('#content_curr').html(text);
            },
            infoCallback: function(info) {
                $('#bytes_send').html(info.send_bytes);
                $('#packages_send').html(info.send_packages);
                $('#processed').html(info.processed);
            },
            punctuation: punctuation.checked,
            vad: true,
            speechStart: function() {
                $('#pack').html('Speech started!');
            },
            speechEnd: function() {
                $('#pack').html('Speech ended!');
            }
        });
    })

   // pause_btn.onclick = dict.pause.bind(dict);
    stop_btn.onclick = dict.stop.bind(dict);
    
    // tts_say.onclick = function() {
    //     dict.pause();
    //     var text = $('#content_uttr').text() + $('#content_curr').text();
    //     tts.say(text, start_btn.onclick, {emotion: 'good', speaker: 'jane'});
    // };
    return{enable:function(callBack){
        console.log("Enable");

    }, disable:function(){
        console.log("Disable");
    }};
};
