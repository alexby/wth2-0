/**
 * Created by Asus on 3/27/2015.
 */
requirejs.config({
    "paths": {
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min"
    }
});

require(["https://cdn.socket.io/socket.io-1.2.0.js",
        "jquery",
        "testmodule"],
    function(io, $, test){
        console.log(test);
        var socket = io();
        $('form').submit(function(){
            socket.emit('chat message', $('#m').val());
            $('#m').val('');
            return false;
        });
        socket.on('chat message', function(msg){
            $('#messages').append($('<li>').text(msg));
        });
    }
);
