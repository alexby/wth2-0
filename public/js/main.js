/**
 * Created by Asus on 3/27/2015.
 */


var connector,
	speacker,
	translator,
	imageStorage = function(storage) {
		return {
			getImage: function(userId) {
				return JSON.parse(storage.getItem(userId));
			},
			saveImage: function (imageData) {
				storage.setItem(imageData.userId, JSON.stringify(imageData));
			}
		}
	}(localStorage);

var sendMessage = function(msg) {
	if ($('#translate').is(":checked")) {
		// need translation
		translator.tr(msg, function(text) {
			$('#messages').append($('<li>').text("Translated: " + " " + text));
			connector&&connector.send(text);
		});
	} else {
		connector&&connector.send(msg);
	}
};

var app = function(){
	return {
        init:function() {
			messagesArea = document.getElementById("messages");

            connector = connection();
			var img = imageStorage.getImage(connector.getUserId());
			if (img) {
				connector.sendImage(img.url, img.moveItCrazy);
			}

			speacker = speacking();
			translator = translating();
			
            $('form').submit(function(){
				sendMessage($('#m').val());
                $('#m').val('');
                return false;
            });
            connector.onReceive(function(msg){
                $('#messages').append($('<li>').text( (msg.isMy? "I" : msg.userId) + " said: " + " " + msg.msg));
				if (!msg.isMy) {
					console.log(msg.msg.indexOf("sound:"));
					if (msg.msg.indexOf("sound:") == 0) {
						console.log(msg.msg.substr(6));
						speacker.playSound(msg.msg.substr(6), function(a) {
							app.runAnalyzer(msg);
						}
						);
					} else {
						var text = msg.msg;
						//translator.tr(msg.msg, function(text) {
							speacker.load(text, function () {
								app.runAnalyzer(msg);
							});
						//})
					}
				}
				messagesArea.scrollTop = messagesArea.scrollHeight;
			});
			connector.onImageReceived(function(imageData) {
				//usersImages[imageData.userId] = imageData;
				imageStorage.saveImage(imageData);
			});
			
			appendOwnImages();
			appendPredefinedImages();
	    },
		runAnalyzer: function(msg) {
			var analyser = speacker.getAnalyzer();
			var image = imageStorage.getImage(msg.userId);
			if (image) {
				setImage(false, image.url, image.moveItCrazy);
			}
			core.setAnalyser(analyser);
			core.updateSpectrum();			
		},
		initTranslation: function () {
			translator = translating();
			$('form').submit(function(){
				console.log($('#m').val());
				translator.tr($('#m').val(), function(resText) {
					$('#messages').append($('<li>').text(resText));
				});
				$('#m').val('');
				return false;
			});
	    },
         initSpeechConvertor:function(){
            var speechConv = speechConvertor();
            $("#start_btn").on("click", function() {speechConv.enable(function(text){
                sendMessage(text);
            });});
            $("#stop_btn").on("click", function() {speechConv.disable();});
        }};
}();

var setSavedImage = function(num) {
	var allPh = loadOwnPhotos(); 
	tap.hide();
	setImage(true, allPh[num].url, JSON.stringify(allPh[num].moveItCrazyParameters));
}

var setPredefinedImage = function(num) {
	tap.hide();
	setImage(true, PREDEFINED[num].url, JSON.stringify(PREDEFINED[num].moveItCrazyParameters));
}

var sendImage = function(moveItCrazy, url){
	moveItCrazy = JSON.stringify(moveItCrazy);
	connector.sendImage(url, moveItCrazy);
};

var setImage = function(needToSend, url, moveItCrazy){
	if ((!url) || (!moveItCrazy)) {
		alert("error reading image");
		return;
	}
	scene.addImage(url);
	scene.updateParams(JSON.parse(moveItCrazy));
	needToSend && connector.sendImage(url, moveItCrazy);
};

var makePhoto = function() {
	tap.load();
}

var saveOwnPhoto = function(data) {
	var allData = loadOwnPhotos();
    if (JSON.stringify(localStorage).length >=  4000000) {
        allData.splice(0,1);
    }
	allData.push(data);
	localStorage.setItem('ownImages', JSON.stringify(allData));
}

var loadOwnPhotos = function() {
	var res = localStorage.getItem('ownImages');
	if (res === null || res === "") {
		return [];
	}
	return JSON.parse(res);
}

var appendOwnImages = function() {
	$("#own_images").html("");
	var images = loadOwnPhotos();
	for (var i in images) {
		$("#own_images").append("<img src=\"" + images[i].url + "\" width=\"100\" height=\"100\" onclick=\"setSavedImage(" + i + ")\"/>");
		console.log(images[i]);
	}	
}

var appendPredefinedImages = function() {
	$("#predefined_images").html("");
	console.log(PREDEFINED);
	var images = PREDEFINED;
	for (var i in images) {
		$("#own_images").append("<img src=\"" + images[i].url + "\" width=\"100\" height=\"100\" onclick=\"setPredefinedImage(" + i + ")\"/>");
		console.log(images[i]);
	}	
}