angular.module('deitel.controllers', [])

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
					}).setView([37.49800253054263,127.02608766689583], 10),
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
				radius: 10,
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
					$scope.focusmap.setView([cclat,cclng], 10); 
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
				var info = '<table class="table table-striped table-hover" style="color:#000"><thead><tr class="info" style="color:#000"><td>아파트명</td><td>거래량</td></tr></thead><tbody><tr><td>'+d.o['aptnm']+')'+'</td><td>'+Math.round(d.o['value'])+'</td></tr></tbody></table>';
				markers.addLayer(
					new L.Marker(new L.LatLng(d.o['lat'],d.o['lng']),{ icon: new SweetIcon({ labelText: d.o['aptnm'] }) }).bindPopup(info)
					);
			});
			$scope.detailmarkerlst.push(markers);
			$scope.focusmap.addLayer(markers);
		}
});
