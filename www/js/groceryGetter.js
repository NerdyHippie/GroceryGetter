var ggApp = angular.module('groceryGetter',['ggFilters','ggFirebaseServices','ggCordova']);

ggApp.run(['cordovaWrapper',function(cordovaWrapper) {
	cordovaWrapper.bindEvents();
}]);
//ggApp.config(function)

ggApp.controller('NavController',['$scope','cordovaWrapper',function($scope,cordovaWrapper) {

}]);
ggApp.controller('TestCtrl',['$scope','ggFireDataService','cordovaWrapper',function($scope,ggFireDataService,cordovaWrapper) {
	$scope.data = {
		title: 'Hello World'
	};

	$scope.cw = cordovaWrapper;



}]);

