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
        sendImage:  function(buf) {
            socket.emit('image', { image: true, buffer: buf.toString('base64') });
        },
        onImageReceived: function(callBack) {
            var ctx = document.getElementById('canvas').getContext('2d');
            socket.on("image", function(info) {
                if (info.image) {
                    var img = new Image();
                    img.src = 'data:image/jpeg;base64,' + info.buffer;
                    ctx.drawImage(img, 0, 0);
                }
                callBack && callBack();
            });
        }
    }
};
