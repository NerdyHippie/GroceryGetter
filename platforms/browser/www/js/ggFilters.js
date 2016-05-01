var ggFilters = angular.module('ggFilters',[]);

ggFilters.filter('jsonFull', [function () {
	return function (object) {
		return JSON.stringify(object, function (key, value) {
			return value;
		}, '  ');
	};
}]);
ggFilters.filter('renderHTML', ['$sce', function($sce){
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);