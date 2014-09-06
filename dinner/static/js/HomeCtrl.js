app.controller("HomeCtrl", function($scope) {
    $scope.name = "Loading...";
    FB.api("/me", function(response) {
        $scope.name = response.name;
    });
});
