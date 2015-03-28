/**
 * Created by Asus on 3/27/2015.
 */
var connection =  function(){
    var socket = io(),
        id = localStorage.getItem("wth-chat-user-id");

    if (!id) {
        id = Date.now();
        localStorage.setItem("wth-chat-user-id", id);
    }

    return {
        send: function (message) {
            var msg = {
                userId: id,
                msg: message
            };
            socket.emit('chat message', msg);
        },
        onReceive: function (callback) {
            socket.on('chat message', function(msg){
               msg.isMy = (msg.userId === id);
               callback(msg);
            });
        },
        sendImage:  function(base64url, points) {
            socket.emit('image', { image: true, url: base64url, points: points, userId: id});
        },
        onImageReceived: function(callBack) {
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
