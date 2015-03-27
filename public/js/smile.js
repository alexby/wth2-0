requirejs.config({
    "paths": {
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min"
    }
});

require(["jquery"],
    function($) {
    	var yandexApiKey = "350fd046-a6d1-45dd-9336-254c3378810d";
		var apiAddress = "https://tts.voicetech.yandex.net/generate?";

		function generateSpeach(text) {
			var request = apiAddress + "text=" + text + "&format=wav&lang=ru%E2%80%91RU&speaker=zahar&key=" + yandexApiKey;
			$("embed").attr('src', request);
		}

		$('#say').click(function () {
			generateSpeach($('#text').val());
		});
	}
);