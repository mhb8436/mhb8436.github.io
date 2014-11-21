angular.module('ctrladm.controllers', [])
	.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

	  $scope.items = items;
	  $scope.selected = {
	    item: $scope.items[0]
	  };

	  $scope.ok = function () {
	    $modalInstance.close($scope.selected.item);
	  };

	  $scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
	  };
	})
	
	.controller('BbmodelCtrl', 
			function($window,$timeout,$location,$scope,$routeParams,$filter,$bbmodelservice,$burl,$base, $userservice, $modal, $log, $compile){
		$log.info('begin DomainCtrl ....');
		$scope.activeParentMenuValue = false;
		$scope.activeMenuValue = function(url){
			$scope.activeParentMenuValue = true;
			if(url == $location.path()){
				return true;
			}else{
				return false;
			}
		}

		$scope.signout = function(){
			$log.info('signout !!!' + $location.path() );
			// $location.path('/logout');
			$window.location.href = '/logout';
			$log.info('location.path moved...' + $location.path() );
		};

		$scope.menuOptions = {};
		$scope.menuOptions.data = [];
		var pp = $userservice.get_menus([],'');
		pp.then(function(data){
			$log.info('------- this is menus -------');			
			angular.forEach(data,function(d){
				$log.info(d['parent']);
				var mm = d['parent'].split('-');
				d.menuid = mm[0];
				d.menunm = mm[1];
				d.url = mm[2];
			});	
			$scope.menuOptions.data = data;
		});

		$scope.searchers = [];
		$scope.ignitecnt = 0;
		$('#mainTable tfoot th').each( function () {
			$scope.searchers.push('~217*%');
		});
		$scope.setSearcher = function(idx, value){
			$scope.searchers[idx] = value;
		}

    $scope.sum = {new:0, test:0};

    $scope.slOption1 = {
        type : 'bar',
        barColor : '#4b99cb',
        height : '20px',
        barWidth : "10px",
        barSpacing : "2px",
        zeroAxis : "false"
    };
    $scope.slOption2 = {
        type : 'bar',
        barColor : '#FF9F01',
        height : '20px',
        barWidth : "10px",
        barSpacing : "2px",
        zeroAxis : "false"
    };
    
    $scope.summaries = [];
    $scope.summaries.sum = {new:0, test:0};
    var promise11 = $bbmodelservice.summary();
    var t_total = 0, n_total = 0;
    promise11.then(function(data){
        var aa = [], ab = [];
        angular.forEach(data, function(d, i){
            console.log(d);
            if(i > 0){
                t_total += parseInt(d.testModel);
                n_total += parseInt(d.newModel);

                aa.push(d.newModel);
                ab.push(d.testModel);
            }
        });
        console.log('----- $bbmodelservice.summary(); log started ------ ');
        $scope.summaries.sum.new = n_total;
        $scope.summaries.sum.test = t_total;

        $scope.n_summaries = aa;
        $scope.t_summaries = ab;
        console.log(JSON.stringify($scope.n_summaries) + ' ' + JSON.stringify($scope.t_summaries));
        console.log('----- $bbmodelservice.summary(); log ended ------ ');
    });

		$scope.overrideOptions = {
		// define table layout
			"dom": '<"toolbar"><"top"ipT<"clear">>rt<"bottom"p<"clear">>',
			// "sDom": 'T<"clear">lfrtip',
			"bAutoWidth": false,
			"pageLength": 20,
			"processing": true,
			"serverSide": true,
			"ajax": "/api/v1.0/bbmodel/list",
      "ignitecnt" : $scope.ignitecnt,
      "columnDefs": [
          { "visible": false, "targets": 0 }
      ],
      "order": [[ 0, 'asc' ]],
      // "displayLength": 25,
      "drawCallback": function ( settings ) {
      	$compile($("div.toolbar").html('<a class="btn btn-default btn-mini" ng-click="updateAll(\'bbmode\',\'B\')">BB</a><a class="btn btn-default btn-mini" ng-click="updateAll(\'bbmode\',\'A\')">AB</a><a class="btn btn-default btn-mini" ng-click="updateAll(\'bbmode\',\'N\')">No</a><a class="btn btn-default btn-mini" ng-click="updateAll(\'bbtype\',\'H\')">H</a><a class="btn btn-default btn-mini" ng-click="updateAll(\'bbtype\',\'M\')">M</a>'))($scope);
        var api = this.api();
        var rows = api.rows( {page:'current'} ).nodes();
        var last=null;
				var data = api.rows( {page:'current'} ).data();
        api.column(0, {page:'current'} ).data().each( function ( group, i ) {
          if ( last !== group ) {
        		var d = data[i];
        		// $log.info(d);
        		var buttons = ''+
        		'&nbsp;&nbsp;&nbsp; <a class="btn '+(d[5] == 'B' ? 'btn-inverse':'btn-default')+' btn-mini" ng-click="update(\''+d[2]+'\',\''+d[3]+'\',\''+d[1]+'\',\'A\', \''+d[5]+'|B\',\''+d[6]+'\')">BB</a> <a class="btn '+(d[5] == 'A' ? 'btn-inverse':'btn-default')+' btn-mini" ng-click="update(\''+d[2]+'\',\''+d[3]+'\',\''+d[1]+'\',\'A\',  \''+d[5]+'|A\',\''+d[6]+'\')">AB</a> <a class="btn '+(d[5] == 'N' ? 'btn-inverse':'btn-default')+' btn-mini" ng-click="update(\''+d[2]+'\',\''+d[3]+'\',\''+d[1]+'\',\'A\', \''+d[5]+'|N\',\''+d[6]+'\')">No</a>' +
            '&nbsp;&nbsp;&nbsp; <a class="btn '+(d[6] == 'H' ? 'btn-inverse':'btn-default')+' btn-mini" ng-click="update(\''+d[2]+'\',\''+d[3]+'\',\''+d[1]+'\',\'A\',\''+d[5]+'\', \''+d[6]+'|H\')">H</a> <a class="btn '+(d[6] == 'M' ? 'btn-inverse':'btn-default')+' btn-mini" ng-click="update(\''+d[2]+'\',\''+d[3]+'\',\''+d[1]+'\',\'A\',\''+d[5]+'\', \''+d[6]+'|M\')">M</a>';
            $(rows).eq( i ).before(
                '<tr class="group"><td colspan="4">'+d[0]+'</td><td colspan="5">'+buttons+'</td></tr>'
            );
            $compile($(rows).eq(i).prev())($scope);	
            last = group;
          }
        });
					// search box 
				$('#mainTable tfoot th').each( function () {
					var title = $('#mainTable thead th').eq( $(this).index() ).text();
					// var sss = _.isUndefined($scope.searchers[$(this).index()])?"":$scope.searchers[$(this).index()];
					var sss = _.isUndefined($scope.searchers[$(this).index()]) || $scope.searchers[$(this).index()]=='~217*%'?"":$scope.searchers[$(this).index()];
					$(this).html( '<input style="max-width:100px;" type="text" placeholder="Search '+title+'" value="'+sss+'"/>' );
				});
				// Apply the search
		    api.columns().eq( 0 ).each( function ( colIdx ) {
	        $( 'input', api.column( colIdx ).footer() ).on( 'keyup change', function () {
	        	api.column( colIdx ).search( this.value ).draw();
	        	$scope.setSearcher(colIdx-1, this.value);
	        });
		    });
      }
		};

		$scope.items = [];
		$scope.dataTable ={};		
		$scope.confirmModalHtml = '<div class="modal-header"><h3 class="modal-title">Confirm</h3></div> <div class="modal-body">Do you want to continue this process ? </div><div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button><button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>';
		$scope.update = function(devmodel,mosver,plmnid,mostype,BBmode,BBtype){
			// update Item
			var q = {
				'devmodel':devmodel, 'mosver':mosver, 'plmnid':plmnid, 'mostype':mostype, 'BBmode':BBmode, 'BBtype':BBtype
			};

			// $scope.items = [];
			$log.info('update start....[' + devmodel + '-' + mosver + '-' + plmnid + '-' + mostype  + '->' + BBmode + ':' + BBtype + ']');
	    var modalInstance = $modal.open({
	      template: $scope.confirmModalHtml,
	      controller: 'ModalInstanceCtrl',
	      size: 'sm',
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }
	    });

	    modalInstance.result.then(function (selectedItem) {
				
	      var promise = $bbmodelservice.change(q, '');
  	    promise.then(function(data){
  	    	$log.info(data);  	    	
  	    	$log.info('after bbmode update result is '+$scope.ignitecnt++);
  	    });
	  	}, function () {
		      $log.info('Modal dismissed at: ' + new Date());
		  });

		};
		$scope.alertshow = false;
		$scope.alertmsg = '';
		$scope.updateAll = function(columns, value){
			$log.info('$scope.updateAll begin '); 
			// $scope.items = [];
			var modalInstance = $modal.open({
	      template: $scope.confirmModalHtml,
	      controller: 'ModalInstanceCtrl',
	      size: 'sm',
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }
	    });

			modalInstance.result.then(function (selectedItem) {
				var q = {};
				q.filter = $scope.searchers;
				q.columns = columns;
				q.value = value;
	      var promise = $bbmodelservice.changeAll(q, '');
  	    promise.then(function(data){
  	    	$log.info('------- result of changeAll ------');
  	    	$log.info(data);
  	    	if(data == '203'){
  	    		$scope.alertshow = true;
  	    		$scope.alertmsg = 'Please select filtering condition at least more than 3 ';
  	    	}else{
	  	    	$log.info(data);
	  	    	$log.info('after bbmode update result is '+$scope.ignitecnt++);  	    		
  	    	}
  	    });
	  	}, function () {
		      $log.info('Modal dismissed at: ' + new Date());
		  });
		};

		$scope.$watch('alertshow', function(value){
			$log.info('alertshow watch is ' + value);
			if(value == true){
				$timeout(function(){
					$scope.alertshow = false;
				}, 5000);
			}
		});
	})

	.controller('WeekfailCtrl', 
			function($window,$timeout,$location,$scope,$routeParams,$filter,$bbmodelservice,$burl,$base, $userservice, $modal, $log, $compile){
		$log.info('begin WeekfailCtrl ....');
		$scope.activeParentMenuValue = false;
		$scope.activeMenuValue = function(url){
			$scope.activeParentMenuValue = true;
			if(url == $location.path()){
				return true;
			}else{
				return false;
			}
		}

		$scope.signout = function(){
			$log.info('signout !!!' + $location.path() );
			// $location.path('/logout');
			$window.location.href = '/logout';
			$log.info('location.path moved...' + $location.path() );
		};

		$scope.menuOptions = {};
		$scope.menuOptions.data = [];
		var pp = $userservice.get_menus([],'');
		pp.then(function(data){
			$log.info('------- this is menus -------');			
			angular.forEach(data,function(d){
				$log.info(d['parent']);
				var mm = d['parent'].split('-');
				d.menuid = mm[0];
				d.menunm = mm[1];
				d.url = mm[2];
			});	
			$scope.menuOptions.data = data;
		});

		$scope.searchers = [];
		$scope.ignitecnt = 0;
		$scope.setSearcher = function(idx, value){
			if(idx > $scope.searchers.length){
				for(var i=$scope.searchers.length;i<idx;i++){
					$scope.searchers.push("");
				}
			}
			$scope.searchers[idx] = value;
		}
		$scope.overrideOptions = {
		// define table layout
			"dom": '<"top"ip<"clear">>rt<"bottom"p<"clear">>',
			"bAutoWidth": false,
			"pageLength": 20,
			"processing": true,
			"serverSide": true,
			"ajax": "/api/v1.0/weekfail/list",
      "ignitecnt" : $scope.ignitecnt,
      "columnDefs": [
            // { "visible": false, "targets": 0 }
        ],
        "order": [[ 0, 'asc' ]],
        // "displayLength": 25,
        "drawCallback": function ( settings ) {
          var api = this.api();

						// search box 
					$('#mainTable tfoot th').each( function () {
						var title = $('#mainTable thead th').eq( $(this).index() ).text();
						if(title !== 'history'){
							var sss = _.isUndefined($scope.searchers[$(this).index()])?"":$scope.searchers[$(this).index()];
							$(this).html( '<input type="text" style="max-width:50px;" placeholder="Search '+title+'" value="'+sss+'"/>' );							
						}
					});
					// Apply the search
			    api.columns().eq( 0 ).each( function ( colIdx ) {
		        $( 'input', api.column( colIdx ).footer() ).on( 'keyup change', function () {
		        	api.column( colIdx ).search( this.value ).draw();
		        	$scope.setSearcher(colIdx, this.value); 
		        });
			    });
	      }
		};
	})

	.controller('AgCtlCtrl', 
			function($window,$timeout,$location,$scope,$routeParams,$filter,$agctlservice,$burl,$base, $userservice, $modal, $log, $compile){
		$log.info('begin AgCtlCtrl ....');
		$scope.activeParentMenuValue = false;
		$scope.activeMenuValue = function(url){
			$scope.activeParentMenuValue = true;
			if(url == $location.path()){
				return true;
			}else{
				return false;
			}
		}

		$scope.signout = function(){
			$log.info('signout !!!' + $location.path() );
			// $location.path('/logout');
			$window.location.href = '/logout';
			$log.info('location.path moved...' + $location.path() );
		};

		$scope.menuOptions = {};
		$scope.menuOptions.data = [];
		var pp = $userservice.get_menus([],'');
		pp.then(function(data){
			$log.info('------- this is menus -------');
			
			angular.forEach(data,function(d){
				$log.info(d['parent']);
				var mm = d['parent'].split('-');
				d.menuid = mm[0];
				d.menunm = mm[1];
				d.url = mm[2];
			});	
			$scope.menuOptions.data = data;
		});

		$scope.bbonofflist = [
			{'name':'on', 'code':'0'},{'name':'off', 'code':'1'},{'name':'ab', 'code':'2'}
		];

		
		$scope.searchers = [];
		$scope.ignitecnt = 0;
		$('#mainTable tfoot th').each( function () {
			$scope.searchers.push('~217*%');
		});
		$log.info('--------------------->');
		$log.info($scope.searchers);
		$scope.setSearcher = function(idx, value){
			// if(idx > $scope.searchers.length){
			// 	for(var i=$scope.searchers.length;i<idx;i++){
			// 		$scope.searchers.push("");
			// 	}
			// }
			$scope.searchers[idx] = value;
		}

		$scope.overrideOptions = {
		// define table layout
			"dom": '<"toolbar"><"top"ip<"clear">>rt<"bottom"p<"clear">>',
			"bAutoWidth": false,
			"pageLength": 20,
			"processing": true,
			"serverSide": true,
			"ajax": "/api/v1.0/agctl/list",
      "ignitecnt" : $scope.ignitecnt,
      "columnDefs": [
            { "visible": false, "targets": 0 },
            // { "visible": false, "targets": 1 },
            // { "visible": false, "targets": 2 }            
        ],
        "order": [[ 0, 'asc' ]],
        "drawCallback": function ( settings ) {
        		var allbtn = [];
        		angular.forEach($scope.bbonofflist, function(d){
        			allbtn.push('<a style="padding-left:5px;" class="btn btn-default btn-mini" ng-click="updateAll(\''+d.code+'\')">'+d.name+'</a>')
        		});

        		$compile($("div.toolbar").html(allbtn.join('')))($scope);
            
            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last=null;
 						var data = api.rows( {page:'current'} ).data();
            api.column(0, {page:'current'} ).data().each( function ( group, i ) {
            		var d = data[i];
                if ( last !== group ) {
                    $(rows).eq(i).before(
                        '<tr class="group"><td colspan="4">'+d[0]+'</td><td colspan="3"></td></tr>'
                    );
                    last = group;
                }
            		var buttons = [];
            		angular.forEach($scope.bbonofflist, function(dt){
            			buttons.push('<a class="btn '+(d[7] == dt.code ? 'btn-inverse':'btn-default')+' btn-mini" ng-click="update(\''+d[1]+'\',\''+d[2]+'\',\''+d[3]+'\',\''+d[4]+'\', \''+d[5]+'\', \''+d[6]+'\', \''+dt.code+'\')">'+dt.name+'</a>');
            		});
                $(rows).eq(i).find("td").eq(6).html(buttons.join('&nbsp;&nbsp;&nbsp;'));
                $compile($(rows).eq(i))($scope);	
            });

            $('#mainTable tfoot th').each( function () {            	
							var title = $('#mainTable thead th').eq( $(this).index() ).text();
							var sss = _.isUndefined($scope.searchers[$(this).index()]) || $scope.searchers[$(this).index()]=='~217*%'?"":$scope.searchers[$(this).index()];
							$(this).html( '<input type="text" style="max-width:100px;" placeholder="Search '+title+'" value="'+sss+'"/>' );
						});
						// Apply the search
				    api.columns().eq( 0 ).each( function ( colIdx ) {
			        $( 'input', api.column( colIdx ).footer() ).on( 'keyup change', function () {
			        	var that = this;
			        	setTimeout(function(){
				        	api.column( colIdx ).search( that.value ).draw();
				        	$scope.setSearcher(colIdx-1, that.value); 
			        	}, 3000);
			        });
				    });

        }
		};

		$scope.dataTable ={};		
		$scope.items = [];
		$scope.confirmModalHtml = '<div class="modal-header"><h3 class="modal-title">Confirm</h3></div> <div class="modal-body">Do you want to continue this process ? </div><div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button><button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>';
		$scope.update = function(devmodel,mosver,pkgnm,apppkgnm,playServiceMode,verCode, bOnOff){
			var q = {
				'devmodel':devmodel, 'mosver':mosver, 'pkgnm':pkgnm, 'apppkgnm':apppkgnm, 'playServiceMode':playServiceMode, 'verCode':verCode, 'bOnOff':bOnOff
			};
			
			$log.info('update start....[' + devmodel + '-' + mosver + '-' + pkgnm + '-' + apppkgnm  + '->' + playServiceMode + ':' + verCode +  ':' + bOnOff + ']');
	    var modalInstance = $modal.open({
	      template: $scope.confirmModalHtml,
	      controller: 'ModalInstanceCtrl',
	      size: 'sm',
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }
	    });

	    modalInstance.result.then(function (selectedItem) {				
	      var promise = $agctlservice.change(q, '');
  	    promise.then(function(data){
  	    	$log.info(data);  	    	
  	    	$log.info('after bbmode update result is '+$scope.ignitecnt++);
  	    });
	  	}, function () {
		      $log.info('Modal dismissed at: ' + new Date());
		  });
		};

		$scope.updateAll = function(bOnOff){
			$log.info('$scope.updateAll begin '); 
			// $scope.items = [];
			var modalInstance = $modal.open({
	      template: $scope.confirmModalHtml,
	      controller: 'ModalInstanceCtrl',
	      size: 'sm',
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }
	    });

			modalInstance.result.then(function (selectedItem) {
				var q = {};
				$log.info('###############');
				$log.info($scope.searchers);
				q.filter = $scope.searchers;
				q.bOnOff = bOnOff;

	      var promise = $agctlservice.changeAll(q, '');
  	    promise.then(function(data){
  	    	$log.info('------- result of changeAll ------');
  	    	$log.info(data);
  	    	if(data == '203'){
  	    		$scope.alertshow = true;
  	    		$scope.alertmsg = 'Please select filtering condition at least more than 3 ';
  	    	}else{
	  	    	$log.info(data);
	  	    	$log.info('after bbmode update result is '+$scope.ignitecnt++);  	    		
  	    	}
  	    });
	  	}, function () {
		      $log.info('Modal dismissed at: ' + new Date());
		  });
		};

		$scope.$watch('alertshow', function(value){
			$log.info('alertshow watch is ' + value);
			if(value == true){
				$timeout(function(){
					$scope.alertshow = false;
				}, 5000);
			}
		});
	})


;