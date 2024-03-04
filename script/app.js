angular
  .module("myApp", [])
  .controller("myCtrl", function ($scope, $http) {
    $http
      .get("/data.json")
      .then(function (response) {
        $scope.pets = response.data;
      })
      .catch(function (error) {
        console.error("Error fetching data:", error);
      });
  });
