/*	
		2014-05-26	Country Layer OK, Filter OK, Skrollr OK
		2014-05-27	Navigation OK, Transitions OK, Tooltip OK
		2014-05-28	Logos OK
		2014-05-29	Info OK
		2014-05-31	Navigation Jump OK, Mobile OK, Touch OK, Firefox OK
		2014-06-01	Colors OK, Social Sharing OK
		2014-06-13	Marker Collision, Page Loading OK, A Logo OK
		2014-06-14	Design Tweaks
		2014-06-15	Design Tweaks, Hash Navigation OK
		2014-06-16	Navigation Jump Filter Fix


		
		Day/Night Border
		Category-Top5
		Vergleich mit letzten Jahren
		Map Attribution, Tracking
		Publish
*/
/*	Feature-Ideen:
		* Markenvergleich
		* Links zu Herstellerseiten, Wikipedia-Artikel
		* Country Sidebar
*/
/*	Neue SVG Logos nötig von:
		* chinalife
		* mtn
		* mts
		* colgate
*/

/******************************************
*		TOP 100 BRANDS												*
*		Alexander Johmann, 2014								*
******************************************/

var map, dataLayer, countryLayer = [], fadeout = false;

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
	map = L.mapbox.map('map', '', { // whateverworks.top100brands
		legendControl: false,
		infoControl: false,
		//fullscreenControl: true,
		scrollWheelZoom: false,
		zoomControl: true,
		attributionControl: true,
		center: [35, -20],
		zoom: 3,
		worldCopyJump: true,
		//tap: false,
		//dragging: false,
	});
	//map.fitWorld();
	map.setMaxBounds([[-180,-180], [180,180]]);

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
				'</div>';
			//layer.bindPopup(content);
		});

		oms.addListener('mouseover', function(dataLayer) {
			//console.log('mo');
			//dataLayer.layer.openPopup();
		});

		/*
		oms.addListener('click', function(marker) {
		  popup.setContent(marker.desc);
		  popup.setLatLng(marker.getLatLng());
		  map.openPopup(popup);
		});
		*/

		/* dataLayer.on('mouseover', function(e) {
		});
		/* dataLayer.on('mouseout', function(e) {
			e.layer.closePopup();
		});*/
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
				if (!filter || filter == 'false') {
					console.log("FALSE!!!");
					return false;
				}
				if (filter == 'All') return true;
				if (target && target != filter) {
					console.log(target +"!="+ filter);
					return false;
				}
				if (target && target == filter) {
					console.log(target +"=="+ filter);
					target = false;
				}
				return feature.properties.Category === filter;
			});
			tooltips();
		}
	}
	filterDataLayer();

	/** Scrolling **/
	var box = $('#content section'), boxDone = [false,false,false,false,false,false,false,false,false], navElem = $('#nav li'), filterDone = false;
	var scroll = skrollr.init({
		forceHeight: true,
		smoothScrolling: true,
		render: function() {
			box.each(function(index) {
				if ($(this).hasClass('skrollable-between')) {
					filterDone = false;
					if (!boxDone[index]) {
						navElem.removeClass('active');
						var navItem = $('#nav li:eq(' + index + ')');
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
    	if (currentTop > targetTop) return (currentTop-targetTop)/4;
    	else return (targetTop-currentTop)/4;
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
