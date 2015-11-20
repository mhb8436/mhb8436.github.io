angular.module('deitel.controllers', ['nvd3','ngSanitize', 'ui.select'])

.controller('SampleCtrl', 
	function($window,$timeout,$location,$scope,$routeParams,$filter,$log,$sampleservice,$burl,$base){
		console.log('begin SampleCtrl ....');
		// var center = [37.530101531765394,127.00181143188475]; // 한강 중심 
		// var CartoDB_DarkMatterNoLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
		// 	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
		// 	subdomains: 'abcd',
		// 	maxZoom: 19
		// });

		// $scope.map = L.map('map', {
		// 				// crs: L.Proj.CRS.TMS.Daum,
		// 				layers: [CartoDB_DarkMatterNoLabels],
		// 				continuousWorld: true,
		// 				worldCopyJump: false,
		// 				zoomControl: true
		// 			}).setView([37.53800253054263,127.01608766689583], 5),
		// // console.log($scope.map);
		// $scope.map.doubleClickZoom.disable();
		// $scope.map.scrollWheelZoom.disable();


		// // L.Proj.TileLayer.TMS.provider('DaumMap.Satellite').addTo( $scope.map );
		// // L.Proj.TileLayer.TMS.provider('DaumMap.Hybrid').addTo( $scope.map );
		

		// $scope.focusmap = L.map('focusmap', {
		// 				crs: L.Proj.CRS.TMS.Daum,
		// 				continuousWorld: true,
		// 				worldCopyJump: false,
		// 				zoomControl: true
		// 			}).setView([37.49800253054263,127.02608766689583], 9),
		// $scope.focusmap.doubleClickZoom.disable();
		// $scope.focusmap.scrollWheelZoom.disable();

		// L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo( $scope.focusmap );
		// // L.Proj.TileLayer.TMS.provider('DaumMap.Hybrid').addTo( $scope.focusmap );

		
		// var promise = $sampleservice.listMainMap();
		// promise.then(function(data){
		// 	// $scope.mapdata = JSON.parse(data[0].m1);
		// 	$log.log('----$scope.listMainMap in sampleCtrl -----');
		// 	$log.log(data);
		// 	$timeout(function(){
		// 		$scope.drawMainMap(data);
		// 	}, 300);
		// });

		// $scope.drawMainMap = function(data){
		// 	// var ext = d3.extent(data,function(d){ return d.value; });
		// 	// console.log(ext);
		// 	var options = {
		// 		radius: 5,
		// 		opacity: .8,
		// 		duration: 200,
		// 		lng: function(d){ return d.lng; },
		// 		lat: function(d){ return d.lat; },
		// 		value: function(d1){ 
		// 			// console.log(d1); 
		// 			var mm = d3.mean(d1.map(function(d){ return d.o['value']; }));
		// 			// console.log(mm);
		// 			return mm; 
		// 		},
		// 		valueFloor:undefined,
		// 		valueCeil: undefined,
		// 		onclick:function(d){ 
		// 			var cclng = d3.mean(d, function(c){ return c.o['lng']; }),
		// 					cclat = d3.mean(d, function(c){ return c.o['lat']; });
		// 					console.log(cclng + ':' + cclat);
		// 			$scope.focusmap.setView([cclat,cclng], 9); 
		// 			console.log(d); $scope.drawDetailMap(d); 

		// 		}
		// 	}
		// 	var hexLayer = L.hexbinLayer(options).addTo($scope.map);
		// 	hexLayer.colorScale().range(['white', 'red']);
		// 	// console.log(data);
		// 	hexLayer.data(data);
		// }
		// $scope.detailmarkerlst=[];
		// $scope.drawDetailMap = function(data){
		// 	$scope.detailmarkerlst.forEach(function(d){
		// 		$scope.focusmap.removeLayer(d);	
		// 	});
			
		// 	var markers = new L.FeatureGroup();
		// 	var SweetIcon = L.Icon.Label.extend({
		// 		options: {
		// 			iconUrl: 'views/s.png',
		// 			shadowUrl: null,
		// 			iconSize: new L.Point(24, 24),
		// 			iconAnchor: new L.Point(0, 1),
		// 			labelAnchor: new L.Point(26, 0),
		// 			wrapperAnchor: new L.Point(12, 13),
		// 			labelClassName: 'sweet-deal-label'
		// 		}
		// 	});

		// 	data.forEach(function(d){
		// 		var info = '<table class="table table-striped table-hover" style="color:#000"><thead><tr class="info" style="color:#000"><td>아파트명</td><td>거래량</td></tr></thead><tbody><tr><td><a href="#" onclick="drawChart(\''+d.o['series']+'/'+d.o['si_series']+'/'+d.o['gu_series']+'\')">'+d.o['aptnm']+')'+'</a></td><td>'+Math.round(d.o['value'])+'</td></tr></tbody></table>';
		// 		markers.addLayer(
		// 			new L.Marker(new L.LatLng(d.o['lat'],d.o['lng']),{ icon: new SweetIcon({ labelText: d.o['aptnm'] }) }).bindPopup(info)
		// 			);
		// 	});
		// 	$scope.detailmarkerlst.push(markers);
		// 	$scope.focusmap.addLayer(markers);
		// }
		// // $scope.ddd = 1;

		// $scope.options = {
  //     chart: {
  //       type: 'multiBarChart',
  //       height: 650,
  //       margin : {
  //         top: 20,
  //         right: 20,
  //         bottom: 60,
  //         left: 65
  //       },
  //       x: function(d){ return (new Date(d[0].substr(0,4), d[0].substr(4,2), d[0].substr(6,2))).getTime() ; },
  //       y: function(d){ return parseFloat(d[1]); },
  //       // average: function(d) { return d.mean; },
  //       color: d3.scale.category10().range(),
  //       transitionDuration: 300,
  //       stacked: false,
  //       duration: 500,
  //       xAxis: {
  //         axisLabel: '기간',
  //         tickFormat: function(d) {
  //           return d3.time.format('%Y%m%d')(new Date(d));
  //         },
  //         showMaxMin: true,
  //         staggerLabels: true
  //       },

  //       yAxis: {
  //         axisLabel: '거래량(건)',
  //         tickFormat: function(d){
  //             return d3.format('d')(d);
  //         },
  //         showMaxMin: true,
  //         axisLabelDistance: -20
  //       }
  //     }
  //   };

		// $window.drawChart = function(data){
		// 	// console.log(data);
		// 	var datecomp = function(b,a){
		// 		return new Date(b.split(':')[0].substr(0,4)+'/'+b.split(':')[0].substr(4,2)+'/01') - new Date(a.split(':')[0].substr(0,4)+'/'+a.split(':')[0].substr(4,2)+'/01');
		// 	};

		// 	var my = data.split('/')[0].split(','),
		// 		  si = data.split('/')[1].split(','),
		// 		  gu = data.split('/')[2].split(',');
		// 	si.sort(datecomp), gu.sort(datecomp);		
		// 	// console.log(si);
		// 	var fullm = {}, minm = moment(new Date(parseInt(si[0].split(':')[0].substr(0,4)), parseInt(si[0].split(':')[0].substr(4,2))-1, 1));
		// 	console.log(si.length);
		// 	for(var k=0;k<si.length;k++){
		// 		fullm[minm.format('YYYYMMDD')] = {si:0,gu:0,my:0};
		// 		minm.add(1,'month');
		// 	}

		// 	for(var k=0;k<si.length;k++){
		// 		// console.log(si[k].split(':')[0]+'01');
		// 		fullm[si[k].split(':')[0]+'01']['si'] =  si[k].split(':')[1];
		// 	}
		// 	for(var k=0;k<gu.length;k++){
		// 		fullm[gu[k].split(':')[0]+'01']['gu'] =  gu[k].split(':')[1];
		// 	}
		// 	for(var k=0;k<my.length;k++){
		// 		fullm[my[k].split(':')[0]+'01']['my'] =  my[k].split(':')[1];
		// 	}
		// 	var data = [];
		// 	var s1 =[], s2=[],s3=[];
		// 	Object.keys(fullm).map(function(d){
		// 		s1.push([d, fullm[d]['my']]);
		// 		s2.push([d, fullm[d]['si']]);
		// 		s3.push([d, fullm[d]['gu']]);
		// 	})

		// 	$scope.$apply(function(){
		// 		// $scope.data = [];
		// 		$scope.data = [{key:'아파트',values:s1},{key:'시평균',values:s2},{key:'구평균',values:s3}];
		// 		console.log($scope.data);		

		// 	});

		// 	$timeout(function(){
		// 			$scope.api.update();
		// 			$scope.api.refresh();
		// 			console.log('updated... but not..');
		// 			$('html, body').animate({
		// 	        scrollTop: $("#chartss").offset().top
		// 	    }, 500);
		// 		},500);		
		// }



  
})

.controller('OneCtrl', 
	function($window,$timeout,$location,$scope,$routeParams,$filter,$log,$sampleservice,$burl,$base){
		console.log('begin OneCtrl ....');

		$scope.ftype = {};
	  $scope.ftype.itemArray = [
      {id: 1, name: '아파트'},
      {id: 2, name: '연립/다세대'},
    ];
  	$scope.ftype.selectedItem = $scope.ftype.itemArray[0];

		$scope.fmetric = {};
	  $scope.fmetric.itemArray = [
      {id: 1, name: '거래량'},
      {id: 2, name: '평당가격'},
    ];
  	$scope.fmetric.selectedItem = $scope.fmetric.itemArray[0];

		$scope.farea = {};
	  $scope.farea.itemArray = [
      {id: 1, name: '서울'},
      {id: 2, name: '경기'},
    ];
  	$scope.farea.selectedItem = $scope.farea.itemArray[0];

		// var center = [37.530101531765394,127.00181143188475]; // 한강 중심 

		$scope.map = L.map('map', {
						crs: L.Proj.CRS.TMS.Daum,
						continuousWorld: true,
						worldCopyJump: false,
						zoomControl: true
					}).setView([37.53800253054263,127.01608766689583], 6),
		// console.log($scope.map);
		$scope.map.doubleClickZoom.disable();
		$scope.map.scrollWheelZoom.disable();


		L.Proj.TileLayer.TMS.provider('DaumMap.Satellite').addTo( $scope.map );
		L.Proj.TileLayer.TMS.provider('DaumMap.Hybrid').addTo( $scope.map );
		// L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo( $scope.map );

		$scope.focusmap = L.map('focusmap', {
						crs: L.Proj.CRS.TMS.Daum,
						continuousWorld: true,
						worldCopyJump: false,
						zoomControl: true
					}).setView([37.49800253054263,127.02608766689583], 6),
		$scope.focusmap.doubleClickZoom.disable();
		$scope.focusmap.scrollWheelZoom.disable();

		L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo( $scope.focusmap );
		// L.Proj.TileLayer.TMS.provider('DaumMap.Hybrid').addTo( $scope.focusmap );

		$scope.drawStart = function(){
			console.log('------> drawStart ');
			var promise = $sampleservice.listMainMap();
			promise.then(function(data){
				// $scope.mapdata = JSON.parse(data[0].m1);
				$log.log('----$scope.listMainMap in sampleCtrl -----');
				$log.log(data);
				$timeout(function(){
					$scope.drawMainMap(data);
				}, 300);
			});
		};
		

		$scope.drawMainMap = function(data){
			// var ext = d3.extent(data,function(d){ return d.value; });
			// console.log(ext);
			var options = {
				radius: 15,
				opacity: .9,
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
					$timeout(function(){
						$('html, body').animate({
				        scrollTop: $("#portfolio2").offset().top
				    }, 500);
					},500);		

				}
			}
			var hexLayer = L.hexbinLayer(options).addTo($scope.map);
			hexLayer.colorScale().range(['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026']);
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
			        scrollTop: $("#portfolio3").offset().top
			    }, 500);
				},500);		
		}


	var mapGeostruc = {
		"type":"FeatureCollection", "features":[], 
		"properties":{
			"fields":{
				"category":{"name":"badcategory","lookup":{"1":"Poor","2":"Fair","3":"Good","4":"Very Good","5":"Excellent"}}
			}, "attribution":"PIZZASTUDIO 2015 Inc."
		}
	}  ,
  metadata = mapGeostruc.properties,
  categoryField = 'badcategory', //This is the fieldname for marker category (used in the pie and legend)
  iconField = 'badcategory', //This is the fieldame for marker icon
  rmax = 20; //Maximum radius for cluster pies
  
	$scope.defineFeature=function(feature, latlng) {
		// console.log('defineFeature---->');
	  var categoryVal = feature.properties[categoryField],
	    iconVal = feature.properties[categoryField];
	    var myClass = 'marker category-'+categoryVal+' icon-'+iconVal;
	    var myIcon = L.divIcon({
	        className: myClass,
	        iconSize:null
	    });
	    return L.marker(latlng, {icon: myIcon});
	}

	$scope.defineFeaturePopup = function(feature, layer) {
		// console.log('defineFeaturePopup---->');
	  var props = feature.properties;
	  var subwaytxt = props['subway'] && props['subway']!='not' ? ' [' + props['subway'] +']' : '';
		var infocontent = '<table class="table table-striped table-hover text-center"><thead style="color:#fff;"><tr><td>학교명</td><td>주소</td></tr></thead><tbody><tr><td class="success" style="cursor:pointer;text-decoration: underline;">'+props['name']+'</td><td class="danger">'+props['addr']+'</td></tr></tbody></table>';
	  layer.bindPopup(infocontent,{offset: L.point(1,-2), maxWidth: 700});
	}

	$scope.defineClusterIcon = function(cluster) {
		// console.log('defineClusterIcon---->');
    var children = cluster.getAllChildMarkers(),
        n = children.length, //Get number of markers in cluster
        strokeWidth = 1, //Set clusterpie stroke width
        r = rmax-2*strokeWidth-(n<10?12:n<100?8:n<1000?4:0), //Calculate clusterpie radius...
        iconDim = (r+strokeWidth)*2, //...and divIcon dimensions (leaflet really want to know the size)
        data = d3.nest() //Build a dataset for the pie chart
          .key(function(d) { return d.feature.properties[categoryField]; })
          .entries(children, d3.map),
        //bake some svg markup
        html = bakeThePie({ 
        	data: data,
          valueFunc: function(d){ return d.values.length;  }, 
          legendFunc: function(d){ 
          	var ccc = 0, ooo=0;;
          	d.forEach(function(o){
        			ccc += o.values.filter(function(a){return a.feature.properties.tci >= 0.3; }).length;
        			ooo += o.values.length;
          	});
          	return ccc/ooo*100;
          }, 
          strokeWidth: 1,
          outerRadius: r,
          innerRadius: r-10,
          pieClass: 'cluster-pie',
          pieLabel: n,
          pieLabelClass: 'marker-cluster-pie-label',
          pathClassFunc: function(d){return "category-"+d.data.key;},
          pathTitleFunc: function(d){return console.log(''); metadata.fields[categoryField].lookup[d.data.key];}
        }),
        //Create a new divIcon and assign the svg markup to the html property
        myIcon = new L.DivIcon({
            html: html,
            className: 'marker-cluster', 
            iconSize: new L.Point(iconDim, iconDim)
        });
    return myIcon;
	}

	/*function that generates a svg markup for the pie chart*/
	$scope.bakeThePie = function(options) {
		console.log('bakeThePie---->');
	    /*data and valueFunc are required*/
	    if (!options.data || !options.valueFunc) {
	        return '';
	    }
	    var data = options.data,
	        valueFunc = options.valueFunc,
	        legendFunc = options.legendFunc,
	        r = options.outerRadius?options.outerRadius:28, //Default outer radius = 28px
	        rInner = options.innerRadius?options.innerRadius:r-10, //Default inner radius = r-10
	        strokeWidth = options.strokeWidth?options.strokeWidth:1, //Default stroke is 1
	        pathClassFunc = options.pathClassFunc?options.pathClassFunc:function(){return '';}, //Class for each path
	        pathTitleFunc = options.pathTitleFunc?options.pathTitleFunc:function(){return '';}, //Title for each path
	        pieClass = options.pieClass?options.pieClass:'marker-cluster-pie', //Class for the whole pie
	        pieLabel = options.pieLabel?options.pieLabel:d3.sum(data,valueFunc), //Label for the whole pie
	        // pieLabel = legendFunc?legendFunc:options.pieLabel, 
	        pieLabelClass = options.pieLabelClass?options.pieLabelClass:'marker-cluster-pie-label',//Class for the pie label	        
	        origo = (r+strokeWidth), //Center coordinate
	        w = origo*2, //width and height of the svg element
	        h = w,
	        donut = d3.layout.pie(),
	        arc = d3.svg.arc().innerRadius(rInner).outerRadius(r);
	        
	    //Create an svg element
	    var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
	    //Create the pie chart
	    var vis = d3.select(svg)
	        .data([data])
	        .attr('class', pieClass)
	        .attr('width', w)
	        .attr('height', h);
	        
	    var arcs = vis.selectAll('g.arc')
	        .data(donut.value(valueFunc))
	        .enter().append('svg:g')
	        .attr('class', 'arc')
	        .attr('transform', 'translate(' + origo + ',' + origo + ')');
	    
	    arcs.append('svg:path')
	        .attr('class', pathClassFunc)
	        .attr('stroke-width', strokeWidth)
	        .attr('d', arc)
	        .append('svg:title')
	          .text(pathTitleFunc);

			if(legendFunc(data)	> 1 ){
				vis.append('circle')
						.attr('r', rInner)
						.attr('cx', origo)
						.attr('cy', origo)
						.attr('fill', '#4d4d4d');							
		    vis.append('text')
		        .attr('x',origo)
		        .attr('y',origo)
		        .attr('class', pieLabelClass)
		        .attr('text-anchor', 'middle')
		        .attr('dy','.3em')
		        .attr('fill', 'white')
		        .text(pieLabel);						
			}else{
		    vis.append('text')
		        .attr('x',origo)
		        .attr('y',origo)
		        .attr('class', pieLabelClass)
		        .attr('text-anchor', 'middle')
		        .attr('dy','.3em')
		        .text(pieLabel);					
			}

	    return $scope.serializeXmlNode(svg);
	}

	/*Helper function*/
	$scope.serializeXmlNode=function(xmlNode) {
		console.log(xmlNode);
	    if (typeof window.XMLSerializer != "undefined") {
	        return (new window.XMLSerializer()).serializeToString(xmlNode);
	    } else if (typeof xmlNode.xml != "undefined") {
	        return xmlNode.xml;
	    }
	    return "";
	}

	$scope.getSchoolData = function(){
		console.log('------> drawSchoolMap ');
		var promise = $sampleservice.listSchoolMap();
		promise.then(function(data){
			// $scope.mapdata = JSON.parse(data[0].m1);
			$log.log('----$scope.listSchoolMap in OneCtrl -----');
			// $log.log(data);
			$timeout(function(){
				$scope.drawSchoolMap(data);
			}, 300);
		});
	};


  $scope.markersref = {'c':{}};	
  $scope.drawSchoolMap = function(data){
  	console.log('--  begin $scope.drawSchoolMap ----> ');
  	// console.log(data);
  	if(!_.isUndefined($scope.markersref['c'].cluster) && !_.isUndefined($scope.markersref['c'].markers))
	  	$scope.markersref['c'].cluster.removeLayer($scope.markersref['c'].markers);

  	var max = d3.extent(data, function(d){ return d.rn;});
  	var cellgeojson = _.clone(mapGeostruc),
  			rnscale = d3.scale.threshold().domain([0,max]).range('1','2','3','4');
  	cellgeojson.features = data.map(function(d){ return {"geometry":{"type":"Point","coordinates":[d.lat,d.lng]}, "type":"Feature", "properties":{"badcategory":rnscale(d.rn),"name":d.name,"addr":d.addr}}});
  	// console.log(JSON.stringify(cellgeojson));
  	$scope.markers = L.geoJson(cellgeojson, {
				pointToLayer: $scope.defineFeature,
				onEachFeature: $scope.defineFeaturePopup
    });
		$scope.markerclusters = L.markerClusterGroup({
		  	maxClusterRadius: 2*rmax,
		    iconCreateFunction: $scope.defineClusterIcon
		});
		console.log($scope.defineClusterIcon);
		// console.log(markerclusters.iconCreateFunction);
		$scope.markerclusters.addTo($scope.focusmap);
    $scope.markerclusters.addLayer($scope.markers);
    $scope.markersref['c'].cluster = $scope.markerclusters;
    $scope.markersref['c'].markers = $scope.markers;
    $scope.focusmap.attributionControl.addAttribution(metadata.attribution);

  }
  $scope.getSchoolData();

}) // end of OneController 



;
