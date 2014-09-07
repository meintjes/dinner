app.controller("LoginCtrl", function($scope, fb) {
    function redirectToHome() {
        window.location = "/#/home";
    }
    function saveUserInfo(callback) {
        console.log(1);
        fb(function(FB) {
            FB.api("/me", function(response) {
                var user = Parse.User.current();
                user.set("name", response.name);
                user.set("lowercaseName", response.name.toLowerCase());
                user.save();
                callback();
            })
        });
    }
    function tryLogin() {
        Parse.FacebookUtils.logIn("public_profile,user_friends", {
            success: function(user) {
                saveUserInfo(function() {
                    redirectToHome();
                });
            },
            error: function(user, error) {
                alert("User cancelled the Facebook login or did not fully authorize.");
            }
        });
    }
    $scope.login = function() {
        // TODO: Only show login button once Facebook has loaded.
        tryLogin();
    };

    fb(function(FB) {
        FB.getLoginStatus(function(response) {
            if (response.status === "connected") {
                saveUserInfo(function() {
                    redirectToHome();
                });
            }
        });
    });
});
