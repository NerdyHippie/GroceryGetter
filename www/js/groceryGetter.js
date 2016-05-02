var ggApp = angular.module('groceryGetter',['ngRoute','ggFilters','ggFirebaseServices','ggCordova']);
ggApp.config(['$routeProvider',function($routeProvider) {
	$routeProvider.
		when('/home', {
			templateUrl: 'views/home.html',
			controller: 'testCtrl'
		})
		.when('/lists', {
			templateUrl: 'views/lists.html',
			controller: 'listsController'
		})
		.when('/items', {
			templateUrl: 'views/items.html',
			controller: 'itemsController'
		})
		.when('/stores', {
			templateUrl: 'views/stores.html',
			controller: 'storesController'
		})
		.otherwise({
			redirectTo: '/home'
		});
}]);
ggApp.run(['$rootScope','cordovaWrapper','ggFireAuthService',function($rootScope,cordovaWrapper,ggFireAuthService) {
	cordovaWrapper.bindEvents();
	$rootScope.cordovaState = cordovaWrapper.cordovaState;
	$rootScope.authState = ggFireAuthService.authData;
}]);

ggApp.controller('testCtrl',['$scope','ggFireDataService',function($scope,ggFireDataService) {
	$scope.data = {
		title: 'Grocery Getter'
	};


	$scope.data.users = ggFireDataService.getUsers();



}]);

ggApp.controller('navController',['$scope','ggFireAuthService',function($scope,ggFireAuthService) {
	$scope.authData = ggFireAuthService.authData;
}]);
ggApp.controller('loginController',['$scope','ggFireAuthService',function($scope,ggFireAuthService) {
	$scope.authData = ggFireAuthService.authData;

	$scope.googleLogin = ggFireAuthService.loginWithGoogle;
	$scope.logout = ggFireAuthService.logout;
}]);

ggApp.controller('listsController',['$scope','$rootScope','ggFireDataService',function($scope,$rootScope,ggFireDataService) {
	$scope.lists = ggFireDataService.getLists($rootScope.authState.currentUser.id);
}])
