var nhm = angular.module('nhMobile',[]);

nhm.run(['cordovaWrapper',function(cordovaWrapper) {
	cordovaWrapper.bindEvents();
}]);
//ggApp.config(function)

nhm.controller('NavController',['$scope','cordovaWrapper',function($scope,cordovaWrapper) {

}]);
nhm.controller('TestCtrl',['$scope','$http','geolocation','cordovaReady','cordovaWrapper',function($scope,$http,geolocation,cordovaReady,cordovaWrapper) {
	$scope.data = {
		title: 'Hello World'
	};

	$scope.testIt = function() {
		console.log('firing testIt');
		geolocation.getCurrentPosition(function() {
			console.log('back as success',arguments);
		},function() {
			console.log('back as error',arguments);
		})
	};

	$scope.parsePosition = function (position) {
		console.log('parse position ',position);
		$scope.data.posData = ('Latitude: '              + position.coords.latitude          + '<br>' +
			'Longitude: '             + position.coords.longitude         + '<br>' +
			'Altitude: '              + position.coords.altitude          + '<br>' +
			'Accuracy: '              + position.coords.accuracy          + '<br>' +
			'Altitude Accuracy: '     + position.coords.altitudeAccuracy  + '<br>' +
			'Heading: '               + position.coords.heading           + '<br>' +
			'Speed: '                 + position.coords.speed             + '<br>' +
			'Timestamp: '             + position.timestamp                + '<br>');
	};

	$scope.checkCon = function() {
		console.log('firing checkCon');
		cordovaReady(checkConnection());
	};

	$scope.cw = cordovaWrapper;

	$scope.getHttp = function() {
		$scope.data.gettingHttp = true;
		$http({
			method: 'GET'
			,url: 'http://192.168.1.5:83/api/actorData.cfc?method=getCurrentUser'
			,headers: {
				'Client-Application': 'mobileApp'
				,'Authorization': 'jorvis'
			}
		}).then(function(resp) {
			$scope.data.gettingHttp = false;
			console.log('success',resp);
			$scope.data.httpData = resp.data;
		},function(resp) {
			$scope.data.gettingHttp = false;
			console.log('fail',resp);
			$scope.data.httpData = resp.data;
		})
	}

}]);

nhm.service('cordovaWrapper',[function() {
	var svc = {
		deviceReady: false
		,loaded: false
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
			svc.deviceReady = true;
			svc.receivedEvent('deviceready');

		}
		,onLoad: function() {
			console.log('loaded!',arguments);
			svc.loaded = true;
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
}])

nhm.factory('geolocation',['$rootScope','cordovaReady',function($rootScope, cordovaReady) {
	return {
		xxx_getCurrentPos: function (onSuccess, onError, options) {
			navigator.geolocation.getCurrentPosition(function () {
					var that = this,
						args = arguments;

					if (onSuccess) {
						$rootScope.$apply(function () {
							onSuccess.apply(that, args);
						});
					}
				}, function () {
					var that = this,
						args = arguments;

					if (onError) {
						$rootScope.$apply(function () {
							onError.apply(that, args);
						});
					}
				},
				options);
		}
		,getCurrentPosition: cordovaReady(function (onSuccess, onError, options) {
			console.log('firing gcp');
			navigator.geolocation.getCurrentPosition(function(resp) {
				console.log('Success??',resp);
			});
		})
	};
}]);
nhm.factory('accelerometer',['$rootScope','cordovaReady',function($rootScope, cordovaReady) {
	return {
		getCurrentAcceleration: cordovaReady(function (onSuccess, onError) {
			navigator.accelerometer.getCurrentAcceleration(function () {
				var that = this,
					args = arguments;

				if (onSuccess) {
					$rootScope.$apply(function () {
						onSuccess.apply(that, args);
					});
				}
			}, function () {
				var that = this,
					args = arguments;

				if (onError) {
					$rootScope.$apply(function () {
						onError.apply(that, args);
					});
				}
			});
		})
	};
}]);

nhm.factory('cordovaReady', [function() {
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

nhm.filter('jsonFull', [function () {
	return function (object) {
		return JSON.stringify(object, function (key, value) {
			return value;
		}, '  ');
	};
}]);
nhm.filter('renderHTML', ['$sce', function($sce){
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);