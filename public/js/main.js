/**
 * Created by Asus on 3/27/2015.
 */
require(["io",
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
