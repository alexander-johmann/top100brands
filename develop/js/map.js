/******************************************
*		TOP 100 BRANDS												*
*		Alexander Johmann, 2014								*
******************************************/

var map, dataLayer, countryLayer = [], fadeout = false;

var colors = {
	technology: '#3eb9e3',
	telecoms: '#ff8a54',
	retail: '#a7da4d',
	fastfood: '#ef5b63',
	softdrinks: '#63a7af',
	cars: '#ec77dc',
	globalbanks: '#a992ed',
	luxury: '#ffec7d',
	oilandgas: '#d9a162'
};

var charJSPersonalDefaultOptionsHorizontalBar = {
	graphMin: 0,
	barStrokeWidth: 0,
	barValueSpacing: 0,
	barDatasetSpacing: 1,
	scaleShowGridLines: false,
	scaleShowLine: false,
	showYAxisMin: false,
	xAxisBottom: false,
	inGraphDataShow: true,
	inGraphDataFontColor: '#FFF',
	inGraphDataXPosition: 3,
	inGraphDataPaddingX: -5,
	inGraphDataAlign: 'right',
	inGraphDataTmpl: 'M$ <%=v3%>',
	inGraphDataFontFamily: 'inconsolata',
	inGraphDataFontSize: 14,
	scaleFontColor: '#666',
	scaleFontFamily: 'inconsolata',
	scaleFontSize: 14,
};

$(function() {

	/** Debug **/
	var debug = false;
	if (debug) $('body').addClass('debug');

	/** Canvas **/
	var canvasDown = $('#down canvas')[0].getContext('2d');
	canvasDown.beginPath();
	canvasDown.moveTo(10, 10);
	canvasDown.lineTo(50, 30);
	canvasDown.lineTo(90, 10);
	canvasDown.lineWidth = 3;
	canvasDown.strokeStyle = 'rgba(255,255,255,0.9)';
	canvasDown.stroke();

	var canvasUp = $('#up canvas')[0].getContext('2d');
	canvasUp.beginPath();
	canvasUp.moveTo(5, 25);
	canvasUp.lineTo(20, 15);
	canvasUp.lineTo(35, 25);
	canvasUp.lineWidth = 2;
	canvasUp.strokeStyle = 'rgba(255,255,255,0.9)';
	canvasUp.stroke();

	var canvasPrev = $('#scrollPrev canvas')[0].getContext('2d');
	canvasPrev.beginPath();
	canvasPrev.moveTo(20, 15);
	canvasPrev.lineTo(12, 25);
	canvasPrev.lineTo(20, 35);
	canvasPrev.lineWidth = 2;
	canvasPrev.strokeStyle = 'rgba(255,255,255,0.9)';
	canvasPrev.stroke();

	var canvasNext = $('#scrollNext canvas')[0].getContext('2d');
	canvasNext.beginPath();
	canvasNext.moveTo(15, 15);
	canvasNext.lineTo(23, 25);
	canvasNext.lineTo(15, 35);
	canvasNext.lineWidth = 2;
	canvasNext.strokeStyle = 'rgba(255,255,255,0.9)';
	canvasNext.stroke();

	/** Map **/
	map = L.mapbox.map('map', 'aj82.top100brands', { // whateverworks.top100brands
		legendControl: false,
		infoControl: false,
		//fullscreenControl: true,
		scrollWheelZoom: false,
		zoomControl: false,
		attributionControl: true,
		center: [50, -40],
		zoom: 3,
		worldCopyJump: true,
		//tap: false,
		//dragging: false,
	});
	//map.fitWorld();
	map.setMaxBounds([[-180,-180], [180,180]]);
	L.control.zoom({
		position: 'topright'
	}).addTo(map);

	/** Country Layer **/
	/* function addCountry(code) {
		countryLayer[code] = L.mapbox.featureLayer().addTo(map);
		countryLayer[code].on('layeradd', function(e) {
			e.layer.setStyle({
				className: 'country',
				stroke: false,
				fill: true,
				fillOpacity: 0
			});
		});
		countryLayer[code].setGeoJSON(country[code]);
		countryLayer[code].eachLayer(function(layer) {
			var content = '<h2>' + layer.feature.properties.name + '<\/h2>';
			layer.bindPopup(content);
		});
	}
	var countries = ['US','CN','DE','GB','JP','KR','FR','ES','CA','AU','NL','NZ','IE','IT','SE','RU','IN','AT','ZA','CH'];
	$.each(countries, function(index, country) {
		addCountry(country);
	}); */

	/** Collision Detection **/
	var oms = new OverlappingMarkerSpiderfier(map);

	/** Brand Layer **/
	dataLayer = L.mapbox.featureLayer().addTo(map);

	/** Marker **/
	dataLayer.on('layeradd', function(e) {
		e.layer.setIcon(
			L.divIcon({
				className: 'marker ' + e.layer.feature.properties.Category.replace(/ /g,'').toLowerCase(),
				iconSize: [e.layer.feature.properties.Pin,e.layer.feature.properties.Pin]
			})
		);
		oms.addMarker(e.layer);
	});
	dataLayer.setGeoJSON(data);

	/** Tooltips **/
	var chartData = [];
	function tooltips() {
		dataLayer.eachLayer(function(layer) {
			var content =
				'<div class="img"><img src="images/logos/' + layer.feature.properties.Brand.replace(/ /g,'').toLowerCase() + '.svg" alt="' + layer.feature.properties.Brand + '" /></div>' +
				'<div class="info">' +
					'<div class="left">' +
						'<div class="headline">Brand Value</div>' +
						'<div class="value">' +
							'<div class="currency">$</div>' +
							'<div class="number">' +
								'<div>' + layer.feature.properties.Value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '</div>' +
								'<div class="unit">Million</div>' +
							'</div>' +
						'</div>' +
					'</div>' +
					'<div class="right">' +
						'<div class="headline">Rank \'14</div>' +
						'<div class="rank">' + layer.feature.properties.Rank + '.</div>' +
					'</div>' +
				'</div>' +
				'<canvas id="chart" width="200" height="120"></canvas';
			layer.bindPopup(content);
			chartData[layer.feature.properties.Rank] = {
				labels: ['2010','2011','2012','2013','2014'],
				datasets: [{
					fillColor: 'rgba(33,33,33,0.5)',
					strokeColor: 'rgba(0,0,0,0)',
					data: [layer.feature.properties.Value2010,layer.feature.properties.Value2011,layer.feature.properties.Value2012,layer.feature.properties.Value2013,layer.feature.properties.Value]
				}]
			};
		});
		oms.addListener('mouseover click', function(dataLayer) {
			dataLayer.layer.openPopup();
		});
		dataLayer.on('mouseover click', function(e) {
			e.layer.openPopup();
			generateChart(e.layer.feature.properties.Rank);
		});
		dataLayer.on('mouseout', function(e) {
			e.layer.closePopup();
		});
	}

	/** Tooltip Charts **/
	function generateChart(chart) {
		var ctx = $('#chart').get(0).getContext("2d");
		var chart = new Chart(ctx).HorizontalBar(chartData[chart]);
	}

	/** Filter **/
	function filterDataLayer(filter) {
		if (!fadeout) {
			fadeout = true;
			$('.marker').addClass('fadeout');
			window.setTimeout(setFilter,200);
		}
		function setFilter () {
			fadeout = false;
			dataLayer.setFilter(function(feature) {
				if (!filter || filter == 'false') return false;
				if (filter == 'All') return true;
				return feature.properties.Category === filter;
			});
			tooltips();
		}
	}
	filterDataLayer();

	/** Scrolling **/
	var box = $('#content section'), boxDone = [false,false,false,false,false,false,false,false,false,false,false], navElem = $('#nav li'), filterDone = false;
	var scroll = skrollr.init({
		forceHeight: true,
		smoothScrolling: true,
		render: function() {
			box.each(function(index) {
				if ($(this).hasClass('skrollable-between')) {
					var navItem = $('#nav li:eq(' + index + ')');
					if (target && target != navItem.text()) return;
					if (target && target == navItem.text()) target = false;
					filterDone = false;
					if (!boxDone[index]) {
						$('svg.leaflet-zoom-animated path').css('stroke','transparent');
						navElem.removeClass('active');
						navItem.addClass('active');
						filterDataLayer(navItem.text());
						boxDone[index] = true;
					}
				} else if (boxDone[index]) {
					boxDone[index] = false;
				}
			});
			var activeFilter = $('section.skrollable-between');
			if (activeFilter.length == 0 && !filterDone) {
				navElem.removeClass('active');
				filterDataLayer();
				filterDone = true;
			}
		},
		mobileCheck: function() {
			return false;
		}
	});

	/** Hash Navigation **/
	var pageReady = false;
	var target;
	skrollr.menu.init(scroll, {
    animate: true,
    easing: 'linear',
    scale: 1,
    duration: function(currentTop, targetTop) {
    	return 500;
    	/* if (currentTop > targetTop) return (currentTop-targetTop)/4;
    	else return (targetTop-currentTop)/4; */
    },
    handleLink: function(link) {
			if (pageReady) {
				target = $(link).text();
				return $(link).data('scroll');
			}
			return false;
    }
	});
	Pace.on('done', function() {
		pageReady = true;
		if (hash = (window.location.hash).substr(2)) {
			target = $('#'+hash).text();
			scroll.animateTo($('#'+hash).data('scroll'));
		}
	});

	/** Navigation Scroller **/
	var navScroller = $('#navBar');
	var navScrollerElem = $('#navBar ul');
	var scrollPrev = $('#scrollPrev');
	var scrollNext = $('#scrollNext');
	var posLeft, posRight, posLeftOk = false, posRightOk = false;
	function checkNavScroller() {
		posLeft = navScrollerElem.position().left;
		if (posLeft < 0 && !posLeftOk) {
			scrollPrev.addClass('active');
			registerNavScroller(scrollPrev, 'prev');
			posLeftOk = true;
		} else if (posLeft >= 0) {
			scrollPrev.removeClass('active');
			posLeftOk = false;
		}
		posRight = (posLeft - navScroller.width()) + navScrollerElem.width();
		if (posRight > 0 && !posRightOk) {
			scrollNext.addClass('active');
			registerNavScroller(scrollNext, 'next');
			posRightOk = true;
		} else if (posRight <= 0) {
			scrollNext.removeClass('active');
			posRightOk = false;
		}
	}
	navScroller.on('scroll', function() {
		checkNavScroller();
	});
	$(window).on('resize', function(){
		checkNavScroller();
	});
	checkNavScroller();
	function clickNavScroller(direction) {
		if (direction == 'prev') {
			navScroller.animate({
				scrollLeft: -(posLeft+150)
			}, 300);
		}
		else if (direction == 'next') {
			navScroller.animate({
				scrollLeft: -(posLeft-150)
			}, 300);
		}
	}
	function registerNavScroller(elem, direction) {
		elem.on('click', function() {
			clickNavScroller(direction);
		});
	}

});
