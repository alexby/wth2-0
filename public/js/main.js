/**
 * Created by Asus on 3/27/2015.
 */
    
var app = function(){
	return {
        init:function() {
            var connector = connection();
            $('form').submit(function(){
                connector.send($('#m').val());
                $('#m').val('');
                return false;
            });
            connector.onReceive(function(msg){
                $('#messages').append($('<li>').text(msg));
            });
	    }, initSpeechConvertor:function(){
            speechConvertor.enable();
        }};
}()

