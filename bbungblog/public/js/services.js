angular.module('ctrladm.services',[])

.factory('$burl', function($q, $http, $window, $base){
	return {
		get: function(url){
			return '/api/v1.0' + url;
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


.factory('$bbmodelservice', function($q, $http, $window, $base, $burl){
	var obj = Object.create($base);  	
	obj.set($burl.get('/bbmodel'));
	console.log('after creation $groupservice url is ' + obj.getUrl());
	obj.change = function(q, suffix){
      var method = 'POST';
      var that = this;
      var deferred = $q.defer();
      // var url = $burl.get('/bbmodel') + '/devmodel/'+devmodel+'/mosver/'+mosver+'/plmnid/'+plmnid+'/mostype/'+mostype+'/bbmode/'+bbmode+'/bbtype/'+bbtype;
      var url = $burl.get('/bbmodel') + '/change';
      console.log('$bbmodelservice change');
      that.query(q, url, method, function(q, data){
          console.log(that.keyPrefix + ' $bbmodelservice change success ');
          console.log(data);
          console.log('--------------------------');
          deferred.resolve(data);
      }, function(q){
					console.log(that.keyPrefix + ' $bbmodelservice change failure error q is ' + q);
      });

      return deferred.promise;
  }

	obj.changeAll = function(q, suffix){
      var method = 'POST';
      var that = this;
      var deferred = $q.defer();
      // var url = $burl.get('/bbmodel') + '/devmodel/'+devmodel+'/mosver/'+mosver+'/plmnid/'+plmnid+'/mostype/'+mostype+'/bbmode/'+bbmode+'/bbtype/'+bbtype;
      var url = $burl.get('/bbmodel') + '/changeall';
      console.log('$bbmodelservice changeAll');
      that.query(q, url, method, function(q, data){
          console.log(that.keyPrefix + ' $bbmodelservice changeAll success ');
          console.log(data);
          console.log('--------------------------');
          deferred.resolve(data);
      }, function(q){
					console.log(that.keyPrefix + ' $bbmodelservice changeAll failure error q is ' + q);
      });

      return deferred.promise;
  }

  obj.summary = function(){
      var method = 'GET';
      var that = this;
      var deferred = $q.defer();
      var url = $burl.get('/bbmodel') + '/summary01';

      console.log('$bbmodelservice change');
      var q = '';
      that.query(q, url, method, function(q, data){
        console.log(that.keyPrefix + ' $bbmodelservice summary success ');
        console.log(data);
        console.log('--------------------------');
        deferred.resolve(data);
      }, function(q){
				console.log(that.keyPrefix + ' $bbmodelservice summary failure error q is ' + q);
      });

      return deferred.promise;
  }
	return obj;
})

.factory('$agctlservice', function($q, $http, $window, $base, $burl){
	var obj = Object.create($base);  	
	obj.set($burl.get('/agctl'));
	console.log('after creation $agctlservice url is ' + obj.getUrl());
	obj.change = function(q, suffix){
      var method = 'POST';
      var that = this;
      var deferred = $q.defer();
      var url = $burl.get('/agctl') + '/change';
      console.log('$agctlservice change');
      that.query(q, url, method, function(q, data){
          console.log(that.keyPrefix + ' $agctlservice change success ');
          console.log(data);
          console.log('--------------------------');
          deferred.resolve(data);
      }, function(q){
					console.log(that.keyPrefix + ' $agctlservice change failure error q is ' + q);
      });

      return deferred.promise;
  }	
  obj.changeAll = function(q, suffix){
      var method = 'POST';
      var that = this;
      var deferred = $q.defer();
      var url = $burl.get('/agctl') + '/changeall';
      console.log('$agctlservice changeAll');
      that.query(q, url, method, function(q, data){
          console.log(that.keyPrefix + ' $agctlservice changeAll success ');
          console.log(data);
          console.log('--------------------------');
          deferred.resolve(data);
      }, function(q){
					console.log(that.keyPrefix + ' $agctlservice changeAll failure error q is ' + q);
      });

      return deferred.promise;
  }	
	return obj;
})

.factory('TokenInterceptor', function ($q, $window, $location) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            // if ($window.sessionStorage.token) {
            //     config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            // }
            return config;
        },
 
        response: function (response) {
            return response || $q.when(response);
        },
        responseError: function(rejection){
        	console.log('-------TokenInterceptor -------->>>>> ');
        	console.log(rejection);
        	console.log('-------TokenInterceptor -------->>>>> ');
        	if(rejection.status == 401){
        		console.log('-------TokenInterceptor status  ' + rejection.status);
        		$window.document.location.href = '/login';

        	}
        }
    };
})

.factory('$userservice', function($q, $http, $window, $base, $burl){
	var obj = Object.create($base);
  obj.set($burl.get('/user'));
	console.log('after creation $userservice url is ' + obj.getUrl());
	// /eo4/api/v1.0/group/mapap/:group_id/:ap_id
	obj.get_menus = function(q, suffix){
		var method = 'GET';
		var that = this;
		var deferred = $q.defer();
		console.log('get_menus suffix is ' + suffix);
		var url = $burl.get('/user/menus') + '/list' + (_.isUndefined(suffix)?'':suffix);
		console.log('$get_menus url is ' + url);

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
})

;


