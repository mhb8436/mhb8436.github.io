angular.module('deitel.controllers', ['nvd3'])

.controller('SampleCtrl', 
	function($window,$timeout,$location,$scope,$routeParams,$filter,$log,$sampleservice,$burl,$base){
		console.log('begin SampleCtrl ....');
		// var center = [37.530101531765394,127.00181143188475]; // 한강 중심 
		$scope.map = L.map('map', {
						crs: L.Proj.CRS.TMS.Daum,
						continuousWorld: true,
						worldCopyJump: false,
						zoomControl: true
					}).setView([37.53800253054263,127.01608766689583], 5),
		// console.log($scope.map);
		$scope.map.doubleClickZoom.disable();
		$scope.map.scrollWheelZoom.disable();

		L.Proj.TileLayer.TMS.provider('DaumMap.Satellite').addTo( $scope.map );
		L.Proj.TileLayer.TMS.provider('DaumMap.Hybrid').addTo( $scope.map );
		

		$scope.focusmap = L.map('focusmap', {
						crs: L.Proj.CRS.TMS.Daum,
						continuousWorld: true,
						worldCopyJump: false,
						zoomControl: true
					}).setView([37.49800253054263,127.02608766689583], 9),
		$scope.focusmap.doubleClickZoom.disable();
		$scope.focusmap.scrollWheelZoom.disable();

		L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo( $scope.focusmap );
		// L.Proj.TileLayer.TMS.provider('DaumMap.Hybrid').addTo( $scope.focusmap );

		
		var promise = $sampleservice.listMainMap();
		promise.then(function(data){
			// $scope.mapdata = JSON.parse(data[0].m1);
			$log.log('----$scope.listMainMap in sampleCtrl -----');
			$log.log(data);
			$timeout(function(){
				$scope.drawMainMap(data);
			}, 300);
		});

		$scope.drawMainMap = function(data){
			// var ext = d3.extent(data,function(d){ return d.value; });
			// console.log(ext);
			var options = {
				radius: 15,
				opacity: .5,
				duration: 200,
				lng: function(d){ return d.lng; },
				lat: function(d){ return d.lat; },
				value: function(d1){ 
					// console.log(d1); 
					var mm = d3.mean(d1.map(function(d){ return d.o['value']; }));
					// console.log(mm);
					return mm; 
				},
				valueFloor:undefined,
				valueCeil: undefined,
				onclick:function(d){ 
					var cclng = d3.mean(d, function(c){ return c.o['lng']; }),
							cclat = d3.mean(d, function(c){ return c.o['lat']; });
							console.log(cclng + ':' + cclat);
					$scope.focusmap.setView([cclat,cclng], 9); 
					console.log(d); $scope.drawDetailMap(d); 

				}
			}
			var hexLayer = L.hexbinLayer(options).addTo($scope.map);
			hexLayer.colorScale().range(['white', 'red']);
			// console.log(data);
			hexLayer.data(data);
		}
		$scope.detailmarkerlst=[];
		$scope.drawDetailMap = function(data){
			$scope.detailmarkerlst.forEach(function(d){
				$scope.focusmap.removeLayer(d);	
			});
			
			var markers = new L.FeatureGroup();
			var SweetIcon = L.Icon.Label.extend({
				options: {
					iconUrl: 'views/s.png',
					shadowUrl: null,
					iconSize: new L.Point(24, 24),
					iconAnchor: new L.Point(0, 1),
					labelAnchor: new L.Point(26, 0),
					wrapperAnchor: new L.Point(12, 13),
					labelClassName: 'sweet-deal-label'
				}
			});

			data.forEach(function(d){
				var info = '<table class="table table-striped table-hover" style="color:#000"><thead><tr class="info" style="color:#000"><td>아파트명</td><td>거래량</td></tr></thead><tbody><tr><td><a href="#" onclick="drawChart(\''+d.o['series']+'/'+d.o['si_series']+'/'+d.o['gu_series']+'\')">'+d.o['aptnm']+')'+'</a></td><td>'+Math.round(d.o['value'])+'</td></tr></tbody></table>';
				markers.addLayer(
					new L.Marker(new L.LatLng(d.o['lat'],d.o['lng']),{ icon: new SweetIcon({ labelText: d.o['aptnm'] }) }).bindPopup(info)
					);
			});
			$scope.detailmarkerlst.push(markers);
			$scope.focusmap.addLayer(markers);
		}
		// $scope.ddd = 1;

		$scope.options = {
      chart: {
        type: 'multiBarChart',
        height: 650,
        margin : {
          top: 20,
          right: 20,
          bottom: 60,
          left: 65
        },
        x: function(d){ return (new Date(d[0].substr(0,4), d[0].substr(4,2), d[0].substr(6,2))).getTime() ; },
        y: function(d){ return parseFloat(d[1]); },
        // average: function(d) { return d.mean; },
        color: d3.scale.category10().range(),
        transitionDuration: 300,
        stacked: false,
        duration: 500,
        xAxis: {
          axisLabel: '기간',
          tickFormat: function(d) {
            return d3.time.format('%Y%m%d')(new Date(d));
          },
          showMaxMin: true,
          staggerLabels: true
        },

        yAxis: {
          axisLabel: '거래량(건)',
          tickFormat: function(d){
              return d3.format('d')(d);
          },
          showMaxMin: true,
          axisLabelDistance: -20
        }
      }
    };

		$window.drawChart = function(data){
			// console.log(data);
			var datecomp = function(b,a){
				return new Date(b.split(':')[0].substr(0,4)+'/'+b.split(':')[0].substr(4,2)+'/01') - new Date(a.split(':')[0].substr(0,4)+'/'+a.split(':')[0].substr(4,2)+'/01');
			};

			var my = data.split('/')[0].split(','),
				  si = data.split('/')[1].split(','),
				  gu = data.split('/')[2].split(',');
			si.sort(datecomp), gu.sort(datecomp);		
			// console.log(si);
			var fullm = {}, minm = moment(new Date(parseInt(si[0].split(':')[0].substr(0,4)), parseInt(si[0].split(':')[0].substr(4,2))-1, 1));
			console.log(si.length);
			for(var k=0;k<si.length;k++){
				fullm[minm.format('YYYYMMDD')] = {si:0,gu:0,my:0};
				minm.add(1,'month');
			}

			for(var k=0;k<si.length;k++){
				// console.log(si[k].split(':')[0]+'01');
				fullm[si[k].split(':')[0]+'01']['si'] =  si[k].split(':')[1];
			}
			for(var k=0;k<gu.length;k++){
				fullm[gu[k].split(':')[0]+'01']['gu'] =  gu[k].split(':')[1];
			}
			for(var k=0;k<my.length;k++){
				fullm[my[k].split(':')[0]+'01']['my'] =  my[k].split(':')[1];
			}
			var data = [];
			var s1 =[], s2=[],s3=[];
			Object.keys(fullm).map(function(d){
				s1.push([d, fullm[d]['my']]);
				s2.push([d, fullm[d]['si']]);
				s3.push([d, fullm[d]['gu']]);
			})

			$scope.$apply(function(){
				// $scope.data = [];
				$scope.data = [{key:'아파트',values:s1},{key:'시평균',values:s2},{key:'구평균',values:s3}];
				console.log($scope.data);		

			});

			$timeout(function(){
					$scope.api.update();
					$scope.api.refresh();
					console.log('updated... but not..');
					$('html, body').animate({
			        scrollTop: $("#chartss").offset().top
			    }, 500);
				},500);		
		}



  
});
