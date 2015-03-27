/**
 * Created by Asus on 3/27/2015.
 */
define(
    'connector',
    ["io"],
    function(io){
        var socket = io();

        return {
            send: function (message) {
                socket.emit('chat message', message);
            },
            onReceive: function () {
                socket.on('chat message', function(msg){
                    $('#messages').append($('<li>').text(msg));
                });
            }
        }
    }
);
