angular.module('ctrladm.directives', [])
	.directive('ngConfirmClick', ['$window',
		function($window){
			return {
				link: function (scope, element, attr) {
					var msg = " Are you sure?";
					var clickAction = attr.ngConfirmClick;
					element.bind('click',function (event) {
						if ( window.confirm(msg) ) {
							scope.$eval(clickAction)
						}
					});
				}
			};
	}])

  .directive('ngGridTable', ['$compile','$window', function($compile,$window){
      return function(scope, element, attrs){
          var tableOptions = {};
          if(attrs.ngGridTable.length < 1){
              return;
          }
          tableOptions = scope.$eval(attrs.ngGridTable);
          var options = tableOptions;
          var isInitGrid = false;
          var grid;
          var render = function(){
              console.log(options);
              if(!grid && !isInitGrid){
              		// console.log(options);
                  isInitGrid = true;
                  grid = $(element).dataTable(options);
                  console.log(' when start render .... begin ')
                  console.log(grid);
              }else{
              	// console.log(grid.ajax);
                grid.api().ajax.reload(null, false);
              }              
          }
          scope.$watch(function(){
          	// console.log('ngGridTable watch is '+options.ignitecnt + ':' + scope.ignitecnt);
						return scope.ignitecnt;
          }, function(value){
              console.log('------ ngGridTable watch options.data......>>' + value + '<<<');
              if(angular.isDefined(value))
                  render();
          });
      };

  }])

	.directive('gridTable', ['$compile', function($compile){
		return function(scope, element, attrs){
			var options = {};
			var dt;
			if(attrs.gridTable.length>0){
				// console.log('attrs.gridTable.length>0');
				// console.log(attrs.gridTable)
				options = scope.$eval(attrs.gridTable);
				// console.log(options);
			} else {
				options = {
					"bStateSave": true,
					"iCookieDuration": 2419200, /* 1 month */
					"bJQueryUI": true,
					"bPaginate": false,
					"bLengthChange": false,
					"bFilter": false,
					"bInfo": false,
					"bDestroy": true
				};// end of options
			} // end of else

			var explicitColumns = [];
			
			console.log('------ disturve... ----');
			console.log(attrs);
			console.log(options);

			if (attrs.aoColumns) {
				options["aoColumns"] = scope.$eval(attrs.aoColumns);
			}
			if(attrs.aoColumnDefs){
				options["aoColumnDefs"] = scope.$eval(attrs.aoColumnDefs);
			}
			if(attrs.fnRowCallback){
				options["fnRowCallback"] = scope.$eval(attrs.fnRowCallback);
			}
			if(attrs.fnHeaderCallback){
				options["fnHeaderCallback"] = scope.$eval(attrs.fnHeaderCallback);
			}
			// if(attrs.aaSorting){
			// 	options["aaSorting"] = scope.$eval(attrs.aaSorting);
			// }
			options["fnCreatedRow"] = function( nRow, aData, iDataIndex ) {
				$compile(nRow)(scope);
			}
			scope.$watch(attrs.aaData + '| json', function(value){				
				var value = value || null;
				if(value){
					dt.fnClearTable();
					dt.fnAddData(scope.$eval(attrs.aaData));
				}
			});
			// console.log($(element));
			// console.log($('mainTable'));
			// console.log($(element).dataTable(options));
			// dt = element.dataTable(options);
			dt = $(element).dataTable(options);
			
		};

	}])


.directive('adminMenu', function($compile, $window){
	return function(scope, element, attrs){
		var options = {};

		if (attrs.adminMenu.length > 0){
			options = scope.$eval(attrs.adminMenu);
			render(options);
			scope.$watch(function(){
				return JSON.stringify(options.data);
			}, function(value){
				var value = value || null;
				if(value){
					render(options);
				}
			});

		} // end of if 

		function render(options){
			console.log('------- adminMenu render ---------');
			element.empty();
			var data = options.data || [];			
			var listr = [];
			for(var k=0;k<data.length;k++){
				var d = data[k];
				console.log(d);
				var parent = d.parent.split('-');
				if(d.childs){					
					var clist = d.childs.split(',');
					var listc = [];
					for(j=0;j<clist.length;j++){
						var item = clist[j].split('-');
						listc.push('<li ng-class="{active:activeMenuValue(\''+item[2]+'\')}"><a href="'+item[2]+'"><i class="fa fa-angle-double-right"></i> '+item[1]+'</a></li>')
					}
					// listr.push('<li ng-class="{treeview:true, active:activeParentMenuValue==true}"><a href="#"> <span>'+parent[1]+'</span><i class="fa fa-angle-left pull-right"></i></a><ul class="treeview-menu">'+listc.join('')+'</ul>')
					listr.push('<li class="treeview" ng-class="{active:activeParentMenuValue==true}"><a href="#"> <span>'+parent[1]+'</span><i class="fa fa-angle-left pull-right"></i></a><ul class="treeview-menu">'+listc.join('')+'</ul>')
      	}else{
      		listr.push('<li ng-class="{active:activeMenuValue(\''+parent[2]+'\')}"><a href="'+parent[2]+'"> <span>'+parent[1]+'</span></a></li>');	
      	}
				
			}
			var d_elem = angular.element($(listr.join('')));
			element.append(d_elem);
			$compile(d_elem)(scope);
			$(".sidebar .treeview").tree();
		}
	}// end of return 	
})

.directive('sparkLine', ['$compile', function($compile){
  return function(scope, element, attrs){
    var options = [];
    var data = [];
    // console.log('jqPlot started...........');
    // console.log(attrs.sparkLine);
    // console.log(attrs.sparkLine.length);
    if(attrs.sparkLine.length>0){
        options = scope.$eval(attrs.sparkLine);
        data = scope.$eval(attrs.aoData);
//                console.log(options);
        var chart = $(element).sparkline(data, options);
        // console.log('sparkLine chart ...........');
        // console.log(data);
        // console.log(options);
        scope.$watch(attrs.aoData + ' | json', function(value){
            // console.log('sparkLine chart data changed....... in $scope.$watch aoData ' + value);
            var val = value || null;
            if(val){
                chart = $(element).sparkline(scope.$eval(attrs.aoData), options);
            }
        });
    }

  };
}])



