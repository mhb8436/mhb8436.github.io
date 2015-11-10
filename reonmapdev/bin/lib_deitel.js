(function() {

d3.hexbin = function() {
  var width = 1,
      height = 1,
      r,
      x = d3_hexbinX,
      y = d3_hexbinY,
      dx,
      dy;

  function hexbin(points) {
    var binsById = {};

    points.forEach(function(point, i) {
      var py = y.call(hexbin, point, i) / dy, pj = Math.round(py),
          px = x.call(hexbin, point, i) / dx - (pj & 1 ? .5 : 0), pi = Math.round(px),
          py1 = py - pj;

      if (Math.abs(py1) * 3 > 1) {
        var px1 = px - pi,
            pi2 = pi + (px < pi ? -1 : 1) / 2,
            pj2 = pj + (py < pj ? -1 : 1),
            px2 = px - pi2,
            py2 = py - pj2;
        if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) pi = pi2 + (pj & 1 ? 1 : -1) / 2, pj = pj2;
      }

      var id = pi + "-" + pj, bin = binsById[id];
      if (bin) bin.push(point); else {
        bin = binsById[id] = [point];
        bin.i = pi;
        bin.j = pj;
        bin.x = (pi + (pj & 1 ? 1 / 2 : 0)) * dx;
        bin.y = pj * dy;
      }
    });

    return d3.values(binsById);
  }

  function hexagon(radius) {
    var x0 = 0, y0 = 0;
    return d3_hexbinAngles.map(function(angle) {
      var x1 = Math.sin(angle) * radius,
          y1 = -Math.cos(angle) * radius,
          dx = x1 - x0,
          dy = y1 - y0;
      x0 = x1, y0 = y1;
      return [dx, dy];
    });
  }

  hexbin.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return hexbin;
  };

  hexbin.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return hexbin;
  };

  hexbin.hexagon = function(radius) {
    if (arguments.length < 1) radius = r;
    return "m" + hexagon(radius).join("l") + "z";
  };

  hexbin.centers = function() {
    var centers = [];
    for (var y = 0, odd = false, j = 0; y < height + r; y += dy, odd = !odd, ++j) {
      for (var x = odd ? dx / 2 : 0, i = 0; x < width + dx / 2; x += dx, ++i) {
        var center = [x, y];
        center.i = i;
        center.j = j;
        centers.push(center);
      }
    }
    return centers;
  };

  hexbin.mesh = function() {
    var fragment = hexagon(r).slice(0, 4).join("l");
    return hexbin.centers().map(function(p) { return "M" + p + "m" + fragment; }).join("");
  };

  hexbin.size = function(_) {
    if (!arguments.length) return [width, height];
    width = +_[0], height = +_[1];
    return hexbin;
  };

  hexbin.radius = function(_) {
    if (!arguments.length) return r;
    r = +_;
    dx = r * 2 * Math.sin(Math.PI / 3);
    dy = r * 1.5;
    return hexbin;
  };

  return hexbin.radius(1);
};

var d3_hexbinAngles = d3.range(0, 2 * Math.PI, Math.PI / 3),
    d3_hexbinX = function(d) { return d[0]; },
    d3_hexbinY = function(d) { return d[1]; };

})();;/*! leaflet-d3.js Version: 0.3.8 */
(function(){
	"use strict";

	// L is defined by the Leaflet library, see git://github.com/Leaflet/Leaflet.git for documentation
	L.HexbinLayer = L.Class.extend({
		includes: [L.Mixin.Events],

		options : {
			radius : 10,
			opacity: 0.5,
			duration: 200,
			lng: function(d){
				return d[0];
			},
			lat: function(d){
				return d[1];
			},
			value: function(d){
				return d.length;
			},
			valueFloor: undefined,
			valueCeil: undefined,
			colorRange: ['#f7fbff', '#08306b'],

			onmouseover: undefined,
			onmouseout: undefined,
			click: undefined
		},

		initialize : function(options) {
			L.setOptions(this, options);

			this._hexLayout = d3.hexbin()
				.radius(this.options.radius)
				.x(function(d){ return d.point[0]; })
				.y(function(d){ return d.point[1]; });

			this._data = [];
			this._colorScale = d3.scale.linear()
				.range(this.options.colorRange)
				.clamp(true);

		},

		onAdd : function(map) {
			this._map = map;

			// Create a container for svg.
			this._container = this._initContainer();

			// Set up events
			map.on({'moveend': this._redraw}, this);

			// Initial draw
			this._redraw();
		},

		onRemove : function(map) {
			this._destroyContainer();

			// Remove events
			map.off({'moveend': this._redraw}, this);

			this._container = null;
			this._map = null;

			// Explicitly will leave the data array alone in case the layer will be shown again
			//this._data = [];
		},

		addTo : function(map) {
			map.addLayer(this);
			return this;
		},

		_initContainer : function() {
			var container = null;

			// If the container is null or the overlay pane is empty, create the svg element for drawing
			if (null == this._container) {
				var overlayPane = this._map.getPanes().overlayPane;
				container = d3.select(overlayPane).append('svg')
					.attr('class', 'leaflet-layer leaflet-zoom-hide');
			}

			return container;
		},

		_destroyContainer: function(){
			// Remove the svg element
			if(null != this._container){
				this._container.remove();
			}
		},

		// (Re)draws the hexbin group
		_redraw : function(){
			var that = this;

			if (!that._map) {
				return;
			}

			// Generate the mapped version of the data
			var data = that._data.map(function(d) {
				var lng = that.options.lng(d);
				var lat = that.options.lat(d);

				var point = that._project([lng, lat]);
				return { o: d, point: point };
			});

			var zoom = this._map.getZoom();

			// Determine the bounds from the data and scale the overlay
			var padding = this.options.radius * 2;
			var bounds = this._getBounds(data);
			var width = (bounds.max[0] - bounds.min[0]) + (2 * padding),
				height = (bounds.max[1] - bounds.min[1]) + (2 * padding),
				marginTop = bounds.min[1] - padding,
				marginLeft = bounds.min[0] - padding;

			this._hexLayout.size([ width, height ]);
			this._container
				.attr('width', width).attr('height', height)
				.style('margin-left', marginLeft + 'px')
				.style('margin-top', marginTop + 'px');

			// Select the hex group for the current zoom level. This has 
			// the effect of recreating the group if the zoom level has changed
			var join = this._container.selectAll('g.hexbin')
				.data([zoom], function(d){ return d; });

			// enter
			join.enter().append('g')
				.attr('class', function(d) { return 'hexbin zoom-' + d; });

			// enter + update
			join.attr('transform', 'translate(' + -marginLeft + ',' + -marginTop + ')');

			// exit
			join.exit().remove();

			// add the hexagons to the select
			this._createHexagons(join, data);

		},

		_createHexagons : function(g, data) {
			var that = this;

			// Create the bins using the hexbin layout
			var bins = that._hexLayout(data);

			// Determine the extent of the values
			var extent = d3.extent(bins, function(d){
				return that.options.value(d);
			});
			if(null == extent[0]) extent[0] = 0;
			if(null == extent[1]) extent[1] = 0;
			if(null != that.options.valueFloor) extent[0] = that.options.valueFloor;
			if(null != that.options.valueCeil) extent[1] = that.options.valueCeil;

			// Match the domain cardinality to that of the color range, to allow for a polylinear scale
			var domain = that._linearlySpace(extent[0], extent[1], that._colorScale.range().length);

			// Set the colorscale domain
			that._colorScale.domain(domain);

			// Join - Join the Hexagons to the data
			var join = g.selectAll('path.hexbin-hexagon')
				.data(bins, function(d){ return d.i + ':' + d.j; });

			// Update - set the fill and opacity on a transition (opacity is re-applied in case the enter transition was cancelled)
			join.transition().duration(that.options.duration)
				.attr('fill', function(d){ return that._colorScale(that.options.value(d)); })
				.attr('fill-opacity', that.options.opacity)
				.attr('stroke-opacity', that.options.opacity);
	
			// Enter - establish the path, the fill, and the initial opacity
			join.enter().append('path').attr('class', 'hexbin-hexagon')
				.attr('d', function(d){ return 'M' + d.x + ',' + d.y + that._hexLayout.hexagon(); })
				.attr('fill', function(d){ return that._colorScale(that.options.value(d)); })
				.attr('fill-opacity', 0.01)
				.attr('stroke-opacity', 0.01)
				.on('mouseover', function(d, i) {
					if(null != that.options.onmouseover) {
						that.options.onmouseover(d, this, that);
					}
				})
				.on('mouseout', function(d, i) {
					if(null != that.options.onmouseout) {
						that.options.onmouseout(d, this, that);
					}
				})
				.on('click', function(d, i) {
					if(null != that.options.onclick) {
						that.options.onclick(d, this, that);
					}
				})
				.transition().duration(that.options.duration)
					.attr('fill-opacity', that.options.opacity)
					.attr('stroke-opacity', that.options.opacity);

			// Exit
			join.exit().transition().duration(that.options.duration)
				.attr('fill-opacity', 0.01)
				.attr('stroke-opacity', 0.01)
				.remove();

		},

		_project : function(coord) {
			var point = this._map.latLngToLayerPoint([ coord[1], coord[0] ]);
			return [ point.x, point.y ];
		},

		_getBounds: function(data){
			var that = this;

			if(null == data || data.length < 1){
				return { min: [0,0], max: [0,0]};
			}

			// bounds is [[min long, min lat], [max long, max lat]]
			var bounds = [[999, 999], [-999, -999]];

			data.forEach(function(element){
				var x = element.point[0];
				var y = element.point[1];

				bounds[0][0] = Math.min(bounds[0][0], x);
				bounds[0][1] = Math.min(bounds[0][1], y);
				bounds[1][0] = Math.max(bounds[1][0], x);
				bounds[1][1] = Math.max(bounds[1][1], y);
			});

			return { min: bounds[0], max: bounds[1] };
		},

		_linearlySpace: function(from, to, length){
			var arr = new Array(length);
			var step = (to - from) / Math.max(length - 1, 1);

			for (var i = 0; i < length; ++i) {
				arr[i] = from + (i * step);
			}

			return arr;
		},

		/* 
		 * Setter for the data
		 */
		data : function(data) {
			this._data = (null != data)? data : [];
			this._redraw();
			return this;
		},

		/*
		 * Getter/setter for the colorScale
		 */
		colorScale: function(colorScale) {
			if(undefined === colorScale){
				return this._colorScale;
			}

			this._colorScale = colorScale;
			this._redraw();
			return this;
		},

		/*
		 * Getter/Setter for the value function
		 */
		value: function(valueFn) {
			if(undefined === valueFn){
				return this.options.value;
			}

			this.options.value = valueFn;
			this._redraw();
			return this;
		},

		/*
		 * Getter/setter for the mouseover function
		 */
		onmouseover: function(mouseoverFn) {
			this.options.onmouseover = mouseoverFn;
			this._redraw();
			return this;
		},

		/*
		 * Getter/setter for the mouseout function
		 */
		onmouseout: function(mouseoutFn) {
			this.options.onmouseout = mouseoutFn;
			this._redraw();
			return this;
		},

		/*
		 * Getter/setter for the click function
		 */
		onclick: function(clickFn) {
			this.options.onclick = clickFn;
			this._redraw();
			return this;
		}

	});

	L.hexbinLayer = function(options) {
		return new L.HexbinLayer(options);
	};

})();

(function(){
	"use strict";

	// L is defined by the Leaflet library, see git://github.com/Leaflet/Leaflet.git for documentation
	L.PingLayer = L.Class.extend({
		includes: [L.Mixin.Events],

		/*
		 * Configuration
		 */
		options : {
			lng: function(d){
				return d[0];
			},
			lat: function(d){
				return d[1];
			},
			fps: 32,
			duration: 800
		},

		_lastUpdate: Date.now(),
		_fps: 0,

		_mapBounds: undefined,

		/*
		 * Public Methods
		 */

		/*
		 * Getter/setter for the radius
		 */
		radiusScale: function(radiusScale) {
			if(undefined === radiusScale){
				return this._radiusScale;
			}

			this._radiusScale = radiusScale;
			return this;
		},

		/*
		 * Getter/setter for the opacity
		 */
		opacityScale: function(opacityScale) {
			if(undefined === opacityScale){
				return this._opacityScale;
			}

			this._opacityScale = opacityScale;
			return this;
		},

		// Initialization of the plugin
		initialize : function(options) {
			L.setOptions(this, options);

			this._radiusScale = d3.scale.pow().exponent(0.35)
				.domain([0, this.options.duration])
				.range([3, 15])
				.clamp(true);
			this._opacityScale = d3.scale.linear()
				.domain([0, this.options.duration])
				.range([1, 0])
				.clamp(true);
		},

		// Called when the plugin layer is added to the map
		onAdd : function(map) {
			this._map = map;

			// Init the state of the simulation
			this._running = false;

			// Create a container for svg.
			this._container = this._initContainer();
			this._updateContainer();

			// Set up events
			map.on({'move': this._move}, this);
		},

		// Called when the plugin layer is removed from the map
		onRemove : function(map) {
			this._destroyContainer();

			// Remove events
			map.off({'move': this._move}, this);

			this._container = null;
			this._map = null;
			this._data = null;
		},

		// Add the layer to the map
		addTo : function(map) {
			map.addLayer(this);
			return this;
		},

		/*
		 * Method by which to "add" pings
		 */
		ping : function(data, cssClass) {
			this._add(data, cssClass);
			this._expire();

			// Start timer if not active
			if(!this._running && this._data.length > 0) {
				this._running = true;
				this._lastUpdate = Date.now();

				var that = this;
				d3.timer(function() { return that._update.apply(that); });
			}

			return this;
		},

		getFps : function() {
			return this._fps;
		},

		getCount : function() {
			return this._data.length;
		},

		/*
		 * Private Methods
		 */

		// Initialize the Container - creates the svg pane
		_initContainer : function() {
			var container = null;

			// If the container is null or the overlay pane is empty, create the svg element for drawing
			if (null == this._container) {
				var overlayPane = this._map.getPanes().overlayPane;
				container = d3.select(overlayPane).append('svg')
					.attr('class', 'leaflet-layer leaflet-zoom-hide');
			}

			return container;
		},

		// Update the container - Updates the dimensions of the svg pane
		_updateContainer : function() {
			var bounds = this._getMapBounds();
			this._mapBounds = bounds;

			this._container
				.attr('width', bounds.width).attr('height', bounds.height)
				.style('margin-left', bounds.left + 'px')
				.style('margin-top', bounds.top + 'px');
		},

		// Cleanup the svg pane
		_destroyContainer: function() {
			// Remove the svg element
			if(null != this._container){
				this._container.remove();
			}
		},

		// Calculate the current map bounds
		_getMapBounds: function(){
			var latLongBounds = this._map.getBounds();
			var ne = this._map.latLngToLayerPoint(latLongBounds.getNorthEast());
			var sw = this._map.latLngToLayerPoint(latLongBounds.getSouthWest());

			var bounds = {
				width: ne.x - sw.x,
				height: sw.y - ne.y,
				left: sw.x,
				top: ne.y
			};

			return bounds;
		},

		// Update the map based on zoom/pan/move
		_move: function() {
			this._updateContainer();
		},

		// Add a ping to the map
		_add : function(data, cssClass) {
			// Lazy init the data array
			if(null == this._data) this._data = [];

			// Derive the spatial data
			var geo = [this.options.lat(data), this.options.lng(data)];
			var point = this._map.latLngToLayerPoint(geo);
			var mapBounds = this._mapBounds;

			// Add the data to the list of pings
			var circle = {
				geo: geo,
				x: point.x - mapBounds.left, y: point.y - mapBounds.top,
				ts: Date.now(),
				nts: 0
			};
			circle.c = this._container.append('circle')
				.attr('class', (null != cssClass)? 'ping ' + cssClass : 'ping')
				.attr('cx', circle.x)
				.attr('cy', circle.y)
				.attr('r', this.radiusScale().range()[0]);

			// Push new circles
			this._data.push(circle);
		},

		// Main update loop
		_update : function() {
			var nowTs = Date.now();
			if(null == this._data) this._data = [];

			var maxIndex = -1;

			// Update everything
			for(var i=0; i < this._data.length; i++) {
				var d = this._data[i];
				var age = nowTs - d.ts;

				if(this.options.duration < age){
					// If the blip is beyond it's life, remove it from the dom and track the lowest index to remove
					d.c.remove();
					maxIndex = i;
				} else {

					// If the blip is still alive, process it
					if(d.nts < nowTs) {
						d.c.attr('r', this.radiusScale()(age))
						   .attr('fill-opacity', this.opacityScale()(age))
						   .attr('stroke-opacity', this.opacityScale()(age));
						d.nts = Math.round(nowTs + 1000/this.options.fps);
					}
				}
			}

			// Delete all the aged off data at once
			if(maxIndex > -1) {
				this._data.splice(0, maxIndex + 1);
			}

			// The return function dictates whether the timer loop will continue
			this._running = (this._data.length > 0);

			if(this._running) {
				this._fps = 1000/(nowTs - this._lastUpdate);
				this._lastUpdate = nowTs;
			}

			return !this._running;
		},

		// Expire old pings
		_expire : function() {
			var maxIndex = -1;
			var nowTs = Date.now();

			// Search from the front of the array
			for(var i=0; i < this._data.length; i++) {
				var d = this._data[i];
				var age = nowTs - d.ts;

				if(this.options.duration < age) {
					// If the blip is beyond it's life, remove it from the dom and track the lowest index to remove
					d.c.remove();
					maxIndex = i;
				} else {
					break;
				}
			}

			// Delete all the aged off data at once
			if(maxIndex > -1) {
				this._data.splice(0, maxIndex + 1);
			}
		}

	});

	L.pingLayer = function(options) {
		return new L.PingLayer(options);
	};

})();;(function(){
  $(window).scroll(function () {
      var top = $(document).scrollTop();
      $('.splash').css({
        'background-position': '0px -'+(top/3).toFixed(2)+'px'
      });
      if(top > 50)
        $('#home > .navbar').removeClass('navbar-transparent');
      else
        $('#home > .navbar').addClass('navbar-transparent');
  });

  $("a[href='#']").click(function(e) {
    e.preventDefault();
  });

  var $button = $("<div id='source-button' class='btn btn-primary btn-xs'>&lt; &gt;</div>").click(function(){
    var html = $(this).parent().html();
    html = cleanSource(html);
    $("#source-modal pre").text(html);
    $("#source-modal").modal();
  });

  $('.bs-component [data-toggle="popover"]').popover();
  $('.bs-component [data-toggle="tooltip"]').tooltip();

  $(".bs-component").hover(function(){
    $(this).append($button);
    $button.show();
  }, function(){
    $button.hide();
  });

  function cleanSource(html) {
    var lines = html.split(/\n/);

    lines.shift();
    lines.splice(-1, 1);

    var indentSize = lines[0].length - lines[0].trim().length,
        re = new RegExp(" {" + indentSize + "}");

    lines = lines.map(function(line){
      if (line.match(re)) {
        line = line.substring(indentSize);
      }

      return line;
    });

    lines = lines.join("\n");

    return lines;
  }

})();

;/*
 * heatmap.js v2.0.0 | JavaScript Heatmap Library
 *
 * Copyright 2008-2014 Patrick Wied <heatmapjs@patrick-wied.at> - All rights reserved.
 * Dual licensed under MIT and Beerware license 
 *
 * :: 2014-09-04 17:52
 */
;(function(global){ 
// Heatmap Config stores default values and will be merged with instance config
var HeatmapConfig = {
  defaultRadius: 40,
  defaultRenderer: 'canvas2d',
  defaultGradient: { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)"},
  defaultMaxOpacity: 1,
  defaultMinOpacity: 0,
  defaultBlur: .85,
  defaultXField: 'x',
  defaultYField: 'y',
  defaultValueField: 'value', 
  plugins: {}
};
var Store = (function StoreClosure() {

  var Store = function Store(config) {
    this._coordinator = {};
    this._data = [];
    this._radi = [];
    this._min = 0;
    this._max = 1;
    this._xField = config['xField'] || config.defaultXField;
    this._yField = config['yField'] || config.defaultYField;
    this._valueField = config['valueField'] || config.defaultValueField;

    if (config["radius"]) {
      this._cfgRadius = config["radius"];
    }
  };

  var defaultRadius = HeatmapConfig.defaultRadius;

  Store.prototype = {
    // when forceRender = false -> called from setData, omits renderall event
    _organiseData: function(dataPoint, forceRender) {
        var x = dataPoint[this._xField];
        var y = dataPoint[this._yField];
        var radi = this._radi;
        var store = this._data;
        var max = this._max;
        var min = this._min;
        var value = dataPoint[this._valueField] || 1;
        var radius = dataPoint.radius || this._cfgRadius || defaultRadius;

        if (!store[x]) {
          store[x] = [];
          radi[x] = [];
        }

        if (!store[x][y]) {
          store[x][y] = value;
          radi[x][y] = radius;
        } else {
          store[x][y] += value;
        }

        if (store[x][y] > max) {
          if (!forceRender) {
            this._max = store[x][y];
          } else {
            this.setDataMax(store[x][y]);
          }
          return false;
        } else{
          return { 
            x: x, 
            y: y,
            value: value, 
            radius: radius,
            min: min,
            max: max 
          };
        }
    },
    _unOrganizeData: function() {
      var unorganizedData = [];
      var data = this._data;
      var radi = this._radi;

      for (var x in data) {
        for (var y in data[x]) {

          unorganizedData.push({
            x: x,
            y: y,
            radius: radi[x][y],
            value: data[x][y]
          });

        }
      }
      return {
        min: this._min,
        max: this._max,
        data: unorganizedData
      };
    },
    _onExtremaChange: function() {
      this._coordinator.emit('extremachange', {
        min: this._min,
        max: this._max
      });
    },
    addData: function() {
      if (arguments[0].length > 0) {
        var dataArr = arguments[0];
        var dataLen = dataArr.length;
        while (dataLen--) {
          this.addData.call(this, dataArr[dataLen]);
        }
      } else {
        // add to store  
        var organisedEntry = this._organiseData(arguments[0], true);
        if (organisedEntry) {
          this._coordinator.emit('renderpartial', {
            min: this._min,
            max: this._max,
            data: [organisedEntry]
          });
        }
      }
      return this;
    },
    setData: function(data) {
      var dataPoints = data.data;
      var pointsLen = dataPoints.length;


      // reset data arrays
      this._data = [];
      this._radi = [];

      for(var i = 0; i < pointsLen; i++) {
        this._organiseData(dataPoints[i], false);
      }
      this._max = data.max;
      this._min = data.min || 0;
      
      this._onExtremaChange();
      this._coordinator.emit('renderall', this._getInternalData());
      return this;
    },
    removeData: function() {
      // TODO: implement
    },
    setDataMax: function(max) {
      this._max = max;
      this._onExtremaChange();
      this._coordinator.emit('renderall', this._getInternalData());
      return this;
    },
    setDataMin: function(min) {
      this._min = min;
      this._onExtremaChange();
      this._coordinator.emit('renderall', this._getInternalData());
      return this;
    },
    setCoordinator: function(coordinator) {
      this._coordinator = coordinator;
    },
    _getInternalData: function() {
      return { 
        max: this._max,
        min: this._min, 
        data: this._data,
        radi: this._radi 
      };
    },
    getData: function() {
      return this._unOrganizeData();
    }/*,
      TODO: rethink.
    getValueAt: function(point) {
      var value;
      var radius = 100;
      var x = point.x;
      var y = point.y;
      var data = this._data;
      if (data[x] && data[x][y]) {
        return data[x][y];
      } else {
        var values = [];
        // radial search for datapoints based on default radius
        for(var distance = 1; distance < radius; distance++) {
          var neighbors = distance * 2 +1;
          var startX = x - distance;
          var startY = y - distance;
          for(var i = 0; i < neighbors; i++) {
            for (var o = 0; o < neighbors; o++) {
              if ((i == 0 || i == neighbors-1) || (o == 0 || o == neighbors-1)) {
                if (data[startY+i] && data[startY+i][startX+o]) {
                  values.push(data[startY+i][startX+o]);
                }
              } else {
                continue;
              } 
            }
          }
        }
        if (values.length > 0) {
          return Math.max.apply(Math, values);
        }
      }
      return false;
    }*/
  };


  return Store;
})();

var Canvas2dRenderer = (function Canvas2dRendererClosure() {
  
  var _getColorPalette = function(config) {
    var gradientConfig = config.gradient || config.defaultGradient;
    var paletteCanvas = document.createElement('canvas');
    var paletteCtx = paletteCanvas.getContext('2d');

    paletteCanvas.width = 256;
    paletteCanvas.height = 1;

    var gradient = paletteCtx.createLinearGradient(0, 0, 256, 1);
    for (var key in gradientConfig) {
      gradient.addColorStop(key, gradientConfig[key]);
    }

    paletteCtx.fillStyle = gradient;
    paletteCtx.fillRect(0, 0, 256, 1);

    return paletteCtx.getImageData(0, 0, 256, 1).data;
  };

  var _getPointTemplate = function(radius, blurFactor) {
    var tplCanvas = document.createElement('canvas');
    var tplCtx = tplCanvas.getContext('2d');
    var x = radius;
    var y = radius;
    tplCanvas.width = tplCanvas.height = radius*2;

    if (blurFactor == 1) {
      tplCtx.beginPath();
      tplCtx.arc(x, y, radius, 0, 2 * Math.PI, false);
      tplCtx.fillStyle = 'rgba(0,0,0,1)';
      tplCtx.fill();
    } else {
      var gradient = tplCtx.createRadialGradient(x, y, radius*blurFactor, x, y, radius);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      tplCtx.fillStyle = gradient;
      tplCtx.fillRect(0, 0, 2*radius, 2*radius);
    }
    
    

    return tplCanvas;
  };

  var _prepareData = function(data) {
    var renderData = [];
    var min = data.min;
    var max = data.max;
    var radi = data.radi;
    var data = data.data;
    
    var xValues = Object.keys(data);
    var xValuesLen = xValues.length;

    while(xValuesLen--) {
      var xValue = xValues[xValuesLen];
      var yValues = Object.keys(data[xValue]);
      var yValuesLen = yValues.length;
      while(yValuesLen--) {
        var yValue = yValues[yValuesLen];
        var value = data[xValue][yValue];
        var radius = radi[xValue][yValue];
        renderData.push({
          x: xValue,
          y: yValue,
          value: value,
          radius: radius
        });
      }
    }

    return {
      min: min,
      max: max,
      data: renderData
    };
  };


  function Canvas2dRenderer(config) {
    var container = config.container;
    var shadowCanvas = this.shadowCanvas = document.createElement('canvas');
    var canvas = this.canvas = config.canvas || document.createElement('canvas');
    var renderBoundaries = this._renderBoundaries = [10000, 10000, 0, 0];

    var computed = getComputedStyle(config.container) || {};

    canvas.className = 'heatmap-canvas';

    this._width = canvas.width = shadowCanvas.width = +(computed.width.replace(/px/,''));
    this._height = canvas.height = shadowCanvas.height = +(computed.height.replace(/px/,''));

    this.shadowCtx = shadowCanvas.getContext('2d');
    this.ctx = canvas.getContext('2d');

    // @TODO:
    // conditional wrapper

    canvas.style.cssText = shadowCanvas.style.cssText = 'position:absolute;left:0;top:0;';

    container.style.position = 'relative';
    container.appendChild(canvas);

    this._palette = _getColorPalette(config);
    this._templates = {};

    this._setStyles(config);
  };

  Canvas2dRenderer.prototype = {
    renderPartial: function(data) {
      this._drawAlpha(data);
      this._colorize();
    },
    renderAll: function(data) {
      // reset render boundaries
      this._clear();
      this._drawAlpha(_prepareData(data));
      this._colorize();
    },
    _updateGradient: function(config) {
      this._palette = _getColorPalette(config);
    },
    updateConfig: function(config) {
      if (config['gradient']) {
        this._updateGradient(config);
      }
      this._setStyles(config);
    },
    setDimensions: function(width, height) {
      this._width = width;
      this._height = height;
      this.canvas.width = this.shadowCanvas.width = width;
      this.canvas.height = this.shadowCanvas.height = height;
    },
    _clear: function() {
      this.shadowCtx.clearRect(0, 0, this._width, this._height);
      this.ctx.clearRect(0, 0, this._width, this._height);
    },
    _setStyles: function(config) {
      this._blur = (config.blur == 0)?0:(config.blur || config.defaultBlur);

      if (config.backgroundColor) {
        this.canvas.style.backgroundColor = config.backgroundColor;
      }

      this._opacity = (config.opacity || 0) * 255;
      this._maxOpacity = (config.maxOpacity || config.defaultMaxOpacity) * 255;
      this._minOpacity = (config.minOpacity || config.defaultMinOpacity) * 255;
      this._useGradientOpacity = !!config.useGradientOpacity;
    },
    _drawAlpha: function(data) {
      var min = this._min = data.min;
      var max = this._max = data.max;
      var data = data.data || [];
      var dataLen = data.length;
      // on a point basis?
      var blur = 1 - this._blur;

      while(dataLen--) {

        var point = data[dataLen];

        var x = point.x;
        var y = point.y;
        var radius = point.radius;
        // if value is bigger than max
        // use max as value
        var value = Math.min(point.value, max);
        var rectX = x - radius;
        var rectY = y - radius;
        var shadowCtx = this.shadowCtx;




        var tpl;
        if (!this._templates[radius]) {
          this._templates[radius] = tpl = _getPointTemplate(radius, blur);
        } else {
          tpl = this._templates[radius];
        }
        // value from minimum / value range
        // => [0, 1]
        shadowCtx.globalAlpha = (value-min)/(max-min);

        shadowCtx.drawImage(tpl, rectX, rectY);

        // update renderBoundaries
        if (rectX < this._renderBoundaries[0]) {
            this._renderBoundaries[0] = rectX;
          } 
          if (rectY < this._renderBoundaries[1]) {
            this._renderBoundaries[1] = rectY;
          }
          if (rectX + 2*radius > this._renderBoundaries[2]) {
            this._renderBoundaries[2] = rectX + 2*radius;
          }
          if (rectY + 2*radius > this._renderBoundaries[3]) {
            this._renderBoundaries[3] = rectY + 2*radius;
          }

      }
    },
    _colorize: function() {
      var x = this._renderBoundaries[0];
      var y = this._renderBoundaries[1];
      var width = this._renderBoundaries[2] - x;
      var height = this._renderBoundaries[3] - y;
      var maxWidth = this._width;
      var maxHeight = this._height;
      var opacity = this._opacity;
      var maxOpacity = this._maxOpacity;
      var minOpacity = this._minOpacity;
      var useGradientOpacity = this._useGradientOpacity;

      if (x < 0) {
        x = 0;
      }
      if (y < 0) {
        y = 0;
      }
      if (x + width > maxWidth) {
        width = maxWidth - x;
      }
      if (y + height > maxHeight) {
        height = maxHeight - y;
      }

      var img = this.shadowCtx.getImageData(x, y, width, height);
      var imgData = img.data;
      var len = imgData.length;
      var palette = this._palette;


      for (var i = 3; i < len; i+= 4) {
        var alpha = imgData[i];
        var offset = alpha * 4;


        if (!offset) {
          continue;
        }

        var finalAlpha;
        if (opacity > 0) {
          finalAlpha = opacity;
        } else {
          if (alpha < maxOpacity) {
            if (alpha < minOpacity) {
              finalAlpha = minOpacity;
            } else {
              finalAlpha = alpha;
            }
          } else {
            finalAlpha = maxOpacity;
          }
        }

        imgData[i-3] = palette[offset];
        imgData[i-2] = palette[offset + 1];
        imgData[i-1] = palette[offset + 2];
        imgData[i] = useGradientOpacity ? palette[offset + 3] : finalAlpha;

      }

      img.data = imgData;
      this.ctx.putImageData(img, x, y);

      this._renderBoundaries = [1000, 1000, 0, 0];

    },
    getValueAt: function(point) {
      var value;
      var shadowCtx = this.shadowCtx;
      var img = shadowCtx.getImageData(point.x, point.y, 1, 1);
      var data = img.data[3];
      var max = this._max;
      var min = this._min;

      value = (Math.abs(max-min) * (data/255)) >> 0;

      return value;
    },
    getDataURL: function() {
      return this.canvas.toDataURL();
    }
  };


  return Canvas2dRenderer;
})();

var Renderer = (function RendererClosure() {

  var rendererFn = false;

  if (HeatmapConfig['defaultRenderer'] === 'canvas2d') {
    rendererFn = Canvas2dRenderer;
  }

  return rendererFn;
})();


var Util = {
  merge: function() {
    var merged = {};
    var argsLen = arguments.length;
    for (var i = 0; i < argsLen; i++) {
      var obj = arguments[i]
      for (var key in obj) {
        merged[key] = obj[key];
      }
    }
    return merged;
  }
};
// Heatmap Constructor
var Heatmap = (function HeatmapClosure() {

  var Coordinator = (function CoordinatorClosure() {

    function Coordinator() {
      this.cStore = {};
    };

    Coordinator.prototype = {
      on: function(evtName, callback, scope) {
        var cStore = this.cStore;

        if (!cStore[evtName]) {
          cStore[evtName] = [];
        }
        cStore[evtName].push((function(data) {
            return callback.call(scope, data);
        }));
      },
      emit: function(evtName, data) {
        var cStore = this.cStore;
        if (cStore[evtName]) {
          var len = cStore[evtName].length;
          for (var i=0; i<len; i++) {
            var callback = cStore[evtName][i];
            callback(data);
          }
        }
      }
    };

    return Coordinator;
  })();


  var _connect = function(scope) {
    var renderer = scope._renderer;
    var coordinator = scope._coordinator;
    var store = scope._store;

    coordinator.on('renderpartial', renderer.renderPartial, renderer);
    coordinator.on('renderall', renderer.renderAll, renderer);
    coordinator.on('extremachange', function(data) {
      scope._config.onExtremaChange &&
      scope._config.onExtremaChange({
        min: data.min,
        max: data.max,
        gradient: scope._config['gradient'] || scope._config['defaultGradient']
      });
    });
    store.setCoordinator(coordinator);
  };


  function Heatmap() {
    var config = this._config = Util.merge(HeatmapConfig, arguments[0] || {});
    this._coordinator = new Coordinator();
    if (config['plugin']) {
      var pluginToLoad = config['plugin'];
      if (!HeatmapConfig.plugins[pluginToLoad]) {
        throw new Error('Plugin \''+ pluginToLoad + '\' not found. Maybe it was not registered.');
      } else {
        var plugin = HeatmapConfig.plugins[pluginToLoad];
        // set plugin renderer and store
        this._renderer = new plugin.renderer(config);
        this._store = new plugin.store(config);
      }
    } else {
      this._renderer = new Renderer(config);
      this._store = new Store(config);
    }
    _connect(this);
  };

  // @TODO:
  // add API documentation
  Heatmap.prototype = {
    addData: function() {
      this._store.addData.apply(this._store, arguments);
      return this;
    },
    removeData: function() {
      this._store.removeData && this._store.removeData.apply(this._store, arguments);
      return this;
    },
    setData: function() {
      this._store.setData.apply(this._store, arguments);
      return this;
    },
    setDataMax: function() {
      this._store.setDataMax.apply(this._store, arguments);
      return this;
    },
    setDataMin: function() {
      this._store.setDataMin.apply(this._store, arguments);
      return this;
    },
    configure: function(config) {
      this._config = Util.merge(this._config, config);
      this._renderer.updateConfig(this._config);
      this._coordinator.emit('renderall', this._store._getInternalData());
      return this;
    },
    repaint: function() {
      this._coordinator.emit('renderall', this._store._getInternalData());
      return this;
    },
    getData: function() {
      return this._store.getData();
    },
    getDataURL: function() {
      return this._renderer.getDataURL();
    },
    getValueAt: function(point) {

      if (this._store.getValueAt) {
        return this._store.getValueAt(point);
      } else  if (this._renderer.getValueAt) {
        return this._renderer.getValueAt(point);
      } else {
        return null;
      }
    }
  };

  return Heatmap;

})();


// core
var heatmapFactory = {
  create: function(config) {
    return new Heatmap(config);
  },
  register: function(pluginKey, plugin) {
    HeatmapConfig.plugins[pluginKey] = plugin;
  }
};

global['h337'] = heatmapFactory;

})(this || window);;/*
* Leaflet Heatmap Overlay
*
* Copyright (c) 2014, Patrick Wied (http://www.patrick-wied.at)
* Dual-licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and the Beerware (http://en.wikipedia.org/wiki/Beerware) license.
*/

var HeatmapOverlay = L.Class.extend({

  initialize: function (config) {
    this.cfg = config;
    this._el = L.DomUtil.create('div', 'leaflet-zoom-hide');
    this._data = [];
    this._max = 1;
    this.cfg.container = this._el;
  },

  onAdd: function (map) {
    var size = map.getSize();

    this._map = map;

    this._width = size.x;
    this._height = size.y;

    this._el.style.width = size.x + 'px';
    this._el.style.height = size.y + 'px';

    this._resetOrigin();

    map.getPanes().overlayPane.appendChild(this._el);

    if (!this._heatmap) {
      this._heatmap = h337.create(this.cfg);
    } 

    // on zoom, reset origin
    map.on('viewreset', this._resetOrigin, this);
    // redraw whenever dragend
    map.on('dragend', this._draw, this);

    this._draw();
  },

  onRemove: function (map) {
    // remove layer's DOM elements and listeners
    map.getPanes().overlayPane.removeChild(this._el);

    map.off('viewreset', this._resetOrigin, this);
    map.off('dragend', this._draw, this);
  },
  _draw: function() {
    if (!this._map) { return; }
    
    var point = this._map.latLngToContainerPoint(this._origin);        

    // reposition the layer
    this._el.style[HeatmapOverlay.CSS_TRANSFORM] = 'translate(' +
      -Math.round(point.x) + 'px,' +
      -Math.round(point.y) + 'px)';

    this._update();
  },
  _update: function() {
    var bounds, zoom, scale;

    bounds = this._map.getBounds();
    zoom = this._map.getZoom();
    scale = Math.pow(2, zoom);

    if (this._data.length == 0) {
      return;
    }

    var generatedData = { max: this._max };
    var latLngPoints = [];
    var radiusMultiplier = this.cfg.scaleRadius ? scale : 1;
    var localMax = 0;
    var valueField = this.cfg.valueField;
    var len = this._data.length;
  
    while (len--) {
      var entry = this._data[len];
      var value = entry[valueField];
      var latlng = entry.latlng;


      // we don't wanna render points that are not even on the map ;-)
      if (!bounds.contains(latlng)) {
        continue;
      }
      // local max is the maximum within current bounds
      if (value > localMax) {
        localMax = value;
      }

      var point = this._map.latLngToContainerPoint(latlng);
      var latlngPoint = { x: Math.round(point.x), y: Math.round(point.y) };
      latlngPoint[valueField] = value;

      var radius;

      if (entry.radius) {
        radius = entry.radius * radiusMultiplier;
      } else {
        radius = (this.cfg.radius || 2) * radiusMultiplier;
      }
      latlngPoint.radius = radius;
      latLngPoints.push(latlngPoint);
    }
    if (this.cfg.useLocalExtrema) {
      generatedData.max = localMax;
    }

    generatedData.data = latLngPoints;

    this._heatmap.setData(generatedData);
  },
  setData: function(data) {
    this._max = data.max || this._max;
    var latField = this.cfg.latField || 'lat';
    var lngField = this.cfg.lngField || 'lng';
    var valueField = this.cfg.valueField || 'value';
  
    // transform data to latlngs
    var data = data.data;
    var len = data.length;
    var d = [];
  
    while (len--) {
      var entry = data[len];
      var latlng = new L.LatLng(entry[latField], entry[lngField]);
      var dataObj = { latlng: latlng };
      dataObj[valueField] = entry[valueField];
      if (entry.radius) {
        dataObj.radius = entry.radius;
      }
      d.push(dataObj);
    }
    this._data = d;
  
    this._draw();
  },
  // experimential... not ready.
  addData: function(pointOrArray) {
    if (pointOrArray.length > 0) {
      var len = pointOrArray.length;
      while(len--) {
        this.addData(pointOrArray[len]);
      }
    } else {
      var latField = this.cfg.latField || 'lat';
      var lngField = this.cfg.lngField || 'lng';
      var valueField = this.cfg.valueField || 'value';
      var entry = pointOrArray;
      var latlng = new L.LatLng(entry[latField], entry[lngField]);
      var dataObj = { latlng: latlng };
      
      dataObj[valueField] = entry[valueField];
      this._max = Math.max(this._max, dataObj[valueField]);

      if (entry.radius) {
        dataObj.radius = entry.radius;
      }
      this._data.push(dataObj);
      this._draw();
    }
  },
  _resetOrigin: function () {
    this._origin = this._map.layerPointToLatLng(new L.Point(0, 0));
    this._draw();
  } 
});

HeatmapOverlay.CSS_TRANSFORM = (function() {
  var div = document.createElement('div');
  var props = [
  'transform',
  'WebkitTransform',
  'MozTransform',
  'OTransform',
  'msTransform'
  ];

  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    if (div.style[prop] !== undefined) {
      return prop;
    }
  }

  return props[0];
})();;(function () {
	'use strict';

	L.TileLayer.Provider = L.TileLayer.extend({
		initialize: function (arg, options) {
			var providers = L.TileLayer.Provider.providers;

			var parts = arg.split('.');

			var providerName = parts[0];
			var variantName = parts[1];

			if (!providers[providerName]) {
				throw 'No such provider (' + providerName + ')';
			}

			var provider = {
				url: providers[providerName].url,
				options: providers[providerName].options
			};

			// overwrite values in provider from variant.
			if (variantName && 'variants' in providers[providerName]) {
				if (!(variantName in providers[providerName].variants)) {
					throw 'No such variant of ' + providerName + ' (' + variantName + ')';
				}
				var variant = providers[providerName].variants[variantName];
				var variantOptions;
				if (typeof variant === 'string') {
					variantOptions = {
						variant: variant
					};
				} else {
					variantOptions = variant.options;
				}
				provider = {
					url: variant.url || provider.url,
					options: L.Util.extend({}, provider.options, variantOptions)
				};
			} else if (typeof provider.url === 'function') {
				provider.url = provider.url(parts.splice(1, parts.length - 1).join('.'));
			}

			var forceHTTP = window.location.protocol === 'file:' || provider.options.forceHTTP;
			if (provider.url.indexOf('//') === 0 && forceHTTP) {
				provider.url = 'http:' + provider.url;
			}

			// replace attribution placeholders with their values from toplevel provider attribution,
			// recursively
			var attributionReplacer = function (attr) {
				if (attr.indexOf('{attribution.') === -1) {
					return attr;
				}
				return attr.replace(/\{attribution.(\w*)\}/,
					function (match, attributionName) {
						return attributionReplacer(providers[attributionName].options.attribution);
					}
				);
			};
			provider.options.attribution = attributionReplacer(provider.options.attribution);

			// Compute final options combining provider options with any user overrides
			var layerOpts = L.Util.extend({}, provider.options, options);
			L.TileLayer.prototype.initialize.call(this, provider.url, layerOpts);
		}
	});

	/**
	 * Definition of providers.
	 * see http://leafletjs.com/reference.html#tilelayer for options in the options map.
	 */

	L.TileLayer.Provider.providers = {
		OpenStreetMap: {
			url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			options: {
				maxZoom: 19,
				attribution:
					'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			},
			variants: {
				Mapnik: {},
				BlackAndWhite: {
					url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
					options: {
						maxZoom: 18
					}
				},
				DE: {
					url: 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
					options: {
						maxZoom: 18
					}
				},
				France: {
					url: 'http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
					options: {
						attribution: '&copy; Openstreetmap France | {attribution.OpenStreetMap}'
					}
				},
				HOT: {
					url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
					options: {
						attribution: '{attribution.OpenStreetMap}, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
					}
				}
			}
		},
		OpenSeaMap: {
			url: 'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
			options: {
				attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
			}
		},
		OpenTopoMap: {
			url: '//{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
			options: {
				maxZoom: 16,
				attribution: 'Map data: {attribution.OpenStreetMap}, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
			}
		},
		Thunderforest: {
			url: '//{s}.tile.thunderforest.com/{variant}/{z}/{x}/{y}.png',
			options: {
				attribution:
					'&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, {attribution.OpenStreetMap}',
				variant: 'cycle'
			},
			variants: {
				OpenCycleMap: 'cycle',
				Transport: {
					options: {
						variant: 'transport',
						maxZoom: 19
					}
				},
				TransportDark: {
					options: {
						variant: 'transport-dark',
						maxZoom: 19
					}
				},
				Landscape: 'landscape',
				Outdoors: 'outdoors'
			}
		},
		OpenMapSurfer: {
			url: 'http://openmapsurfer.uni-hd.de/tiles/{variant}/x={x}&y={y}&z={z}',
			options: {
				maxZoom: 20,
				variant: 'roads',
				attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data {attribution.OpenStreetMap}'
			},
			variants: {
				Roads: 'roads',
				AdminBounds: {
					options: {
						variant: 'adminb',
						maxZoom: 19
					}
				},
				Grayscale: {
					options: {
						variant: 'roadsg',
						maxZoom: 19
					}
				}
			}
		},
		Hydda: {
			url: 'http://{s}.tile.openstreetmap.se/hydda/{variant}/{z}/{x}/{y}.png',
			options: {
				variant: 'full',
				attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data {attribution.OpenStreetMap}'
			},
			variants: {
				Full: 'full',
				Base: 'base',
				RoadsAndLabels: 'roads_and_labels'
			}
		},
		MapQuestOpen: {
			/* Mapquest does support https, but with a different subdomain:
			 * https://otile{s}-s.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}
			 * which makes implementing protocol relativity impossible.
			 */
			url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}',
			options: {
				type: 'map',
				ext: 'jpg',
				attribution:
					'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
					'Map data {attribution.OpenStreetMap}',
				subdomains: '1234'
			},
			variants: {
				OSM: {},
				Aerial: {
					options: {
						type: 'sat',
						attribution:
							'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
							'Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
					}
				},
				HybridOverlay: {
					options: {
						type: 'hyb',
						ext: 'png',
						opacity: 0.9
					}
				}
			}
		},
		MapBox: {
			url: function (id) {
				return '//{s}.tiles.mapbox.com/v3/' + id + '/{z}/{x}/{y}.png';
			},
			options: {
				attribution:
					'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; ' +
					'Map data {attribution.OpenStreetMap}',
				subdomains: 'abcd'
			}
		},
		Stamen: {
			url: '//stamen-tiles-{s}.a.ssl.fastly.net/{variant}/{z}/{x}/{y}.png',
			options: {
				attribution:
					'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
					'<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
					'Map data {attribution.OpenStreetMap}',
				subdomains: 'abcd',
				minZoom: 0,
				maxZoom: 20,
				variant: 'toner',
				ext: 'png'
			},
			variants: {
				Toner: 'toner',
				TonerBackground: 'toner-background',
				TonerHybrid: 'toner-hybrid',
				TonerLines: 'toner-lines',
				TonerLabels: 'toner-labels',
				TonerLite: 'toner-lite',
				Watercolor: {
					options: {
						variant: 'watercolor',
						minZoom: 1,
						maxZoom: 16
					}
				},
				Terrain: {
					options: {
						variant: 'terrain',
						minZoom: 4,
						maxZoom: 18,
						bounds: [[22, -132], [70, -56]]
					}
				},
				TerrainBackground: {
					options: {
						variant: 'terrain-background',
						minZoom: 4,
						maxZoom: 18,
						bounds: [[22, -132], [70, -56]]
					}
				},
				TopOSMRelief: {
					options: {
						variant: 'toposm-color-relief',
						ext: 'jpg',
						bounds: [[22, -132], [51, -56]]
					}
				},
				TopOSMFeatures: {
					options: {
						variant: 'toposm-features',
						bounds: [[22, -132], [51, -56]],
						opacity: 0.9
					}
				}
			}
		},
		Esri: {
			url: '//server.arcgisonline.com/ArcGIS/rest/services/{variant}/MapServer/tile/{z}/{y}/{x}',
			options: {
				variant: 'World_Street_Map',
				attribution: 'Tiles &copy; Esri'
			},
			variants: {
				WorldStreetMap: {
					options: {
						attribution:
							'{attribution.Esri} &mdash; ' +
							'Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
					}
				},
				DeLorme: {
					options: {
						variant: 'Specialty/DeLorme_World_Base_Map',
						minZoom: 1,
						maxZoom: 11,
						attribution: '{attribution.Esri} &mdash; Copyright: &copy;2012 DeLorme'
					}
				},
				WorldTopoMap: {
					options: {
						variant: 'World_Topo_Map',
						attribution:
							'{attribution.Esri} &mdash; ' +
							'Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
					}
				},
				WorldImagery: {
					options: {
						variant: 'World_Imagery',
						attribution:
							'{attribution.Esri} &mdash; ' +
							'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
					}
				},
				WorldTerrain: {
					options: {
						variant: 'World_Terrain_Base',
						maxZoom: 13,
						attribution:
							'{attribution.Esri} &mdash; ' +
							'Source: USGS, Esri, TANA, DeLorme, and NPS'
					}
				},
				WorldShadedRelief: {
					options: {
						variant: 'World_Shaded_Relief',
						maxZoom: 13,
						attribution: '{attribution.Esri} &mdash; Source: Esri'
					}
				},
				WorldPhysical: {
					options: {
						variant: 'World_Physical_Map',
						maxZoom: 8,
						attribution: '{attribution.Esri} &mdash; Source: US National Park Service'
					}
				},
				OceanBasemap: {
					options: {
						variant: 'Ocean_Basemap',
						maxZoom: 13,
						attribution: '{attribution.Esri} &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
					}
				},
				NatGeoWorldMap: {
					options: {
						variant: 'NatGeo_World_Map',
						maxZoom: 16,
						attribution: '{attribution.Esri} &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
					}
				},
				WorldGrayCanvas: {
					options: {
						variant: 'Canvas/World_Light_Gray_Base',
						maxZoom: 16,
						attribution: '{attribution.Esri} &mdash; Esri, DeLorme, NAVTEQ'
					}
				}
			}
		},
		OpenWeatherMap: {
			url: 'http://{s}.tile.openweathermap.org/map/{variant}/{z}/{x}/{y}.png',
			options: {
				maxZoom: 19,
				attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
				opacity: 0.5
			},
			variants: {
				Clouds: 'clouds',
				CloudsClassic: 'clouds_cls',
				Precipitation: 'precipitation',
				PrecipitationClassic: 'precipitation_cls',
				Rain: 'rain',
				RainClassic: 'rain_cls',
				Pressure: 'pressure',
				PressureContour: 'pressure_cntr',
				Wind: 'wind',
				Temperature: 'temp',
				Snow: 'snow'
			}
		},
		HERE: {
			/*
			 * HERE maps, formerly Nokia maps.
			 * These basemaps are free, but you need an API key. Please sign up at
			 * http://developer.here.com/getting-started
			 *
			 * Note that the base urls contain '.cit' whichs is HERE's
			 * 'Customer Integration Testing' environment. Please remove for production
			 * envirionments.
			 */
			url:
				'//{s}.{base}.maps.cit.api.here.com/maptile/2.1/' +
				'maptile/{mapID}/{variant}/{z}/{x}/{y}/256/png8?' +
				'app_id={app_id}&app_code={app_code}',
			options: {
				attribution:
					'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
				subdomains: '1234',
				mapID: 'newest',
				'app_id': '<insert your app_id here>',
				'app_code': '<insert your app_code here>',
				base: 'base',
				variant: 'normal.day',
				maxZoom: 20
			},
			variants: {
				normalDay: 'normal.day',
				normalDayCustom: 'normal.day.custom',
				normalDayGrey: 'normal.day.grey',
				normalDayMobile: 'normal.day.mobile',
				normalDayGreyMobile: 'normal.day.grey.mobile',
				normalDayTransit: 'normal.day.transit',
				normalDayTransitMobile: 'normal.day.transit.mobile',
				normalNight: 'normal.night',
				normalNightMobile: 'normal.night.mobile',
				normalNightGrey: 'normal.night.grey',
				normalNightGreyMobile: 'normal.night.grey.mobile',

				carnavDayGrey: 'carnav.day.grey',
				hybridDay: {
					options: {
						base: 'aerial',
						variant: 'hybrid.day'
					}
				},
				hybridDayMobile: {
					options: {
						base: 'aerial',
						variant: 'hybrid.day.mobile'
					}
				},
				pedestrianDay: 'pedestrian.day',
				pedestrianNight: 'pedestrian.night',
				satelliteDay: {
					options: {
						base: 'aerial',
						variant: 'satellite.day'
					}
				},
				terrainDay: {
					options: {
						base: 'aerial',
						variant: 'terrain.day'
					}
				},
				terrainDayMobile: {
					options: {
						base: 'aerial',
						variant: 'terrain.day.mobile'
					}
				}
			}
		},
		Acetate: {
			url: 'http://a{s}.acetate.geoiq.com/tiles/{variant}/{z}/{x}/{y}.png',
			options: {
				attribution:
					'&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
				subdomains: '0123',
				minZoom: 2,
				maxZoom: 18,
				variant: 'acetate-base'
			},
			variants: {
				basemap: 'acetate-base',
				terrain: 'terrain',
				all: 'acetate-hillshading',
				foreground: 'acetate-fg',
				roads: 'acetate-roads',
				labels: 'acetate-labels',
				hillshading: 'hillshading'
			}
		},
		FreeMapSK: {
			url: 'http://{s}.freemap.sk/T/{z}/{x}/{y}.jpeg',
			options: {
				minZoom: 8,
				maxZoom: 16,
				subdomains: ['t1', 't2', 't3', 't4'],
				attribution:
					'{attribution.OpenStreetMap}, vizualization CC-By-SA 2.0 <a href="http://freemap.sk">Freemap.sk</a>'
			}
		},
		MtbMap: {
			url: 'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png',
			options: {
				attribution:
					'{attribution.OpenStreetMap} &amp; USGS'
			}
		},
		CartoDB: {
			url: 'http://{s}.basemaps.cartocdn.com/{variant}/{z}/{x}/{y}.png',
			options: {
				attribution: '{attribution.OpenStreetMap} &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
				subdomains: 'abcd',
				maxZoom: 19,
				variant: 'light_all'
			},
			variants: {
				Positron: 'light_all',
				PositronNoLabels: 'light_nolabels',
				DarkMatter: 'dark_all',
				DarkMatterNoLabels: 'dark_nolabels'
			}
		},
		HikeBike: {
			url: 'http://{s}.tiles.wmflabs.org/{variant}/{z}/{x}/{y}.png',
			options: {
				maxZoom: 19,
				attribution: '{attribution.OpenStreetMap}',
				variant: 'hikebike'
			},
			variants: {
				HikeBike: {},
				HillShading: {
					options: {
						maxZoom: 15,
						variant: 'hillshading'
					}
				}
			}
		},
		BasemapAT: {
			url: '//maps{s}.wien.gv.at/basemap/{variant}/normal/google3857/{z}/{y}/{x}.{format}',
			options: {
				maxZoom: 19,
				attribution: 'Datenquelle: <a href="www.basemap.at">basemap.at</a>',
				subdomains: ['', '1', '2', '3', '4'],
				format: 'png',
				bounds: [[46.358770, 8.782379], [49.037872, 17.189532]],
				variant: 'geolandbasemap'
			},
			variants: {
				basemap: 'geolandbasemap',
				grau: 'bmapgrau',
				overlay: 'bmapoverlay',
				highdpi: {
					options: {
						variant: 'bmaphidpi',
						format: 'jpeg'
					}
				},
				orthofoto: {
					options: {
						variant: 'bmaporthofoto30cm',
						format: 'jpeg'
					}
				}
			}
		},
		NASAGIBS: {
			url: '//map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}',
			options: {
				attribution:
					'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System ' +
					'(<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
				bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
				minZoom: 1,
				maxZoom: 9,
				format: 'jpg',
				time: '',
				tilematrixset: 'GoogleMapsCompatible_Level'
			},
			variants: {
				ModisTerraTrueColorCR: 'MODIS_Terra_CorrectedReflectance_TrueColor',
				ModisTerraBands367CR: 'MODIS_Terra_CorrectedReflectance_Bands367',
				ViirsEarthAtNight2012: {
					options: {
						variant: 'VIIRS_CityLights_2012',
						maxZoom: 8
					}
				},
				ModisTerraLSTDay: {
					options: {
						variant: 'MODIS_Terra_Land_Surface_Temp_Day',
						format: 'png',
						maxZoom: 7,
						opacity: 0.75
					}
				},
				ModisTerraSnowCover: {
					options: {
						variant: 'MODIS_Terra_Snow_Cover',
						format: 'png',
						maxZoom: 8,
						opacity: 0.75
					}
				},
				ModisTerraAOD: {
					options: {
						variant: 'MODIS_Terra_Aerosol',
						format: 'png',
						maxZoom: 6,
						opacity: 0.75
					}
				},
				ModisTerraChlorophyll: {
					options: {
						variant: 'MODIS_Terra_Chlorophyll_A',
						format: 'png',
						maxZoom: 7,
						opacity: 0.75
					}
				}
			}
		}
	};

	L.tileLayer.provider = function (provider, options) {
		return new L.TileLayer.Provider(provider, options);
	};
}());;/*
	Leaflet.label, a plugin that adds labels to markers and vectors for Leaflet powered maps.
	(c) 2012-2013, Jacob Toye, Smartrak
	https://github.com/Leaflet/Leaflet.label
	http://leafletjs.com
	https://github.com/jacobtoye
*/
(function (window, document, undefined) {
var L = window.L;/*
 * Leaflet.label assumes that you have already included the Leaflet library.
 */

L.labelVersion = '0.2.2-dev';

L.Label = (L.Layer ? L.Layer : L.Class).extend({

	includes: L.Mixin.Events,

	options: {
		className: '',
		clickable: false,
		direction: 'right',
		noHide: false,
		offset: [12, -15], // 6 (width of the label triangle) + 6 (padding)
		opacity: 1,
		zoomAnimation: true
	},

	initialize: function (options, source) {
		L.setOptions(this, options);

		this._source = source;
		this._animated = L.Browser.any3d && this.options.zoomAnimation;
		this._isOpen = false;
	},

	onAdd: function (map) {
		this._map = map;

		this._pane = this.options.pane ? map._panes[this.options.pane] :
			this._source instanceof L.Marker ? map._panes.markerPane : map._panes.popupPane;

		if (!this._container) {
			this._initLayout();
		}

		this._pane.appendChild(this._container);

		this._initInteraction();

		this._update();

		this.setOpacity(this.options.opacity);

		map
			.on('moveend', this._onMoveEnd, this)
			.on('viewreset', this._onViewReset, this);

		if (this._animated) {
			map.on('zoomanim', this._zoomAnimation, this);
		}

		if (L.Browser.touch && !this.options.noHide) {
			L.DomEvent.on(this._container, 'click', this.close, this);
			map.on('click', this.close, this);
		}
	},

	onRemove: function (map) {
		this._pane.removeChild(this._container);

		map.off({
			zoomanim: this._zoomAnimation,
			moveend: this._onMoveEnd,
			viewreset: this._onViewReset
		}, this);

		this._removeInteraction();

		this._map = null;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		if (this._map) {
			this._updatePosition();
		}
		return this;
	},

	setContent: function (content) {
		// Backup previous content and store new content
		this._previousContent = this._content;
		this._content = content;

		this._updateContent();

		return this;
	},

	close: function () {
		var map = this._map;

		if (map) {
			if (L.Browser.touch && !this.options.noHide) {
				L.DomEvent.off(this._container, 'click', this.close);
				map.off('click', this.close, this);
			}

			map.removeLayer(this);
		}
	},

	updateZIndex: function (zIndex) {
		this._zIndex = zIndex;

		if (this._container && this._zIndex) {
			this._container.style.zIndex = zIndex;
		}
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._container) {
			L.DomUtil.setOpacity(this._container, opacity);
		}
	},

	_initLayout: function () {
		this._container = L.DomUtil.create('div', 'leaflet-label ' + this.options.className + ' leaflet-zoom-animated');
		this.updateZIndex(this._zIndex);
	},

	_update: function () {
		if (!this._map) { return; }

		this._container.style.visibility = 'hidden';

		this._updateContent();
		this._updatePosition();

		this._container.style.visibility = '';
	},

	_updateContent: function () {
		if (!this._content || !this._map || this._prevContent === this._content) {
			return;
		}

		if (typeof this._content === 'string') {
			this._container.innerHTML = this._content;

			this._prevContent = this._content;

			this._labelWidth = this._container.offsetWidth;
		}
	},

	_updatePosition: function () {
		var pos = this._map.latLngToLayerPoint(this._latlng);

		this._setPosition(pos);
	},

	_setPosition: function (pos) {
		var map = this._map,
			container = this._container,
			centerPoint = map.latLngToContainerPoint(map.getCenter()),
			labelPoint = map.layerPointToContainerPoint(pos),
			direction = this.options.direction,
			labelWidth = this._labelWidth,
			offset = L.point(this.options.offset);

		// position to the right (right or auto & needs to)
		if (direction === 'right' || direction === 'auto' && labelPoint.x < centerPoint.x) {
			L.DomUtil.addClass(container, 'leaflet-label-right');
			L.DomUtil.removeClass(container, 'leaflet-label-left');

			pos = pos.add(offset);
		} else { // position to the left
			L.DomUtil.addClass(container, 'leaflet-label-left');
			L.DomUtil.removeClass(container, 'leaflet-label-right');

			pos = pos.add(L.point(-offset.x - labelWidth, offset.y));
		}

		L.DomUtil.setPosition(container, pos);
	},

	_zoomAnimation: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

		this._setPosition(pos);
	},

	_onMoveEnd: function () {
		if (!this._animated || this.options.direction === 'auto') {
			this._updatePosition();
		}
	},

	_onViewReset: function (e) {
		/* if map resets hard, we must update the label */
		if (e && e.hard) {
			this._update();
		}
	},

	_initInteraction: function () {
		if (!this.options.clickable) { return; }

		var container = this._container,
			events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		L.DomUtil.addClass(container, 'leaflet-clickable');
		L.DomEvent.on(container, 'click', this._onMouseClick, this);

		for (var i = 0; i < events.length; i++) {
			L.DomEvent.on(container, events[i], this._fireMouseEvent, this);
		}
	},

	_removeInteraction: function () {
		if (!this.options.clickable) { return; }

		var container = this._container,
			events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		L.DomUtil.removeClass(container, 'leaflet-clickable');
		L.DomEvent.off(container, 'click', this._onMouseClick, this);

		for (var i = 0; i < events.length; i++) {
			L.DomEvent.off(container, events[i], this._fireMouseEvent, this);
		}
	},

	_onMouseClick: function (e) {
		if (this.hasEventListeners(e.type)) {
			L.DomEvent.stopPropagation(e);
		}

		this.fire(e.type, {
			originalEvent: e
		});
	},

	_fireMouseEvent: function (e) {
		this.fire(e.type, {
			originalEvent: e
		});

		// TODO proper custom event propagation
		// this line will always be called if marker is in a FeatureGroup
		if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousedown') {
			L.DomEvent.stopPropagation(e);
		} else {
			L.DomEvent.preventDefault(e);
		}
	}
});


// This object is a mixin for L.Marker and L.CircleMarker. We declare it here as both need to include the contents.
L.BaseMarkerMethods = {
	showLabel: function () {
		if (this.label && this._map) {
			this.label.setLatLng(this._latlng);
			this._map.showLabel(this.label);
		}

		return this;
	},

	hideLabel: function () {
		if (this.label) {
			this.label.close();
		}
		return this;
	},

	setLabelNoHide: function (noHide) {
		if (this._labelNoHide === noHide) {
			return;
		}

		this._labelNoHide = noHide;

		if (noHide) {
			this._removeLabelRevealHandlers();
			this.showLabel();
		} else {
			this._addLabelRevealHandlers();
			this.hideLabel();
		}
	},

	bindLabel: function (content, options) {
		var labelAnchor = this.options.icon ? this.options.icon.options.labelAnchor : this.options.labelAnchor,
			anchor = L.point(labelAnchor) || L.point(0, 0);

		anchor = anchor.add(L.Label.prototype.options.offset);

		if (options && options.offset) {
			anchor = anchor.add(options.offset);
		}

		options = L.Util.extend({offset: anchor}, options);

		this._labelNoHide = options.noHide;

		if (!this.label) {
			if (!this._labelNoHide) {
				this._addLabelRevealHandlers();
			}

			this
				.on('remove', this.hideLabel, this)
				.on('move', this._moveLabel, this)
				.on('add', this._onMarkerAdd, this);

			this._hasLabelHandlers = true;
		}

		this.label = new L.Label(options, this)
			.setContent(content);

		return this;
	},

	unbindLabel: function () {
		if (this.label) {
			this.hideLabel();

			this.label = null;

			if (this._hasLabelHandlers) {
				if (!this._labelNoHide) {
					this._removeLabelRevealHandlers();
				}

				this
					.off('remove', this.hideLabel, this)
					.off('move', this._moveLabel, this)
					.off('add', this._onMarkerAdd, this);
			}

			this._hasLabelHandlers = false;
		}
		return this;
	},

	updateLabelContent: function (content) {
		if (this.label) {
			this.label.setContent(content);
		}
	},

	getLabel: function () {
		return this.label;
	},

	_onMarkerAdd: function () {
		if (this._labelNoHide) {
			this.showLabel();
		}
	},

	_addLabelRevealHandlers: function () {
		this
			.on('mouseover', this.showLabel, this)
			.on('mouseout', this.hideLabel, this);

		if (L.Browser.touch) {
			this.on('click', this.showLabel, this);
		}
	},

	_removeLabelRevealHandlers: function () {
		this
			.off('mouseover', this.showLabel, this)
			.off('mouseout', this.hideLabel, this);

		if (L.Browser.touch) {
			this.off('click', this.showLabel, this);
		}
	},

	_moveLabel: function (e) {
		this.label.setLatLng(e.latlng);
	}
};

// Add in an option to icon that is used to set where the label anchor is
L.Icon.Default.mergeOptions({
	labelAnchor: new L.Point(9, -20)
});

// Have to do this since Leaflet is loaded before this plugin and initializes
// L.Marker.options.icon therefore missing our mixin above.
L.Marker.mergeOptions({
	icon: new L.Icon.Default()
});

L.Marker.include(L.BaseMarkerMethods);
L.Marker.include({
	_originalUpdateZIndex: L.Marker.prototype._updateZIndex,

	_updateZIndex: function (offset) {
		var zIndex = this._zIndex + offset;

		this._originalUpdateZIndex(offset);

		if (this.label) {
			this.label.updateZIndex(zIndex);
		}
	},

	_originalSetOpacity: L.Marker.prototype.setOpacity,

	setOpacity: function (opacity, labelHasSemiTransparency) {
		this.options.labelHasSemiTransparency = labelHasSemiTransparency;

		this._originalSetOpacity(opacity);
	},

	_originalUpdateOpacity: L.Marker.prototype._updateOpacity,

	_updateOpacity: function () {
		var absoluteOpacity = this.options.opacity === 0 ? 0 : 1;

		this._originalUpdateOpacity();

		if (this.label) {
			this.label.setOpacity(this.options.labelHasSemiTransparency ? this.options.opacity : absoluteOpacity);
		}
	},

	_originalSetLatLng: L.Marker.prototype.setLatLng,

	setLatLng: function (latlng) {
		if (this.label && !this._labelNoHide) {
			this.hideLabel();
		}

		return this._originalSetLatLng(latlng);
	}
});

// Add in an option to icon that is used to set where the label anchor is
L.CircleMarker.mergeOptions({
	labelAnchor: new L.Point(0, 0)
});


L.CircleMarker.include(L.BaseMarkerMethods);

L.Path.include({
	bindLabel: function (content, options) {
		if (!this.label || this.label.options !== options) {
			this.label = new L.Label(options, this);
		}

		this.label.setContent(content);

		if (!this._showLabelAdded) {
			this
				.on('mouseover', this._showLabel, this)
				.on('mousemove', this._moveLabel, this)
				.on('mouseout remove', this._hideLabel, this);

			if (L.Browser.touch) {
				this.on('click', this._showLabel, this);
			}
			this._showLabelAdded = true;
		}

		return this;
	},

	unbindLabel: function () {
		if (this.label) {
			this._hideLabel();
			this.label = null;
			this._showLabelAdded = false;
			this
				.off('mouseover', this._showLabel, this)
				.off('mousemove', this._moveLabel, this)
				.off('mouseout remove', this._hideLabel, this);
		}
		return this;
	},

	updateLabelContent: function (content) {
		if (this.label) {
			this.label.setContent(content);
		}
	},

	_showLabel: function (e) {
		this.label.setLatLng(e.latlng);
		this._map.showLabel(this.label);
	},

	_moveLabel: function (e) {
		this.label.setLatLng(e.latlng);
	},

	_hideLabel: function () {
		this.label.close();
	}
});

L.Map.include({
	showLabel: function (label) {
		return this.addLayer(label);
	}
});

L.FeatureGroup.include({
	// TODO: remove this when AOP is supported in Leaflet, need this as we cannot put code in removeLayer()
	clearLayers: function () {
		this.unbindLabel();
		this.eachLayer(this.removeLayer, this);
		return this;
	},

	bindLabel: function (content, options) {
		return this.invoke('bindLabel', content, options);
	},

	unbindLabel: function () {
		return this.invoke('unbindLabel');
	},

	updateLabelContent: function (content) {
		this.invoke('updateLabelContent', content);
	}
});

}(window, document));;L.Icon.Label = L.Icon.extend({
	options: {
		/*
		labelAnchor: (Point) (top left position of the label within the wrapper, default is right)
		wrapperAnchor: (Point) (position of icon and label relative to Lat/Lng)
		iconAnchor: (Point) (top left position of icon within wrapper)
		labelText: (String) (label's text component, if this is null the element will not be created)
		*/
		/* Icon options:
		iconUrl: (String) (required)
		iconSize: (Point) (can be set through CSS)
		iconAnchor: (Point) (centered by default if size is specified, can be set in CSS with negative margins)
		popupAnchor: (Point) (if not specified, popup opens in the anchor point)
		shadowUrl: (Point) (no shadow by default)
		shadowSize: (Point)
		*/
		labelClassName: ''
	},
	
	initialize: function (options) {
		L.Util.setOptions(this, options);
		L.Icon.prototype.initialize.call(this, this.options);
	},

	setLabelAsHidden: function () {
		this._labelHidden = true;
	},

	createIcon: function () {
		return this._createLabel(L.Icon.prototype.createIcon.call(this));
	},
	
	createShadow: function () {
		if (!this.options.shadowUrl) {
			return null;
		}
		var shadow = L.Icon.prototype.createShadow.call(this);
		//need to reposition the shadow
		if (shadow) {
			shadow.style.marginLeft = (-this.options.wrapperAnchor.x) + 'px';
			shadow.style.marginTop = (-this.options.wrapperAnchor.y) + 'px';
		}
		return shadow;
	},

	updateLabel: function (icon, text) {
		if (icon.nodeName.toUpperCase() === 'DIV') {
			icon.childNodes[1].innerHTML = text;
			
			this.options.labelText = text;
		}
	},

	showLabel: function (icon) {
		if (!this._labelTextIsSet()) {
			return;
		}

		icon.childNodes[1].style.display = 'block';
	},

	hideLabel: function (icon) {
		if (!this._labelTextIsSet()) {
			return;
		}

		icon.childNodes[1].style.display = 'none';
	},

	_createLabel: function (img) {
		if (!this._labelTextIsSet()) {
			return img;
		}

		var wrapper = document.createElement('div'),
			label = document.createElement('span');

		// set up wrapper anchor
		wrapper.style.marginLeft = (-this.options.wrapperAnchor.x) + 'px';
		wrapper.style.marginTop = (-this.options.wrapperAnchor.y) + 'px';

		wrapper.className = 'leaflet-marker-icon-wrapper leaflet-zoom-animated';

		// set up label
		label.className = 'leaflet-marker-iconlabel ' + this.options.labelClassName;

		label.innerHTML = this.options.labelText;

		label.style.marginLeft = this.options.labelAnchor.x + 'px';
		label.style.marginTop = this.options.labelAnchor.y + 'px';

		if (this._labelHidden) {
			label.style.display = 'none';
			// Ensure that the pointer cursor shows
			img.style.cursor = 'pointer';
		}
		
		//reset icons margins (as super makes them -ve)
		img.style.marginLeft = this.options.iconAnchor.x + 'px';
		img.style.marginTop = this.options.iconAnchor.y + 'px';
		
		wrapper.appendChild(img);
		wrapper.appendChild(label);

		return wrapper;
	},
	
	_labelTextIsSet: function () {
		return typeof this.options.labelText !== 'undefined' && this.options.labelText !== null;
	}
});

L.Icon.Label.Default = L.Icon.Label.extend({
	options: {
		//This is the top left position of the label within the wrapper. By default it will display at the right
		//middle position of the default icon. x = width of icon + padding
		//If the icon height is greater than the label height you will need to set the y value.
		//y = (icon height - label height) / 2
		labelAnchor: new L.Point(29, 8),
		
		//This is the position of the wrapper div. Use this to position icon + label relative to the Lat/Lng.
		//By default the point of the default icon is anchor
		wrapperAnchor: new L.Point(13, 41),
		
		//This is now the top left position of the icon within the wrapper.
		//If the label height is greater than the icon you will need to set the y value.
		//y = (label height - icon height) / 2
		iconAnchor: new L.Point(0, 0),
		
		//label's text component, if this is null the element will not be created
		labelText: null,
		
		/* From L.Icon.Default */
		iconUrl: L.Icon.Default.imagePath + '/marker-icon.png',
		iconSize: new L.Point(25, 41),
		popupAnchor: new L.Point(0, -33),

		shadowUrl: L.Icon.Default.imagePath + '/marker-shadow.png',
		shadowSize: new L.Point(41, 41)
	}
});

L.Marker.Label = L.Marker.extend({
	updateLabel: function (text) {
		this.options.icon.updateLabel(this._icon, text);
	},

	_initIcon: function () {
		if (!(this.options.icon instanceof L.Icon.Label)) {
			throw new Error('Icon must be an instance of L.Icon.Label.');
		}

		// Ensure that the label is hidden to begin with
		if (this.options.revealing) {
			this.options.icon.setLabelAsHidden();
		}

		L.Marker.prototype._initIcon.call(this);
	},

	_removeIcon: function () {
		if (this.options.revealing) {
			L.DomEvent
				.off(this._icon, 'mouseover', this._showLabel)
				.off(this._icon, 'mouseout', this._hideLabel);
		}

		L.Marker.prototype._removeIcon.call(this);
	},

	_initInteraction: function () {
		L.Marker.prototype._initInteraction.call(this);

		if (!this.options.revealing) {
			return;
		}

		L.DomEvent
			.on(this._icon, 'mouseover', this._showLabel, this)
			.on(this._icon, 'mouseout', this._hideLabel, this);
	},

	_showLabel: function () {
		this.options.icon.showLabel(this._icon);
	},

	_hideLabel: function () {
		this.options.icon.hideLabel(this._icon);
	}
});;/**************************************************************************
* AngularJS-nvD3, v1.0.3; MIT License; 06/11/2015 13:30
* http://krispo.github.io/angular-nvd3
**************************************************************************/
(function(){

    'use strict';

    angular.module('nvd3', [])

        .directive('nvd3', ['nvd3Utils', function(nvd3Utils){
            return {
                restrict: 'AE',
                scope: {
                    data: '=',      //chart data, [required]
                    options: '=',   //chart options, according to nvd3 core api, [required]
                    api: '=?',      //directive global api, [optional]
                    events: '=?',   //global events that directive would subscribe to, [optional]
                    config: '=?'    //global directive configuration, [optional]
                },
                link: function(scope, element, attrs){
                    var defaultConfig = {
                        extended: false,
                        visible: true,
                        disabled: false,
                        autorefresh: true,
                        refreshDataOnly: true,
                        deepWatchOptions: true,
                        deepWatchData: false, // to increase performance by default
                        deepWatchConfig: true,
                        debounce: 10 // default 10ms, time silence to prevent refresh while multiple options changes at a time
                    };

                    //basic directive configuration
                    scope._config = angular.extend(defaultConfig, scope.config);

                    //directive global api
                    scope.api = {
                        // Fully refresh directive
                        refresh: function(){
                            scope.api.updateWithOptions(scope.options);
                        },

                        // Update chart layout (for example if container is resized)
                        update: function() {
                            if (scope.chart) scope.chart.update();
                        },

                        // Update chart with new options
                        updateWithOptions: function(options){
                            // Clearing
                            scope.api.clearElement();

                            // Exit if options are not yet bound
                            if (angular.isDefined(options) === false) return;

                            // Exit if chart is hidden
                            if (!scope._config.visible) return;

                            // Initialize chart with specific type
                            scope.chart = nv.models[options.chart.type]();

                            // Generate random chart ID
                            scope.chart.id = Math.random().toString(36).substr(2, 15);

                            angular.forEach(scope.chart, function(value, key){
                                if (key[0] === '_');
                                else if ([
                                        'clearHighlights',
                                        'highlightPoint',
                                        'id',
                                        'options',
                                        'resizeHandler',
                                        'state',
                                        'open',
                                        'close',
                                        'tooltipContent'
                                    ].indexOf(key) >= 0);

                                else if (key === 'dispatch') {
                                    if (options.chart[key] === undefined || options.chart[key] === null) {
                                        if (scope._config.extended) options.chart[key] = {};
                                    }
                                    configureEvents(scope.chart[key], options.chart[key]);
                                }

                                else if ([
                                        'bars',
                                        'bars1',
                                        'bars2',
                                        'boxplot',
                                        'bullet',
                                        'controls',
                                        'discretebar',
                                        'distX',
                                        'distY',
                                        'interactiveLayer',
                                        'legend',
                                        'lines',
                                        'lines1',
                                        'lines2',
                                        'multibar',
                                        'pie',
                                        'scatter',
                                        'sparkline',
                                        'stack1',
                                        'stack2',
                                        'sunburst',
                                        'tooltip',
                                        'x2Axis',
                                        'xAxis',
                                        'y1Axis',
                                        'y2Axis',
                                        'y3Axis',
                                        'y4Axis',
                                        'yAxis',
                                        'yAxis1',
                                        'yAxis2'
                                    ].indexOf(key) >= 0 ||
                                        // stacked is a component for stackedAreaChart, but a boolean for multiBarChart and multiBarHorizontalChart
                                    (key === 'stacked' && options.chart.type === 'stackedAreaChart')) {
                                    if (options.chart[key] === undefined || options.chart[key] === null) {
                                        if (scope._config.extended) options.chart[key] = {};
                                    }
                                    configure(scope.chart[key], options.chart[key], options.chart.type);
                                }

                                //TODO: need to fix bug in nvd3
                                else if ((key === 'xTickFormat' || key === 'yTickFormat') && options.chart.type === 'lineWithFocusChart');
                                else if ((key === 'tooltips') && options.chart.type === 'boxPlotChart');
                                else if ((key === 'tooltipXContent' || key === 'tooltipYContent') && options.chart.type === 'scatterChart');

                                else if (options.chart[key] === undefined || options.chart[key] === null){
                                    if (scope._config.extended) options.chart[key] = value();
                                }

                                else scope.chart[key](options.chart[key]);
                            });

                            // Update with data
                            if (options.chart.type === 'sunburstChart') {
                                scope.api.updateWithData(angular.copy(scope.data));
                            } else {
                                scope.api.updateWithData(scope.data);
                            }

                            // Configure wrappers
                            if (options['title'] || scope._config.extended) configureWrapper('title');
                            if (options['subtitle'] || scope._config.extended) configureWrapper('subtitle');
                            if (options['caption'] || scope._config.extended) configureWrapper('caption');


                            // Configure styles
                            if (options['styles'] || scope._config.extended) configureStyles();

                            nv.addGraph(function() {
                                if (!scope.chart) return;

                                // Remove resize handler. Due to async execution should be placed here, not in the clearElement
                                if (scope.chart.resizeHandler) scope.chart.resizeHandler.clear();

                                // Update the chart when window resizes
                                scope.chart.resizeHandler = nv.utils.windowResize(function() {
                                    scope.chart && scope.chart.update && scope.chart.update();
                                });

                                /// Zoom feature
                                if (options.chart.zoom !== undefined && [
                                        'scatterChart',
                                        'lineChart',
                                        'candlestickBarChart',
                                        'cumulativeLineChart',
                                        'historicalBarChart',
                                        'ohlcBarChart',
                                        'stackedAreaChart'
                                    ].indexOf(options.chart.type) > -1) {
                                    nvd3Utils.zoom(scope, options);
                                }

                                return scope.chart;
                            }, options.chart['callback']);
                        },

                        // Update chart with new data
                        updateWithData: function (data){
                            if (data) {
                                // remove whole svg element with old data
                                d3.select(element[0]).select('svg').remove();

                                var h, w;

                                // Select the current element to add <svg> element and to render the chart in
                                scope.svg = d3.select(element[0]).append('svg');
                                if (h = scope.options.chart.height) {
                                    if (!isNaN(+h)) h += 'px'; //check if height is number
                                    scope.svg.attr('height', h).style({height: h});
                                }
                                if (w = scope.options.chart.width) {
                                    if (!isNaN(+w)) w += 'px'; //check if width is number
                                    scope.svg.attr('width', w).style({width: w});
                                } else {
                                    scope.svg.attr('width', '100%').style({width: '100%'});
                                }

                                scope.svg.datum(data).call(scope.chart);
                            }
                        },

                        // Fully clear directive element
                        clearElement: function (){
                            element.find('.title').remove();
                            element.find('.subtitle').remove();
                            element.find('.caption').remove();
                            element.empty();

                            // remove tooltip if exists
                            if (scope.chart && scope.chart.tooltip && scope.chart.tooltip.id) {
                                d3.select('#' + scope.chart.tooltip.id()).remove();
                            }

                            // To be compatible with old nvd3 (v1.7.1)
                            if (nv.graphs && scope.chart) {
                                for (var i = nv.graphs.length - 1; i >= 0; i--) {
                                    if (nv.graphs[i] && (nv.graphs[i].id === scope.chart.id)) {
                                        nv.graphs.splice(i, 1);
                                    }
                                }
                            }
                            if (nv.tooltip && nv.tooltip.cleanup) {
                                nv.tooltip.cleanup();
                            }
                            if (scope.chart && scope.chart.resizeHandler) scope.chart.resizeHandler.clear();
                            scope.chart = null;
                        },

                        // Get full directive scope
                        getScope: function(){ return scope; }
                    };

                    // Configure the chart model with the passed options
                    function configure(chart, options, chartType){
                        if (chart && options){
                            angular.forEach(chart, function(value, key){
                                if (key[0] === '_');
                                else if (key === 'dispatch') {
                                    if (options[key] === undefined || options[key] === null) {
                                        if (scope._config.extended) options[key] = {};
                                    }
                                    configureEvents(value, options[key]);
                                }
                                else if (key === 'tooltip') {
                                    if (options[key] === undefined || options[key] === null) {
                                        if (scope._config.extended) options[key] = {};
                                    }
                                    configure(chart[key], options[key], chartType);
                                }
                                else if (key === 'contentGenerator') {
                                    if (options[key]) chart[key](options[key]);
                                }
                                else if ([
                                        'axis',
                                        'clearHighlights',
                                        'defined',
                                        'highlightPoint',
                                        'nvPointerEventsClass',
                                        'options',
                                        'rangeBand',
                                        'rangeBands',
                                        'scatter',
                                        'open',
                                        'close'
                                    ].indexOf(key) === -1) {
                                    if (options[key] === undefined || options[key] === null){
                                        if (scope._config.extended) options[key] = value();
                                    }
                                    else chart[key](options[key]);
                                }
                            });
                        }
                    }

                    // Subscribe to the chart events (contained in 'dispatch')
                    // and pass eventHandler functions in the 'options' parameter
                    function configureEvents(dispatch, options){
                        if (dispatch && options){
                            angular.forEach(dispatch, function(value, key){
                                if (options[key] === undefined || options[key] === null){
                                    if (scope._config.extended) options[key] = value.on;
                                }
                                else dispatch.on(key + '._', options[key]);
                            });
                        }
                    }

                    // Configure 'title', 'subtitle', 'caption'.
                    // nvd3 has no sufficient models for it yet.
                    function configureWrapper(name){
                        var _ = nvd3Utils.deepExtend(defaultWrapper(name), scope.options[name] || {});

                        if (scope._config.extended) scope.options[name] = _;

                        var wrapElement = angular.element('<div></div>').html(_['html'] || '')
                            .addClass(name).addClass(_.className)
                            .removeAttr('style')
                            .css(_.css);

                        if (!_['html']) wrapElement.text(_.text);

                        if (_.enable) {
                            if (name === 'title') element.prepend(wrapElement);
                            else if (name === 'subtitle') angular.element(element[0].querySelector('.title')).after(wrapElement);
                            else if (name === 'caption') element.append(wrapElement);
                        }
                    }

                    // Add some styles to the whole directive element
                    function configureStyles(){
                        var _ = nvd3Utils.deepExtend(defaultStyles(), scope.options['styles'] || {});

                        if (scope._config.extended) scope.options['styles'] = _;

                        angular.forEach(_.classes, function(value, key){
                            value ? element.addClass(key) : element.removeClass(key);
                        });

                        element.removeAttr('style').css(_.css);
                    }

                    // Default values for 'title', 'subtitle', 'caption'
                    function defaultWrapper(_){
                        switch (_){
                            case 'title': return {
                                enable: false,
                                text: 'Write Your Title',
                                className: 'h4',
                                css: {
                                    width: scope.options.chart.width + 'px',
                                    textAlign: 'center'
                                }
                            };
                            case 'subtitle': return {
                                enable: false,
                                text: 'Write Your Subtitle',
                                css: {
                                    width: scope.options.chart.width + 'px',
                                    textAlign: 'center'
                                }
                            };
                            case 'caption': return {
                                enable: false,
                                text: 'Figure 1. Write Your Caption text.',
                                css: {
                                    width: scope.options.chart.width + 'px',
                                    textAlign: 'center'
                                }
                            };
                        }
                    }

                    // Default values for styles
                    function defaultStyles(){
                        return {
                            classes: {
                                'with-3d-shadow': true,
                                'with-transitions': true,
                                'gallery': false
                            },
                            css: {}
                        };
                    }

                    /* Event Handling */
                    // Watching on options changing
                    scope.$watch('options | json', nvd3Utils.debounce(function(newOptions){
                        if (!scope._config.disabled && scope._config.autorefresh) scope.api.refresh();
                    }, scope._config.debounce, true), scope._config.deepWatchOptions);

                    // Watching on data changing
                    scope.$watch('data | json', function(newData, oldData){
                        if (newData !== oldData && scope.chart){
                            if (!scope._config.disabled && scope._config.autorefresh) {
                                scope._config.refreshDataOnly && scope.chart.update ? scope.chart.update() : scope.api.refresh(); // if wanted to refresh data only, use chart.update method, otherwise use full refresh.
                            }
                        }
                    }, scope._config.deepWatchData);

                    // Watching on config changing
                    scope.$watch('config', function(newConfig, oldConfig){
                        if (newConfig !== oldConfig){
                            scope._config = angular.extend(defaultConfig, newConfig);
                            scope.api.refresh();
                        }
                    }, scope._config.deepWatchConfig);

                    //subscribe on global events
                    angular.forEach(scope.events, function(eventHandler, event){
                        scope.$on(event, function(e){
                            return eventHandler(e, scope);
                        });
                    });

                    // remove completely when directive is destroyed
                    element.on('$destroy', function () {
                        scope.api.clearElement();
                    });
                }
            };
        }])

        .factory('nvd3Utils', function(){
            return {
                debounce: function(func, wait, immediate) {
                    var timeout;
                    return function() {
                        var context = this, args = arguments;
                        var later = function() {
                            timeout = null;
                            if (!immediate) func.apply(context, args);
                        };
                        var callNow = immediate && !timeout;
                        clearTimeout(timeout);
                        timeout = setTimeout(later, wait);
                        if (callNow) func.apply(context, args);
                    };
                },
                deepExtend: function(dst){
                    var me = this;
                    angular.forEach(arguments, function(obj) {
                        if (obj !== dst) {
                            angular.forEach(obj, function(value, key) {
                                if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
                                    me.deepExtend(dst[key], value);
                                } else {
                                    dst[key] = value;
                                }
                            });
                        }
                    });
                    return dst;
                },
                zoom: function(scope, options) {
                    var zoom = options.chart.zoom;

                    // check if zoom enabled
                    var enabled = (typeof zoom.enabled === 'undefined' || zoom.enabled === null) ? true : zoom.enabled;
                    if (!enabled) return;

                    var xScale = scope.chart.xAxis.scale()
                        , yScale = scope.chart.yAxis.scale()
                        , xDomain = scope.chart.xDomain || xScale.domain
                        , yDomain = scope.chart.yDomain || yScale.domain
                        , x_boundary = xScale.domain().slice()
                        , y_boundary = yScale.domain().slice()

                    // initialize zoom options
                        , scale = zoom.scale || 1
                        , translate = zoom.translate || [0, 0]
                        , scaleExtent = zoom.scaleExtent || [1, 10]
                        , useFixedDomain = zoom.useFixedDomain || false
                        , useNiceScale = zoom.useNiceScale || false
                        , horizontalOff = zoom.horizontalOff || false
                        , verticalOff = zoom.verticalOff || false
                        , unzoomEventType = zoom.unzoomEventType || 'dblclick.zoom'

                    // auxiliary functions
                        , fixDomain
                        , d3zoom
                        , zoomed
                        , unzoomed
                        ;

                    // ensure nice axis
                    if (useNiceScale) {
                        xScale.nice();
                        yScale.nice();
                    }

                    // fix domain
                    fixDomain = function (domain, boundary) {
                        domain[0] = Math.min(Math.max(domain[0], boundary[0]), boundary[1] - boundary[1] / scaleExtent[1]);
                        domain[1] = Math.max(boundary[0] + boundary[1] / scaleExtent[1], Math.min(domain[1], boundary[1]));
                        return domain;
                    };

                    // zoom event handler
                    zoomed = function () {
                        if (zoom.zoomed !== undefined) {
                            var domains = zoom.zoomed(xScale.domain(), yScale.domain());
                            if (!horizontalOff) xDomain([domains.x1, domains.x2]);
                            if (!verticalOff) yDomain([domains.y1, domains.y2]);
                        } else {
                            if (!horizontalOff) xDomain(useFixedDomain ? fixDomain(xScale.domain(), x_boundary) : xScale.domain());
                            if (!verticalOff) yDomain(useFixedDomain ? fixDomain(yScale.domain(), y_boundary) : yScale.domain());
                        }
                        scope.chart.update();
                    };

                    // unzoomed event handler
                    unzoomed = function () {
                        if (zoom.unzoomed !== undefined) {
                            var domains = zoom.unzoomed(xScale.domain(), yScale.domain());
                            if (!horizontalOff) xDomain([domains.x1, domains.x2]);
                            if (!verticalOff) yDomain([domains.y1, domains.y2]);
                        } else {
                            if (!horizontalOff) xDomain(x_boundary);
                            if (!verticalOff) yDomain(y_boundary);
                        }
                        d3zoom.scale(scale).translate(translate);
                        scope.chart.update();
                    };

                    // create d3 zoom handler
                    d3zoom = d3.behavior.zoom()
                        .x(xScale)
                        .y(yScale)
                        .scaleExtent(scaleExtent)
                        .on('zoom', zoomed);

                    scope.svg.call(d3zoom);

                    d3zoom.scale(scale).translate(translate).event(scope.svg);

                    if (unzoomEventType !== 'none') scope.svg.on(unzoomEventType, unzoomed);
                }
            };
        });
})();