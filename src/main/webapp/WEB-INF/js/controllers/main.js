'use strict';

/**
 * @ngdoc function
 * @name sequoiaGroveApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sequoiaGroveApp
 */
angular.module('sequoiaGroveApp')
  .controller('MainCtrl', function (
    $http,
    $scope,
    $rootScope,
    $route,
    $translate,
    $location,
    $log,
    localStorageService) 
{

  // Sample Data for current logged in user
  // The logged in user's id is what is matched for highlighting
  $scope.user1 = { id:1, firstname: "John", lastname: "Doe", type: "manager" };
  $scope.user2 = { id:2, firstname: "Smith", lastname: "theEmployee", type: "employee" };
  $scope.user = $scope.user1;
  localStorageService.set('SequoiaGrove.user', $scope.user);
  $scope.currentEmployees = [];
  $scope.allEmployees = [];
  $scope.hasPosition = [];
  // shifts that were changed from old shifts and need to be saved to database
  $scope.updateShifts = [];
  // employee info that was changed and needs to be saved to database
  $scope.empNewInfo = {
      maxhrs:null,
      isManager:null,
      clock:null,
      fname:null,
      lname:null,
      phone:null,
      bdate:null
  };
  $scope.schCount = [[],[],[],[],[],[],[]];
  $scope.previousTemplate = [];
  $scope.previousShifts = { mon:[], tue:[], wed:[], thu:[], fri:[], sat:[], sun:[] };

  // container of  a simplification of the scheudle template shifts
  // used to check that updating a shift is making a chage or not
  $scope.oldShifts = { mon:[], tue:[], wed:[], thu:[], fri:[], sat:[], sun:[] };

  // Locale settings
  $scope.lang = 'en';
  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey);
    $scope.lang = langKey;
    localStorageService.set('SequoiaGrove.lang', langKey);
    $scope.$broadcast('translate');
  };

  // UI 'Active' Tab Settings
  $scope.changeTab = function(tab) {
      var path = $location.path();
      var length = path.length;
      if(tab == path.substring(0,length)) {
          return "active";
      }
      else {
          return "";
      }
  }
  // highlight name
  $scope.highlight = false;

  // container for displaying the date header
  // val 'DD-MM-YYYY' format, disp 'MMM-D' format
  $scope.date = { 
    mon:{val:'', disp:''}, 
    tue:{val:'', disp:''}, 
    wed:{val:'', disp:''}, 
    thu:{val:'', disp:''}, 
    fri:{val:'', disp:''}, 
    sat:{val:'', disp:''}, 
    sun:{val:'', disp:''}};

  // Set Schedule Header Dates, and Date String Values
  $scope.setScheduleHeader = function() {
    var daysAgo = 0;
    var dayName = moment().format('dddd');
    var mondayDateString = '';

    //Figure out how many days ago monday was
    if (dayName != 'Monday') {
      while(dayName != 'Monday') {
        daysAgo++;
        dayName = moment().subtract(daysAgo, 'days').format('dddd');
        mondayDateString = moment().subtract(daysAgo, 'days').format('DD-MM-YYYY');
      }
    }
    else {
      mondayDateString = moment().subtract(0, 'days').format('DD-MM-YYYY');
    }

    // Setup Monday
    $scope.date.mon.val = mondayDateString;
    $scope.date.mon.disp = moment().subtract(daysAgo, 'days').format('MMM-D');

    // Use Monday to setup the rest of the weekdays
    $scope.date.tue.val  = moment(mondayDateString, 'DD-MM-YYYY').add(1, 'days').format('DD-MM-YYYY');
    $scope.date.tue.disp = moment(mondayDateString, 'DD-MM-YYYY').add(1, 'days').format('MMM-D');
    $scope.date.wed.val  = moment(mondayDateString, 'DD-MM-YYYY').add(2, 'days').format('DD-MM-YYYY');
    $scope.date.wed.disp = moment(mondayDateString, 'DD-MM-YYYY').add(2, 'days').format('MMM-D');
    $scope.date.thu.val  = moment(mondayDateString, 'DD-MM-YYYY').add(3, 'days').format('DD-MM-YYYY');
    $scope.date.thu.disp = moment(mondayDateString, 'DD-MM-YYYY').add(3, 'days').format('MMM-D');
    $scope.date.fri.val  = moment(mondayDateString, 'DD-MM-YYYY').add(4, 'days').format('DD-MM-YYYY');
    $scope.date.fri.disp = moment(mondayDateString, 'DD-MM-YYYY').add(4, 'days').format('MMM-D');
    $scope.date.sat.val  = moment(mondayDateString, 'DD-MM-YYYY').add(5, 'days').format('DD-MM-YYYY');
    $scope.date.sat.disp = moment(mondayDateString, 'DD-MM-YYYY').add(5, 'days').format('MMM-D');
    $scope.date.sun.val  = moment(mondayDateString, 'DD-MM-YYYY').add(6, 'days').format('DD-MM-YYYY');
    $scope.date.sun.disp = moment(mondayDateString, 'DD-MM-YYYY').add(6, 'days').format('MMM-D');

  }

  // View Next or Previous Week
  $scope.changeWeek = function(operation) {
    $scope.previousShifts = { mon:[], tue:[], wed:[], thu:[], fri:[], sat:[], sun:[] };
    var nextMonday = '';

    // Set Monday Next Week
    if (operation == 'add') {
      $scope.previousTemplate = $scope.template;
      nextMonday = moment($scope.date.mon.val, 'DD-MM-YYYY').add(7, 'days').format('DD-MM-YYYY');
    }
    // Set Monday Previous Week
    else{
      nextMonday = moment($scope.date.mon.val, 'DD-MM-YYYY').subtract(7, 'days').format('DD-MM-YYYY');
    }

    // Adjust the rest of the weekdays to match Monday
    $scope.date.mon.val  = moment(nextMonday, 'DD-MM-YYYY').add(0, 'days').format('DD-MM-YYYY');
    $scope.date.mon.disp = moment(nextMonday, 'DD-MM-YYYY').add(0, 'days').format('MMM-D');
    $scope.date.tue.val  = moment(nextMonday, 'DD-MM-YYYY').add(1, 'days').format('DD-MM-YYYY');
    $scope.date.tue.disp = moment(nextMonday, 'DD-MM-YYYY').add(1, 'days').format('MMM-D');
    $scope.date.wed.val  = moment(nextMonday, 'DD-MM-YYYY').add(2, 'days').format('DD-MM-YYYY');
    $scope.date.wed.disp = moment(nextMonday, 'DD-MM-YYYY').add(2, 'days').format('MMM-D');
    $scope.date.thu.val  = moment(nextMonday, 'DD-MM-YYYY').add(3, 'days').format('DD-MM-YYYY');
    $scope.date.thu.disp = moment(nextMonday, 'DD-MM-YYYY').add(3, 'days').format('MMM-D');
    $scope.date.fri.val  = moment(nextMonday, 'DD-MM-YYYY').add(4, 'days').format('DD-MM-YYYY');
    $scope.date.fri.disp = moment(nextMonday, 'DD-MM-YYYY').add(4, 'days').format('MMM-D');
    $scope.date.sat.val  = moment(nextMonday, 'DD-MM-YYYY').add(5, 'days').format('DD-MM-YYYY');
    $scope.date.sat.disp = moment(nextMonday, 'DD-MM-YYYY').add(5, 'days').format('MMM-D');
    $scope.date.sun.val  = moment(nextMonday, 'DD-MM-YYYY').add(6, 'days').format('DD-MM-YYYY');
    $scope.date.sun.disp = moment(nextMonday, 'DD-MM-YYYY').add(6, 'days').format('MMM-D');
    
    // save old template
    $scope.previousTemplate = $scope.template; 
    $scope.previousShifts = $scope.oldShifts;

    $scope.getScheduleTemplate();
  }

  $scope.getPositions = function() {
    $http({
      url: '/sequoiagrove/position',
      method: "GET"
    }).success(function (data, status, headers, config) {
        $scope.positions = data.positions;
    }).error(function (data, status, headers, config) {
        $log.error(status + " Error obtaining position data: " + data);
    });
  }

  $scope.getHasPositions = function() {
    $http({
      url: '/sequoiagrove/position/has',
      method: "GET"
    }).success(function (data, status, headers, config) {
        $scope.hasPosition = data.hasPositions;
    }).error(function (data, status, headers, config) {
        $log.error(status + " Error obtaining has position data: " + data);
    });
  }

  $scope.getLocations = function() {
    $http({
      url: '/sequoiagrove/position/location',
      method: "GET"
    }).success(function (data, status, headers, config) {
        $scope.locations = data.locations;

    }).error(function (data, status, headers, config) {
        $log.error(status + " Error obtaining location data: " + data);
    });
  }

  // Get The Schedule for the week currently being viewed
  $scope.getScheduleTemplate = function() {
    // clear out old shifts
    $scope.oldShifts = { mon:[], tue:[], wed:[], thu:[], fri:[], sat:[], sun:[] };
    $http({
      url: '/sequoiagrove/schedule/template/' +
            $scope.date.mon.val + '/' +
            $scope.date.tue.val + '/' +
            $scope.date.wed.val + '/' +
            $scope.date.thu.val + '/' +
            $scope.date.fri.val + '/' +
            $scope.date.sat.val + '/' +
            $scope.date.sun.val + '/',
      method: "GET"
    }).success(function (data, status, headers, config) {
        $scope.template = data.template;
        //$log.debug(data);
        // initialize a simpler container for checking when updating shifts

        var i=0;
        var len = $scope.template.length;
        for(; i<len; i++){
          // Monday
          $scope.oldShifts.mon.push({
            eid: $scope.template[i].mon.eid,
            sid: $scope.template[i].sid,
            date: $scope.date.mon.val
          });
          // Tuesday
          $scope.oldShifts.tue.push({
            eid: $scope.template[i].tue.eid,
            sid: $scope.template[i].sid,
            date: $scope.date.tue.val
          });
          // Wednesday
          $scope.oldShifts.wed.push({
            eid: $scope.template[i].wed.eid,
            sid: $scope.template[i].sid,
            date: $scope.date.wed.val
          });
          // Thursday
          $scope.oldShifts.thu.push({
            eid: $scope.template[i].thu.eid,
            sid: $scope.template[i].sid,
            date: $scope.date.thu.val
          });
          // Friday
          $scope.oldShifts.fri.push({
            eid: $scope.template[i].fri.eid,
            sid: $scope.template[i].sid,
            date: $scope.date.fri.val
          });
          // Saturday
          $scope.oldShifts.sat.push({
            eid: $scope.template[i].sat.eid,
            sid: $scope.template[i].sid,
            date: $scope.date.sat.val
          });
          // Sunday
          $scope.oldShifts.sun.push({
            eid: $scope.template[i].sun.eid,
            sid: $scope.template[i].sid,
            date: $scope.date.sun.val
          });
        }
          //$scope.countDays();

    }).error(function (data, status, headers, config) {
        $log.error(status + " Error saving update shifts schedule : " + data);
    });
  }

  // Get Current Employees with their id
  $scope.getEmployeeCurrent = function() {
    $http({
      url: '/sequoiagrove/employee/info/current',
      method: "GET"
    }).success(function (data, status, headers, config) {
        $scope.currentEmployees = data.employeeInfo;
        $scope.getScheduleTemplate();
        //$log.debug(data);

    }).error(function (data, status, headers, config) {
        $log.error(status + " Error obtaining current employee: " + data);
    });
  }

  // Get All Employees with their id
  $scope.getEmployeeAll = function() {
    $http({
      url: '/sequoiagrove/employee/info/all',
      method: "GET"
    }).success(function (data, status, headers, config) {
        $scope.allEmployees = data.employeeInfo;
        //$log.debug(data);
        $scope.getEmployeeCurrent();

    }).error(function (data, status, headers, config) {
        $log.error(status + " Error obtaining all employee: " + data);
    });
  }


  $scope.formatTime = function(h, m, ampm) {
    // we can use moment to parse times to display correctly on the front end
    //$log.debug(moment({hour:16, minute:10}).format('h:mm a'));
    if (ampm) {
      return moment({hour:h, minute:m}).format('h:mm a');
    }
    return moment({hour:h, minute:m}).format('h:mm');
  }

  $scope.hrMinTo24 = function(h, m) {
    if(h < 10) {
      h = "0"+h;
    }
    else {
      h = h+"";
    }
    if(m < 10) {
      m = "0"+m;
    }
    else {
     m = m+"";
    }
    return h+m;
  }

  $scope.countDays = function() {
    // clear schedule count
    $scope.schCount = [[],[],[],[],[],[],[]];
    var i=0;
    var len = $scope.currentEmployees.length;
    var k=0;
    var tempLen = $scope.template.length;

    var count = 0;
    var checkId = 0;
    var name = '';

    for(; i<len; i++) {
      checkId = $scope.currentEmployees[i].id
      name = $scope.currentEmployees[i].firstName;
      count = 0;
      k=0;
      for(; k<tempLen; k++) {
        if($scope.template[k].mon.name == name ||
           $scope.template[k].tue.name == name ||
           $scope.template[k].wed.name == name ||
           $scope.template[k].thu.name == name ||
           $scope.template[k].fri.name == name ||
           $scope.template[k].sat.name == name ||
           $scope.template[k].sun.name == name) {
          count++;
        }
      }

      $scope.schCount[count-1].push({id:checkId, name:name});

    }
    //$log.debug($scope.schCount);
  }

  // Initialize controller
  $scope.init = function() {
    $scope.changeTab('/home');
    $scope.setScheduleHeader();
    $scope.getPositions();
    $scope.getLocations();
    $scope.getEmployeeAll();
    $scope.getHasPositions();
  }

  $scope.init();
});
