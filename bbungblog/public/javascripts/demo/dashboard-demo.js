$(function() {
	var date = new Date();
	var today = date.getFullYear() + '' 
				+ ( ( date.getMonth() + 1 ) < 10 ? '0' + ( date.getMonth() + 1 ) : ( date.getMonth() + 1 ) ) + '' 
				+ ( date.getDate() < 10 ? '0' + date.getDate() : date.getDate() );
	date.setDate(date.getDate()-7);
	var prevWeek = date.getFullYear() + '' 
				+ ( ( date.getMonth() + 1 ) < 10 ? '0' + ( date.getMonth() + 1 ) : ( date.getMonth() + 1 ) ) + '' 
				+ ( date.getDate() < 10 ? '0' + date.getDate() : date.getDate() );
	$.ajax({  
		type: 'GET',  
		url: '/ispNes/' + prevWeek + '/' + today,  
		success: function(d){
			var yKeys = [];
			var forwardD = new Array();
			var bdate = {};
			var dateIdx =0;
			var keyIdx = 0;
			var fDIdx = 0;
			
			for(var i = 0; i < d.length; ++i){
				var tIdx, ktIdx = -1;
				if(bdate[d[i]['bdate']] == undefined)
					bdate[d[i]['bdate']] = dateIdx++;
				tIdx = bdate[d[i]['bdate']];
				
				for( var j = 0; j < keyIdx; ++j){
					if(yKeys[j] == d[i]['ispgrp']){
						ktIdx = j;
						break;
					}
				}
				if(ktIdx == -1){
					yKeys[keyIdx++] = d[i]['ispgrp'];
				}
				if(!forwardD[tIdx]){
					forwardD[tIdx] = new Object();
				}
				forwardD[tIdx].dt = d[i]['bdate'];
				forwardD[tIdx][d[i]['ispgrp']] = Math.round(d[i]['avgtp']*100)/100;
				//forwardD[tIdx][d[i]['ispgrp']] = d[i]['reqs'];
			}
			for(var idx=0; idx < dateIdx; ++idx){
				var year = forwardD[idx]['dt'].substring(0,4);
				var month = forwardD[idx]['dt'].substring(4,6);
				var day = forwardD[idx]['dt'].substring(6,8);
				forwardD[idx]['dt'] = year + ' Q'+(idx+1)//' /' + month + '/' + day;
			}
			Morris.Area({
				element: 'morris-area-chart',
				data: forwardD,
				xkey: 'dt',
				ykeys: yKeys,
				labels: yKeys,
				pointSize: 3,
				hideHover: 'auto',
				resize: true
			});
			
			//여기에 넘어온 데이터를 정렬.
			
			var tmp =[{
            period: '2010 Q1',
            iphone: 2666,
            ipad: null,
            itouch: 2647
        }, {
            period: '2010 Q2',
            iphone: 2778,
            ipad: 2294,
            itouch: 2441
        }, {
            period: '2010 Q3',
            iphone: 4912,
            ipad: 1969,
            itouch: 2501
        }, {
            period: '2010 Q4',
            iphone: 3767,
            ipad: 3597,
            itouch: 5689
        }, {
            period: '2011 Q1',
            iphone: 6810,
            ipad: 1914,
            itouch: 2293
        }, {
            period: '2011 Q2',
            iphone: 5670,
            ipad: 4293,
            itouch: 1881
        }, {
            period: '2011 Q3',
            iphone: 4820,
            ipad: 3795,
            itouch: 1588
        }, {
            period: '2011 Q4',
            iphone: 15073,
            ipad: 5967,
            itouch: 5175
        }, {
            period: '2012 Q1',
            iphone: 10687,
            ipad: 4460,
            itouch: 2028
        }, {
            period: '2012 Q2',
            iphone: 8432,
            ipad: 5713,
            itouch: 1791
        }];
			
			
			// Morris.Area({
				// element: 'morris-area-chart',
				// data: tmp,
				// xkey: 'period',
				// ykeys: ['iphone', 'ipad', 'itouch'],
				// labels: ['iPhone', 'iPad', 'itouch'],
				// pointSize: 2,
				// hideHover: 'auto',
				// resize: true
			// });
		},  
		dataType: 'json'  
	});  

    Morris.Donut({
        element: 'morris-donut-chart',
        data: [{
            label: "Download Sales",
            value: 12
        }, {
            label: "In-Store Sales",
            value: 30
        }, {
            label: "Mail-Order Sales",
            value: 20
        }],
        resize: true
    });

    Morris.Bar({
        element: 'morris-bar-chart',
        data: [{
            y: '2006',
            a: 100,
            b: 90
        }, {
            y: '2007',
            a: 75,
            b: 65
        }, {
            y: '2008',
            a: 50,
            b: 40
        }, {
            y: '2009',
            a: 75,
            b: 65
        }, {
            y: '2010',
            a: 50,
            b: 40
        }, {
            y: '2011',
            a: 75,
            b: 65
        }, {
            y: '2012',
            a: 100,
            b: 90
        }],
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['Series A', 'Series B'],
        hideHover: 'auto',
        resize: true
    });

});
