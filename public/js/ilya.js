/**
 * Created by Asus on 3/27/2015.
 */
require(["connector",
        "jquery",
        "testmodule"],
    function(connector, $, test){
        $('form').submit(function(){
            connector.send($('#m').val());
            $('#m').val('');
            return false;
        });
        connector.onReceive(function(msg){
            $('#messages').append($('<li>').text(msg));
        });
    }
);
