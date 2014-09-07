app.controller("HomeCtrl", function($scope, fb) {
    $scope.name = "Loading...";
    fb(function(FB) {
        FB.api("/me", function(response) {
            $scope.name = response.name;
            $scope.$apply();
        });
    });
});
