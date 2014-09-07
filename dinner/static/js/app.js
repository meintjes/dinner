var app = angular.module("dinner", ["ngRoute", "angularParse", "ui.bootstrap"]);

app.config(["$routeProvider", function($routeProvider) {
    $routeProvider
    .when("/login", {
        templateUrl: "/templates/Login.html",
        controller: "LoginCtrl"
    })
    .when("/home", {
        templateUrl: "/templates/Home.html",
        controller: "HomeCtrl"
    })
    .otherwise({
        redirectTo: "/login"
    });
}]);
