var ggApp = angular.module('groceryGetter',['ggFilters','ggFirebaseServices','ggCordova']);

ggApp.run(['$rootScope','cordovaWrapper',function($rootScope,cordovaWrapper) {
	cordovaWrapper.bindEvents();
	$rootScope.cordovaState = cordovaWrapper.cordovaState;
}]);
//ggApp.config(function)

ggApp.controller('NavController',['$scope','ggFireAuthService',function($scope,ggFireAuthService) {
	$scope.authData = ggFireAuthService.authData;
}]);
ggApp.controller('loginController',['$scope','ggFireAuthService',function($scope,ggFireAuthService) {
	$scope.authData = ggFireAuthService.authData;

	$scope.googleLogin = ggFireAuthService.loginWithGoogle;
	$scope.logout = ggFireAuthService.logout;

	$scope.showOpts = false;


}]);
ggApp.controller('TestCtrl',['$scope','ggFireDataService',function($scope,ggFireDataService) {
	$scope.data = {
		title: 'Grocery Getter'
	};


	$scope.data.users = ggFireDataService.getUsers();



}]);

