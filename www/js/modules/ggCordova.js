var ggCordova = angular.module('ggCordova',[]);


ggCordova.service('cordovaWrapper',[function() {
	var svc = {
		state: {
			deviceReady: false
			,loaded: false
		}
		// Bind Event Listeners
		//
		// Bind any events that are required on startup. Common events are:
		// 'load', 'deviceready', 'offline', and 'online'.
		,bindEvents: function() {
			document.addEventListener('deviceready', svc.onDeviceReady, false);
		}
		// deviceready Event Handler
		//
		// The scope of 'this' is the event. In order to call the 'receivedEvent'
		// function, we must explicitly call 'app.receivedEvent(...);'
		,onDeviceReady: function() {
			console.log('firing cordovaWrapper.onDeviceReady',this);
			svc.state.deviceReady = true;
			svc.receivedEvent('deviceready');

		}
		,onLoad: function() {
			console.log('loaded!',arguments);
			svc.state.loaded = true;
		}
		// Update DOM on a Received Event
		,receivedEvent: function(id) {
			var parentElement = document.getElementById(id);
			var listeningElement = parentElement.querySelector('.listening');
			var receivedElement = parentElement.querySelector('.received');

			listeningElement.setAttribute('style', 'display:none;');
			receivedElement.setAttribute('style', 'display:block;');

			console.log('Received Event: ' + id);
		}
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
