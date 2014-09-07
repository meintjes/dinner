app.factory("fb", function() {
    return function(callback) {
        if (typeof FB !== "undefined") {
            callback(FB);
        }

        window.fbAsyncInit = function() {
            Parse.FacebookUtils.init({
                appId: FACEBOOK_APP_ID, // Facebook App ID
                cookie: true, // enable cookies to allow Parse to access the session
                xfbml: true  // parse XFBML
            });
            callback(FB);
        };
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/all.js";
            js.src = "//connect.facebook.net/en_US/all/debug.js";
            fjs.parentNode.insertBefore(js, fjs);
         }(document, 'script', 'facebook-jssdk'));
    };
})
