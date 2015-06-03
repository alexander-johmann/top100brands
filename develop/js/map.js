/******************************************
*		TOP 100 BRANDS												*
*		Alexander Johmann, 2014								*
******************************************/

var map, dataLayer, countryLayer = [], fadeout = false;

var colors = {
	technology: '#3eb9e3',
	technologyRGB: '62, 185, 227',
	telecoms: '#ff8a54',
	telecomsRGB: '255, 138, 84', 
	retail: '#a7da4d',
	retailRGB : '167, 218, 77',
	fastfood: '#ef5b63',
	fastfoodRGB: '239, 91, 99',
	softdrinks: '#63a7af',
	softdrinksRGB: '99, 167, 175',
	cars: '#ec77dc',
	carsRGB: '236, 119, 220',
	globalbanks: '#a992ed',
	globalbanksRGB: '169, 146, 237',
	luxury: '#ffec7d',
	luxuryRGB: '255, 236, 125',
	oilandgas: '#d9a162',
	oilandgasRGB: '217, 161, 98'
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
	inGraphDataFontColor: '#000',
	inGraphDataXPosition: 3,
	inGraphDataPaddingX: -7,
	inGraphDataAlign: 'right',
	inGraphDataTmpl: 'M$ <%=v3%>',
	inGraphDataFontFamily: "proxima-nova",
	inGraphDataFontSize: 12,
	scaleFontColor: '#666',
	scaleFontFamily: 'inconsolata',
	scaleFontSize: 14,
	animation: false
};

function is_touch_device() {
	return 'ontouchstart' in window // works on most browsers 
		|| 'onmsgesturechange' in window; // works on ie10
};

$(function() {

	/** Debug **/
	var debug = false;
	if (debug) $('body').addClass('debug');

	/** Touch **/
	var touch = false;
	if (is_touch_device()) {
		touch = true;
		$('body').addClass('touch');
	}

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

	/** Map Close Popup Hack**/
	var openPopupId = 0;
	L.Map = L.Map.extend({
		openPopup: function(popup) {
			//console.log(openPopupId + ", " + popup._leaflet_id);
			//if (openPopupId != popup._leaflet_id) {
				this.closePopup();
				//closePopup();
				this._popup = popup;
				//openPopupId = popup._leaflet_id;
				return this.addLayer(popup).fire('popupopen', {
					popup: this._popup
				});
			//}
		}
	});

	/** Map **/
	map = L.map('map', {
		legendControl: false,
		infoControl: false,
		//fullscreenControl: true,
		scrollWheelZoom: false,
		zoomControl: false,
		attributionControl: false,
		center: [50, -40],
		zoom: 3,
		minZoom: 2,
		maxZoom: 7,
		worldCopyJump: true,
		//closePopupOnClick: false,
		//tap: false,
		//dragging: false,
	});
	map.addLayer(new L.TileLayer('images/maptiles/{z}/{x}/{y}.png'));
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
				iconSize: [e.layer.feature.properties.Pin,e.layer.feature.properties.Pin],
				html: '<div class="markerInner">&nbsp;</div>'
			})
		);
		oms.addMarker(e.layer);
	});
	dataLayer.setGeoJSON(data);

	/** Tooltips **/
	var chartData = [];
	var chartOptions = [];
	function tooltips() {
		unBindLayerEvents();
		dataLayer.eachLayer(function(layer) {
			var brand = layer.feature.properties.Brand.replace(/ /g,'').toLowerCase();
			var category = layer.feature.properties.Category.replace(/ /g,'').toLowerCase();
			var content =
				'<div class="img"><img src="images/logos/' + brand + '.svg" alt="' + layer.feature.properties.Brand + '" /></div>' +
				'<div class="info">' +
					'<div class="left">' +
						'<div class="headline">Brand Value</div>' +
						'<div class="value">' +
							'<div class="currency">$</div>' +
							'<div class="number">' +
								'<div>' + layer.feature.properties.Value2015.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '</div>' +
								'<div class="unit">Million</div>' +
							'</div>' +
						'</div>' +
					'</div>' +
					'<div class="right">' +
						'<div class="headline">Rank \'15</div>' +
						'<div class="rank">' + layer.feature.properties.Rank2015 + '.</div>' +
					'</div>' +
				'</div>' +
				'<canvas id="chart-' + layer.feature.properties.Rank2015 + '" class="chart" width="200" height="120"></canvas';
			layer.bindPopup(content, {
				closeButton: false,
				className: category
			});
			var color = 'rgba(33,33,33,.9)';
			if (colors[category]) color = 'rgba(' + colors[category+'RGB'] + ',.9)';
			var textColor = '#FFF';
			if (category == 'luxury') textColor = '#000';
			chartOptions[layer.feature.properties.Rank2015] = {
				inGraphDataFontColor: textColor
			};
			chartData[layer.feature.properties.Rank2015] = {
				labels: ['2010','2011','2012','2013','2014','2015'],
				datasets: [{
					fillColor: color,
					strokeColor: 'rgba(0,0,0,0)',
					data: [layer.feature.properties.Value2010,layer.feature.properties.Value2011,layer.feature.properties.Value2012,layer.feature.properties.Value2013,layer.feature.properties.Value2014,layer.feature.properties.Value2015]
				}]
			};
		});
		
		bindLayerEvents();
		bindMarkerEvents();
	}

	function bindLayerEvents() {
		dataLayer.on('mouseover click', function(e) {
			var $icon = $(e.layer._icon);
			if ($icon.data('transition-status') === 'finished' || !$icon.hasClass('spiderfied')) {
				openPopup(e);
			}
		});
		dataLayer.on('mouseout', function(e) {
			//closePopup(e);
		});
	}	
	function unBindLayerEvents() {
		dataLayer.off('mouseover click');
	}

	function bindMarkerEvents() {
		$('.marker').on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
			if ($(this).data('transition-status') === 'deleted') $(this).data('transition-status', null);
			else $(this).data('transition-status', 'finished');
			return false;
		});
	}

	/** Popup **/
	function openPopup(e) {
		var popup = e.layer.openPopup();
		var $popupPane = $('.leaflet-popup-pane');		
		var $popup = $('.leaflet-popup');
		var $popupHtml = '<div class="popup-container">' + $popup.html() + '</div>';
		$popup.html($popupHtml);
		generateChart(e.layer.feature.properties.Rank2015);
	}
	function closePopup(e) {
		/*$('.leaflet-popup').addClass('popupclose');
		window.setTimeout(function(){
			$('.leaflet-popup').removeClass('popupclose');
		},200);*/
	}

	/** Tooltip Charts **/
	var ctx = [];
	var chart = [];
	function generateChart(chartnr) {
		ctx[chartnr] = $('#chart-'+chartnr).get(0).getContext("2d");
		chart[chartnr] = new Chart(ctx[chartnr]);
		$('#chart-'+chartnr)[0].width = 200;
		$('#chart-'+chartnr)[0].height = 120;
		chart[chartnr].HorizontalBar(chartData[chartnr],chartOptions[chartnr]);
	}

	/** Filter **/
	function filterDataLayer(filter) {
		$('#map').removeClass('spiderfied');
		$('.marker').removeClass('spiderfied');
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
						setHash($(this).attr('id'));
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
	function setHash (hash) {
		history.pushState(null, null, '#/'+hash);
	}

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
