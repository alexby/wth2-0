var speechConvertor = function() {

    var logText = "";

	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });

    var key = "350fd046-a6d1-45dd-9336-254c3378810d"; //You can get it here: https://developer.tech.yandex.ru
    var dict = new webspeechkit.Dictation("wss://webasr.yandex.net/asrsocket.ws", uuid, key);

    return{
        enable:function(callBack){
            
            console.log("START");
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
                        logText = text;
                        text = "";
                    }
                    $('#content_curr').html(text);
                },
                punctuation: true,
                vad: true,
                speechStart: function() {
                   console.log("Speech started!");
                },
                speechEnd: function() {
                   console.log("Speech ended!");
                   logText&&callBack(logText);
                   logText = "";
                }
            });
        }, 
        disable:function(){

            console.log("stop");
            dict.stop.bind(dict)({
        }); 
    }};
};
