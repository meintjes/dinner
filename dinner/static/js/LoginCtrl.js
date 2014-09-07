app.controller("LoginCtrl", function($scope, fb) {
    function redirectToHome() {
        window.location = "/#/home";
    }
    function tryLogin() {
        Parse.FacebookUtils.logIn("public_profile,user_friends", {
            success: function(user) {
                redirectToHome();
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
                redirectToHome();
            }
        });
    });
});
