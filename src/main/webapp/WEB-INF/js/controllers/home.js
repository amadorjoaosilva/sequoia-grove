'use strict';

/**
 * @ngdoc function
 * @name sequoiaGroveApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the sequoiaGroveApp
 */
angular.module('sequoiaGroveApp')
  .controller('HomeCtrl', function (
    $http,
    $log,
    $scope, 
    $location,
    $rootScope, 
    $translate)
  {

  // user is not logged in
  if ($rootScope.loggedIn == false) {
    $location.path('/login');
  }

  $scope.$on('translate', function(event, data) {
  }); 

  $scope.showDeliveries = false;
  $scope.highlight = false;
  $scope.type = 'all';

  // Change filter type to show - can be 'all', 'mine', a location or a position
  $scope.changeType = function(t) {
    $scope.type = t;
  }

  // Toggle Highlight of Current Logged in user
  $scope.selectLoggedInUser = function() {
    $scope.highlight = !$scope.highlight;
    // Possibly change the type to 'mine'?
  }

  $scope.filterByType = function (loc, pos, uid, mon, tue, wed, thu, fri, sat, sun) {
      if ($scope.type == 'all') {
          return true;
      }
      else if ($scope.type==loc || $scope.type==pos) {
          return true;
      }
      else if ($scope.type=='mine') {
        if (mon.eid == uid || tue.eid == uid || wed.eid == uid || thu.eid == uid ||
              fri.eid == uid || sat.eid == uid || sun.eid == uid) {
              return true;
          }
          else {
              return false;
          }
      }

      return false;
  }

  $scope.init = function() {
  }

  $scope.init();


});
