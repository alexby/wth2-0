/**
 * Created by Asus on 3/27/2015.
 */
var connection =  function(){
    var socket = io();

    return {
        send: function (message) {
            socket.emit('chat message', message);
        },
        onReceive: function (callback) {
            socket.on('chat message', function(msg){
               callback(msg);
            });
        },
        sendImage:  function(base64url, points) {
            socket.emit('image', { image: true, url: base64url, points: points});
        },
        onImageReceived: function(callBack) {
            //var ctx = document.getElementById('canvas').getContext('2d');
            socket.on("image", function(info) {
                if (info.image) {
                    callBack && callBack({
                        url: info.url,
                        userId: info.userId,
                        moveItCrazy: info.points
                    });
                }
            });
        }
    }
};
