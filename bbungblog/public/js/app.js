angular.module('ctrladm', ['ngRoute','ngSanitize','ui.bootstrap','ctrladm.filters', 'ctrladm.directives', 'ctrladm.services','ctrladm.controllers'])
// angular.module('App.Routes', [])
	.config(['$routeProvider', '$locationProvider','$httpProvider', function($routeProvider, $locationProvider,$httpProvider) {

		$routeProvider.
			when('/ctrladm/bbmodel', {
				controller: 'BbmodelCtrl' ,
				templateUrl: '/pages/bbmodel.jade'
			})			
			.when('/ctrladm/weekfail', {
				controller: 'WeekfailCtrl' ,
				templateUrl: '/pages/weekfail.jade'
			})
			.when('/ctrladm/agctl', {
				controller: 'AgCtlCtrl' ,
				templateUrl: '/pages/agctl.jade'
			})
			.otherwise({
				redirectTo: '/ctrladm/agctl'
			});
		$locationProvider.html5Mode(true);
		$httpProvider.interceptors.push('TokenInterceptor');
	}])
;