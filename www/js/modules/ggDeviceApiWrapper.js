var ggDevice = angular.module('ggDeviceApiWrapper',['ggCordova']);

ggDevice.factory('geolocation',['$rootScope','cordovaReady',function($rootScope, cordovaReady) {
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
ggDevice.factory('accelerometer',['$rootScope','cordovaReady',function($rootScope, cordovaReady) {
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