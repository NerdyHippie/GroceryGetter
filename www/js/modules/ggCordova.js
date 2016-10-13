var ggCordova = angular.module('ggCordova',[]);


ggCordova.service('cordovaWrapper',['cordovaReady',function(cordovaReady) {
	var svc = {
		cordovaState: {
			deviceReady: false
			,loaded: false
			,desktopFormat: false
		}
		// Bind Event Listeners
		//
		// Bind any events that are required on startup. Common events are:
		// 'load', 'deviceready', 'offline', and 'online'.
		,bindEvents: function() {
			var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
			if ( app ) {
				svc.sniffPlatform();
			} else {
				svc.cordovaState.deviceReady = true;
				svc.cordovaState.desktopFormat = true;
				svc.cordovaState.deviceInfo = {
					available: false
					,platform: "browser"
					,uuid: null
				}
			}
			document.addEventListener('deviceready', svc.onDeviceReady, false);
		}
		// deviceready Event Handler
		//
		// The scope of 'this' is the event. In order to call the 'receivedEvent'
		// function, we must explicitly call 'app.receivedEvent(...);'
		,onDeviceReady: function() {
			console.log('firing cordovaWrapper.onDeviceReady');
			//console.log(this);
			svc.cordovaState.deviceReady = true;
			svc.cordovaState.deviceInfo = device;

			svc.receivedEvent('deviceready');

		}
		,onLoad: function() {
			//console.log('loaded!',arguments);
			svc.cordovaState.loaded = true;
		}
		// Update DOM on a Received Event
		,receivedEvent: function(id) {
			var parentElement = document.getElementById(id);
			var listeningElement = parentElement.querySelector('.listening');
			var receivedElement = parentElement.querySelector('.received');

			listeningElement.setAttribute('style', 'display:none;');
			receivedElement.setAttribute('style', 'display:block;');

			//console.log('Received Event: ' + id);
		}
		,sniffPlatform: function() {

		}
		,getConnectionType: cordovaReady(function() {
			var ret = 'unknown';

			if (!navigator.connection) {
				//console.log('Connection: Browser');
				ret = 'browser';
			} else {
				var networkState = navigator.connection.type;

				switch(networkState) {
					case Connection.UNKNOWN: 	ret = 'unknownConnection'; break;
					case Connection.ETHERNET: 	ret = 'ethernet'; break;
					case Connection.WIFI: 		ret = 'wifi'; break;
					case Connection.CELL_2G: 	ret = 'cell2g'; break;
					case Connection.CELL_3G: 	ret = 'cell3g'; break;
					case Connection.CELL_4G: 	ret = 'cell4g'; break;
					case Connection.CELL: 		ret = 'cellGeneric'; break;
					case Connection.NONE: 		ret = 'none'; break;
					case 'desktop': 			ret = 'desktop'; break;
				}
			}

			return ret;
		})
	};
	return svc;
}]);


ggCordova.factory('cordovaReady', [function() {
	return function (fn) {

		var queue = [];

		var impl = function () {
			queue.push(Array.prototype.slice.call(arguments));
		};

		document.addEventListener('deviceready', function () {
			queue.forEach(function (args) {
				fn.apply(this, args);
			});
			impl = fn;
		}, false);

		return function () {
			return impl.apply(this, arguments);
		};
	};
}]);
