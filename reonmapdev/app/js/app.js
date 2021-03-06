
angular.module('deitel', ['ngRoute','ngSanitize','deitel.directives', 'deitel.services','deitel.controllers'])

.config(['$routeProvider', '$locationProvider','$httpProvider', function($routeProvider, $locationProvider,$httpProvider) {

	$routeProvider

		.when('/s01', {
			controller: 'SampleCtrl' ,
			templateUrl: '/views/sample.html'
		})
		.when('/s02', {
			controller: 'OneCtrl' ,
			templateUrl: '/views/one.html'
		})

		// .otherwise({
		// 	redirectTo: '/sample'
		// });
	$locationProvider.html5Mode(true);
	// $httpProvider.interceptors.push('TokenInterceptor');
}]);

