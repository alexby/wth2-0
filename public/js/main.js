/**
 * Created by Asus on 3/27/2015.
 */

var connector;

var app = function(){
	return {
        init:function() {
            $('form').submit(function(){
                connector.send($('#m').val());
                $('#m').val('');
                return false;
            });
            connector.onReceive(function(msg){
                $('#messages').append($('<li>').text(msg));
            });
	    }, initSpeechConvertor:function(){
            var speechConv = speechConvertor();
            speechConv.enable();
        }};
}()

