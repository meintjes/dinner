app.controller("LoginCtrl", function($scope) {
    function tryLogin() {
      Parse.FacebookUtils.logIn(null, {
         success: function(user) {
            window.location = "/#/home";
         },
         error: function(user, error) {
           alert("User cancelled the Facebook login or did not fully authorize.");
         }
       });
    }
    $scope.login = function() {
        tryLogin();
    };
    window.fbAsyncInit = function() {
      Parse.FacebookUtils.init({
        appId      : FACEBOOK_APP_ID, // Facebook App ID
        cookie     : true, // enable cookies to allow Parse to access the session
        xfbml      : true  // parse XFBML
      });
        FB.getLoginStatus(function(response) {
                if (response.status === "connected") {
                    window.location = "/#/home";
                }
            }
        );
    };
    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js";
        fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
});
