var ggApp = angular.module('groceryGetter',['ggFilters','ggFirebaseServices','ggCordova']);

ggApp.run(['cordovaWrapper',function(cordovaWrapper) {
	cordovaWrapper.bindEvents();
}]);
//ggApp.config(function)

ggApp.controller('NavController',['$scope','cordovaWrapper',function($scope,cordovaWrapper) {

}]);
ggApp.controller('TestCtrl',['$scope','ggFireAuthService','ggFireDataService','cordovaWrapper',function($scope,ggFireAuthService,ggFireDataService,cordovaWrapper) {
	$scope.data = {
		title: 'Hello World'
	};

	$scope.cw = cordovaWrapper;
	$scope.authData = ggFireAuthService.authData;

	$scope.data.users = ggFireDataService.getUsers();

	$scope.googleLogin = ggFireAuthService.loginWithGoogle
	$scope.logout = ggFireAuthService.logout;

}]);

