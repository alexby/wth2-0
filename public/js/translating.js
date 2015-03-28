/**
 * Created by Asus on 3/28/2015.
 */
var translating = function() {
    var yandexApiKey = "trnsl.1.1.20150328T135344Z.01b99b17ff4a2f6a.34255525735cb1574e1efa8c30958aa7d8b24396";
    var url = "https://translate.yandex.net/api/v1.5/tr.json/translate";

    return {
        tr : function(text, callback) {
         return $.getJSON(url, {
                    key: yandexApiKey,
                    lang: "en",
                    text: text,
                    format: "plain"}
            ).done(function(data) {
                    callback(data.text[0]);
            }).fail(function(error) {
                alert("translation error");
                    console.log(error);
            });
        }
    }
};