/**
 * Created by Asus on 3/27/2015.
 */
requirejs.config({
    "paths": {
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min"
    }
});

require(["connector",
        "jquery",
        "testmodule"],
    function(connector, $, test){
debugger;
    }
);
