app.controller("LoginCtrl", function($scope) {
    window.fbAsyncInit = function() {
      Parse.FacebookUtils.init({
        appId      : FACEBOOK_APP_ID, // Facebook App ID
        cookie     : true, // enable cookies to allow Parse to access the session
        xfbml      : true  // parse XFBML
      });
      Parse.FacebookUtils.logIn(null, {
         success: function(user) {
           if (!user.existed()) {
             alert("User signed up and logged in through Facebook!");
           } else {
             alert("User logged in through Facebook!");
           }
         },
         error: function(user, error) {
           alert("User cancelled the Facebook login or did not fully authorize.");
         }
       });
    };
    (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/all.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
});
