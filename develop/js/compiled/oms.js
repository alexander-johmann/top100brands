
/** @preserve OverlappingMarkerSpiderfier
https://github.com/jawj/OverlappingMarkerSpiderfier-Leaflet
Copyright (c) 2011 - 2012 George MacKerron
Released under the MIT licence: http://opensource.org/licenses/mit-license
Note: The Leaflet maps API must be included *before* this code
 */


/*	Patched by Alexander Johmann
		 *aj
 */

(function() {
  var __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  if (this['L'] == null) {
    return;
  }

  this['OverlappingMarkerSpiderfier'] = (function() {
    var p, twoPi;

    p = _Class.prototype;

    p['VERSION'] = '0.2.6';

    twoPi = Math.PI * 2;

    p['keepSpiderfied'] = true;

    p['nearbyDistance'] = 20;

    p['circleSpiralSwitchover'] = 9;

    p['circleFootSeparation'] = 25;

    p['circleStartAngle'] = twoPi / 12;

    p['spiralFootSeparation'] = 28;

    p['spiralLengthStart'] = 11;

    p['spiralLengthFactor'] = 5;

    p['legWeight'] = 1.5;

    p['legColors'] = {
      'usual': '#222',
      'highlighted': '#f00'
    };

    function _Class(map, opts) {
      var k, v;
      this.map = map;
      if (opts == null) {
        opts = {};
      }
      for (k in opts) {
        if (!__hasProp.call(opts, k)) continue;
        v = opts[k];
        this[k] = v;
      }
      this.initMarkerArrays();
      this.listeners = {};
    }

    p.initMarkerArrays = function() {
      this.markers = [];
      return this.markerListeners = [];
    };

    p['addMarker'] = function(marker) {
      var markerListener;
      if (marker['_oms'] != null) {
        return this;
      }
      marker['_oms'] = true;
      markerListener = (function(_this) {
        return function() {
          return _this.spiderListener(marker);
        };
      })(this);
      marker.addEventListener('mouseover click', markerListener);
      this.markerListeners.push(markerListener);
      this.markers.push(marker);
      return this;
    };

    p['getMarkers'] = function() {
      return this.markers.slice(0);
    };

    p['removeMarker'] = function(marker) {
      var i, markerListener;
      if (marker['_omsData'] != null) {
        this['unspiderfy']();
      }
      i = this.arrIndexOf(this.markers, marker);
      if (i < 0) {
        return this;
      }
      markerListener = this.markerListeners.splice(i, 1)[0];
      marker.removeEventListener('click', markerListener);
      delete marker['_oms'];
      this.markers.splice(i, 1);
      return this;
    };

    p['clearMarkers'] = function() {
      var i, marker, markerListener, _i, _len, _ref;
      this['unspiderfy']();
      _ref = this.markers;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        marker = _ref[i];
        markerListener = this.markerListeners[i];
        marker.removeEventListener('click', markerListener);
        delete marker['_oms'];
      }
      this.initMarkerArrays();
      return this;
    };

    p['addListener'] = function(event, func) {
      var _base;
      ((_base = this.listeners)[event] != null ? _base[event] : _base[event] = []).push(func);
      return this;
    };

    p['removeListener'] = function(event, func) {
      var i;
      i = this.arrIndexOf(this.listeners[event], func);
      if (!(i < 0)) {
        this.listeners[event].splice(i, 1);
      }
      return this;
    };

    p['clearListeners'] = function(event) {
      this.listeners[event] = [];
      return this;
    };

    p.trigger = function() {
      var args, event, func, _i, _len, _ref, _ref1, _results;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref1 = (_ref = this.listeners[event]) != null ? _ref : [];
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        func = _ref1[_i];
        _results.push(func.apply(null, args));
      }
      return _results;
    };

    p.generatePtsCircle = function(count, centerPt) {
      var angle, angleStep, circumference, i, legLength, _i, _results;
      circumference = this['circleFootSeparation'] * (2 + count);
      legLength = circumference / twoPi;
      angleStep = twoPi / count;
      _results = [];
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        angle = this['circleStartAngle'] + i * angleStep;
        _results.push(new L.Point(centerPt.x + legLength * Math.cos(angle), centerPt.y + legLength * Math.sin(angle)));
      }
      return _results;
    };

    p.generatePtsSpiral = function(count, centerPt) {
      var angle, i, legLength, pt, _i, _results;
      legLength = this['spiralLengthStart'];
      angle = 0;
      _results = [];
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        angle += this['spiralFootSeparation'] / legLength + i * 0.0005;
        pt = new L.Point(centerPt.x + legLength * Math.cos(angle), centerPt.y + legLength * Math.sin(angle));
        legLength += twoPi * this['spiralLengthFactor'] / angle;
        _results.push(pt);
      }
      return _results;
    };

    p.spiderListener = function(marker) {
      var m, mPt, markerPt, markerSpiderfied, nearbyMarkerData, nonNearbyMarkers, pxSq, _i, _len, _ref;
      markerSpiderfied = marker['_omsData'] != null;
      if (!(markerSpiderfied && this['keepSpiderfied'])) {
        this['unspiderfy']();
      }
      if (markerSpiderfied) {
        return this.trigger('click', marker);
      } else {
        nearbyMarkerData = [];
        nonNearbyMarkers = [];
        pxSq = this['nearbyDistance'] * this['nearbyDistance'];
        markerPt = this.map.latLngToLayerPoint(marker.getLatLng());
        _ref = this.markers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          m = _ref[_i];
          if (!this.map.hasLayer(m)) {
            continue;
          }
          mPt = this.map.latLngToLayerPoint(m.getLatLng());
          if (this.ptDistanceSq(mPt, markerPt) < pxSq) {
            nearbyMarkerData.push({
              marker: m,
              markerPt: mPt
            });
          } else {
            nonNearbyMarkers.push(m);
          }
        }
        if (nearbyMarkerData.length === 1) {
          return this.trigger('click', marker);
        } else {
          return this.spiderfy(nearbyMarkerData, nonNearbyMarkers);
        }
      }
    };

    p.makeHighlightListeners = function(marker) {
      return {
        highlight: (function(_this) {
          return function() {
            return marker['_omsData'].leg.setStyle({
              color: _this['legColors']['highlighted']
            });
          };
        })(this),
        unhighlight: (function(_this) {
          return function() {
            return marker['_omsData'].leg.setStyle({
              color: _this['legColors']['usual']
            });
          };
        })(this)
      };
    };

    p.spiderfy = function(markerData, nonNearbyMarkers) {
      var bodyPt, footLl, footPt, footPts, leg, marker, md, mhl, nearestMarkerDatum, numFeet, spiderfiedMarkers;
      this.spiderfying = true;
      numFeet = markerData.length;
      bodyPt = this.ptAverage((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = markerData.length; _i < _len; _i++) {
          md = markerData[_i];
          _results.push(md.markerPt);
        }
        return _results;
      })());
      footPts = numFeet >= this['circleSpiralSwitchover'] ? this.generatePtsSpiral(numFeet, bodyPt).reverse() : this.generatePtsCircle(numFeet, bodyPt);
      spiderfiedMarkers = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = footPts.length; _i < _len; _i++) {
          footPt = footPts[_i];
          footLl = this.map.layerPointToLatLng(footPt);
          nearestMarkerDatum = this.minExtract(markerData, (function(_this) {
            return function(md) {
              return _this.ptDistanceSq(md.markerPt, footPt);
            };
          })(this));
          marker = nearestMarkerDatum.marker;
          leg = new L.Polyline([marker.getLatLng(), footLl], {
            color: this['legColors']['usual'],
            weight: this['legWeight'],
            clickable: false
          });
          this.map.addLayer(leg);
          marker['_omsData'] = {
            usualPosition: marker.getLatLng(),
            leg: leg
          };
          if (this['legColors']['highlighted'] !== this['legColors']['usual']) {
            mhl = this.makeHighlightListeners(marker);
            marker['_omsData'].highlightListeners = mhl;
            marker.addEventListener('mouseover', mhl.highlight);
            marker.addEventListener('mouseout', mhl.unhighlight);
          }
          marker.setLatLng(footLl);
          marker.setZIndexOffset(1000000);
          _results.push(marker);
        }
        return _results;
      }).call(this);
      delete this.spiderfying;
      this.spiderfied = true;
      return this.trigger('spiderfy', spiderfiedMarkers, nonNearbyMarkers);
    };

    p['unspiderfy'] = function(markerNotToMove) {
      var marker, mhl, nonNearbyMarkers, unspiderfiedMarkers, _i, _len, _ref;
      if (markerNotToMove == null) {
        markerNotToMove = null;
      }
      if (this.spiderfied == null) {
        return this;
      }
      this.unspiderfying = true;
      unspiderfiedMarkers = [];
      nonNearbyMarkers = [];
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        if (marker['_omsData'] != null) {
          this.map.removeLayer(marker['_omsData'].leg);
          if (marker !== markerNotToMove) {
            marker.setLatLng(marker['_omsData'].usualPosition);
          }
          marker.setZIndexOffset(0);
          mhl = marker['_omsData'].highlightListeners;
          if (mhl != null) {
            marker.removeEventListener('mouseover', mhl.highlight);
            marker.removeEventListener('mouseout', mhl.unhighlight);
          }
          delete marker['_omsData'];
          unspiderfiedMarkers.push(marker);
        } else {
          nonNearbyMarkers.push(marker);
        }
      }
      delete this.unspiderfying;
      delete this.spiderfied;
      this.trigger('unspiderfy', unspiderfiedMarkers, nonNearbyMarkers);
      return this;
    };

    p.ptDistanceSq = function(pt1, pt2) {
      var dx, dy;
      dx = pt1.x - pt2.x;
      dy = pt1.y - pt2.y;
      return dx * dx + dy * dy;
    };

    p.ptAverage = function(pts) {
      var numPts, pt, sumX, sumY, _i, _len;
      sumX = sumY = 0;
      for (_i = 0, _len = pts.length; _i < _len; _i++) {
        pt = pts[_i];
        sumX += pt.x;
        sumY += pt.y;
      }
      numPts = pts.length;
      return new L.Point(sumX / numPts, sumY / numPts);
    };

    p.minExtract = function(set, func) {
      var bestIndex, bestVal, index, item, val, _i, _len;
      for (index = _i = 0, _len = set.length; _i < _len; index = ++_i) {
        item = set[index];
        val = func(item);
        if ((typeof bestIndex === "undefined" || bestIndex === null) || val < bestVal) {
          bestVal = val;
          bestIndex = index;
        }
      }
      return set.splice(bestIndex, 1)[0];
    };

    p.arrIndexOf = function(arr, obj) {
      var i, o, _i, _len;
      if (arr.indexOf != null) {
        return arr.indexOf(obj);
      }
      for (i = _i = 0, _len = arr.length; _i < _len; i = ++_i) {
        o = arr[i];
        if (o === obj) {
          return i;
        }
      }
      return -1;
    };

    return _Class;

  })();

}).call(this);
