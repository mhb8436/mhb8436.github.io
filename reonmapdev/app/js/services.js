angular.module('deitel.services',[])

.factory('$burl', function($q, $http, $window, $base){
	return {
		get: function(url){
			// return '/' + url;
			return url;
		}
	}
}) 

.factory('$base', function($q, $http, $window){

	this.url = '';

	return {
		set: function(url){
		  this.url = url;
		},
		getUrl: function(){
		  return this.url;
		},

		query: function(q, url, method, onSuccess, onFailure){
		  onSuccess = onSuccess || function() {};
		  onFailure = onFailure || function() {};
		  var headers = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
		  var xsrf = _.isUndefined(q) ? '' : $.param(q);		  
		  console.log('-------- query ---------');
		  console.log(xsrf);
		  $http({method:method, data:xsrf, headers:headers, url:url})
		    .success(function(data){
		      onSuccess(q, data);
		    })
		    .error(function(data){
		      onFailure(q);
		    })
		},

		get: function(q, suffix){
		  var method = 'POST';
		  var that = this;
		  var deferred = $q.defer();
		  var url = this.url + '/list' + (_.isUndefined(suffix)?'':suffix);
		  console.log('get method url is ' + url);
		  console.log('suffix is ' + suffix);

		  that.query(q, url, method, function(q, data){
		    deferred.resolve(data);
		  }, function(q){
		  });

		  return deferred.promise;
		},

		view: function(q, suffix){
		  var method = 'GET';
		  var that = this;
		  var deferred = $q.defer();
		  var url = this.url + '/view' + (_.isUndefined(suffix)?'':suffix);

		  that.query(q, url, method, function(q, data){
		    deferred.resolve(data);
		  }, function(q){
		  });

		  return deferred.promise;
		},

		add: function(q,suffix){
		  var method = 'POST';
		  var that = this;
		  var deferred = $q.defer();
		  var url = this.url + '/add' + (_.isUndefined(suffix)?'':suffix);

		  that.query(q, url, method, function(q, data){
		    deferred.resolve(data);
		  }, function(q){
		  })
		  return deferred.promise;
		},

		edit: function(q,suffix){
		  var method = 'POST';
		  var that = this;
		  var deferred = $q.defer();
		  var url = this.url + '/edit' + (_.isUndefined(suffix)?'':suffix);

		  that.query(q, url, method, function(q, data){
		    deferred.resolve(data);
		  }, function(q){
		  })
		  return deferred.promise;
		},

		delete: function(q,suffix){
		  var method = 'POST';
		  var that = this;
		  var deferred = $q.defer();
		  var url = this.url + '/delete' + (_.isUndefined(suffix)?'':suffix);

		  that.query(q, url, method, function(q, data){
		    deferred.resolve(data);
		  }, function(q){
		  })
		  return deferred.promise;
		}
	} // end of return 
})

// .factory('TokenInterceptor', function ($q, $window, $location) {
//   return {
//     request: function (config) {
//       config.headers = config.headers || {};
//       return config;
//     },

//     response: function (response) {
//       return response || $q.when(response);
//     },
//     responseError: function(rejection){
//     	console.log('-------TokenInterceptor -------->>>>> ');
//     	console.log(rejection);
//     	console.log('-------TokenInterceptor -------->>>>> ');
//     	if(rejection.status == 401){
//     		console.log('-------TokenInterceptor status  ' + rejection.status);
//     		$window.document.location.href = '/login';
//     	}
//     }
//   };
// })

.factory('$sampleservice', function($q, $http, $window, $base, $burl){
	var obj = Object.create($base);
 	obj.set($burl.get('/data'));
	console.log('after creation $groupservice url is ' + obj.getUrl());

	obj.listMainMap = function(q, suffix){
		var method = 'GET';
		var that = this;
		var deferred = $q.defer();
		// console.log('ap_group suffix is ' + suffix);
		var url = $burl.get('/data') + '/jj01.json';
		// console.log('$baseService url is ' + url);

		that.query(q, url, method, function(q, data){
			console.log(that.keyPrefix + ' get success ');
			console.log(data);
			console.log('--------------------------');
			deferred.resolve(data);
		}, function(q){
			console.log(that.keyPrefix + ' get failure error q is ' + q);
		});

		return deferred.promise;
	};

	obj.listSchoolMap = function(q, suffix){
		var method = 'GET';
		var that = this;
		var deferred = $q.defer();
		// console.log('ap_group suffix is ' + suffix);
		var url = $burl.get('/data') + '/jj04.json';
		// console.log('$baseService url is ' + url);

		that.query(q, url, method, function(q, data){
			console.log(that.keyPrefix + ' get success ');
			console.log(data);
			console.log('--------------------------');
			deferred.resolve(data);
		}, function(q){
			console.log(that.keyPrefix + ' get failure error q is ' + q);
		});

		return deferred.promise;
	};


	return obj;
});

