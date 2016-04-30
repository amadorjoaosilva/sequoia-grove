'use strict';

/**
 * @ngdoc function
 * @name sequoiaGroveApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the sequoiaGroveApp
 */
angular.module('sequoiaGroveApp')
  .controller('LoginCtrl', function (
        $http,
        $location,
        $log,
        $rootScope,
        $scope,
        $q,
        $sha,
        scheduleFactory,
        localStorageService){

    $scope.email = $rootScope.loggedInUser.email;
    $scope.password = '1234';
    $scope.remember = true;

    $scope.updateRemember = function() {
      if ($scope.remember) {
      }
      else {
        localStorageService.remove('email');
      }
    }

    // User tried to go back to the login page when they were alredy logged in.
    // redirect back to home
    if ($rootScope.loggedIn) {
      $location.path( "/home" );
      $rootScope.loggingIn = false;
    }

    // User initialized login
    $scope.appLogin = function() {
      $rootScope.loggingIn = true;

      // reset login error flags
      $rootScope.loggedIn = false;
      $rootScope.blankEmailOrPassword = false;
      $rootScope.invalidEmailOrPassword = false;
      $rootScope.userNotCurrent = false;
      $rootScope.loginFailed = false;

      $http.post("/sequoiagrove/auth/login/", {'email':$scope.email, 'password':$sha.hash($scope.password)}).
        then(function(success){
            // Blank Email or Password
            if (success.data.blankEmailOrPassword) {
              $rootScope.blankEmailOrPassword = true;
              $log.debug(success.data.email, 'blank email or password supplied');
              $rootScope.loggedInUser = {'email':success.data.email, 'isManager':false};
              $rootScope.loggingIn = false;
              return;
            }
            // The user with the supplied email was not found in the database.
            // Issue warning message, don't redirect to home
            if (success.data.invalidEmailOrPassword) {
              $rootScope.invalidEmailOrPassword = true;
              $log.debug(success.data.email, 'not registered with this application');
              $rootScope.loggedInUser = {'email':success.data.email, 'isManager':false};
              $rootScope.loggingIn = false;
              return;
            }
            // The user has been unemployed from the company
            if (success.data.userNotCurrent) {
              $rootScope.userNotCurrent = true;
              $log.debug(success.data.email, 'is not a current employee');
              $rootScope.loggedInUser = {'email':success.data.email, 'isManager':false};
              $rootScope.loggingIn = false;
              return;
            }
            // the login failed - maybe the domain was incorrect
            if (success.data.loginFailed) {
              $rootScope.loginFailed = true;
              $log.debug('sign in failed');
              $rootScope.loggedInUser = {'email':success.data.email, 'isManager':false};
              $rootScope.loggingIn = false;
              return;
            }
            // Otherwise, we found the user - save that user's data
            $rootScope.invalidEmailOrPassword = false;
            $rootScope.loggedInUser = success.data.user;
            $rootScope.loggedInUser.isManager = success.data.user.classification != 'employee';
            //localStorageService.set('auth_token', success.data.auth_token);

            // TODO if the user wants to save their email

            $log.debug(success.data.user);
            if ($scope.remember && success.data.user) {
              localStorageService.set('email', JSON.stringify(success.data.user.email));
            }

            // then call function to load all required data and redirect to home
            // this sets logged in after data has loaded.
            $scope.initializeData();
        },
        function(error) {
          $log.debug(error);
        });
    }

    // When user has logged in, this will load required data based
    // on user access level, and then redirect to home.
    $scope.initializeData = function() {
      //if($rootScope.devMode) {
        //if (localStorageService.get('template')){
          //$rootScope.template = JSON.parse(localStorageService.get('template'));
        //}
        //if(localStorageService.get('employees')) {
          //$rootScope.employees = JSON.parse(localStorageService.get('employees'));
        //}
      //}
      scheduleFactory.setManagePrivelage();
      scheduleFactory.init().then(
          function(success) {
            return $scope.getEmployees();
          }).then(function(success) {
            // get positions
            return $scope.getPositions();
        }).then(function(success) {
            return $scope.getDeliveries();
        }).then(function(success) {
            // finally, redirect to last path, or home if none
            $scope.loading = false;
            $log.debug('loading complete');
            $rootScope.loggingIn = false;
            $rootScope.loggedIn = true;
            $rootScope.$broadcast('loggedIn');
            //$log.debug('logged in as', success.data.user.fullname, "(",success.data.user.email, ")");
            $location.path(localStorageService.get('lastPath'));
      });
    }

  // check if token and session is valid
  $scope.validateToken = function() {
    return $http({
      url: '/sequoiagrove/auth/loginwithtoken',
      method: "POST",
      data: {'auth_token':$rootScope.token}
    }).then(
        function(success) {
          $log.debug(success);
          $rootScope.hasValidToken = success.data.valid;

          if (success.data.valid) {
            $rootScope.token = success.data.token;
            //localStorageService.set('auth_token', success.data.auth_token);

            $rootScope.invalidEmailOrPassword = false;
            $rootScope.loggedInUser = success.data.user;
            $rootScope.loggedInUser.isManager = success.data.user.classification != 'employee';

            // save user
            if ($scope.remember && success.data.user) {
              localStorageService.set('email', JSON.stringify(success.data.user.email));
            }
            // then call function to load all required data and redirect to home
            // this sets logged in after data has loaded.
            $scope.initializeData();
          }
        }, function(failure) {
          //$log.debug('error verifying token');
          // reset data
          $scope.destructData();
      })
    }

    // When a user has logged out, this will clear variables to reset
    // the application to a clean state
    $scope.destructData = function() {
      //localStorageService.remove('auth_token');

      // reset login error flags
      $rootScope.loggingIn = false;
      $rootScope.loggedIn = false;
      $rootScope.blankEmailOrPassword = false;
      $rootScope.invalidEmailOrPassword = false;
      $rootScope.userNotCurrent = false;
      $rootScope.loginFailed = false;
      $rootScope.token = '';
      $rootScope.hasValidToken = false;
      $rootScope.initializedData = false;
      $rootScope.loggedInUser= {'email':JSON.parse(localStorageService.get('email'))};

      $location.path('/login');
    }

/************** Event Watchers **************/

    if ($rootScope.token) {
      $rootScope.loggingIn = true;
      $scope.validateToken().then(
        function(success) {
          //$log.debug(success);
        }, function(failure) {
          //$log.debug(failure);
      });
    }

    $rootScope.$on('login', function() {
      $scope.appLogin();
    });

    $rootScope.$on('logout', function() {
      $scope.destructData();
    });

  });
