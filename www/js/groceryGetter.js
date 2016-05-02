var ggApp = angular.module('groceryGetter',['ngRoute','ggFilters','ggFirebaseServices','ggCordova']);
ggApp.config(['$routeProvider',function($routeProvider) {
	$routeProvider.
		when('/home', {
			templateUrl: 'views/home.html',
			controller: 'testCtrl'
		})
		.when('/lists', {
			templateUrl: 'views/listList.html',
			controller: 'listListController'
		})
		.when('/lists/:listId', {
			templateUrl: 'views/listDetail.html',
			controller: 'listDetailController'
		})
		.when('/items', {
			templateUrl: 'views/itemList.html',
			controller: 'itemListController'
		})
		.when('/items/:itemId', {
			templateUrl: 'views/itemDetail.html',
			controller: 'itemDetailController'
		})
		.when('/stores', {
			templateUrl: 'views/storeList.html',
			controller: 'storeListController'
		})
		.when('/stores/:storeId', {
			templateUrl: 'views/storeDetail.html',
			controller: 'storeDetailController'
		})
		.otherwise({
			redirectTo: '/home'
		});
}]);
ggApp.run(['$rootScope','cordovaWrapper','ggFireAuthService',function($rootScope,cordovaWrapper,ggFireAuthService) {
	cordovaWrapper.bindEvents();
	$rootScope.cordovaState = cordovaWrapper.cordovaState;
	$rootScope.authState = ggFireAuthService.authData;
	$rootScope.authState.desktopFormat = $rootScope.cordovaState.desktopFormat;
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

ggApp.controller('listListController',['$scope','$rootScope','ggFireDataService',function($scope,$rootScope,ggFireDataService) {
	$scope.lists = ggFireDataService.getLists($rootScope.authState.currentUser.id);
}]);
ggApp.controller('listDetailController',['$scope','$rootScope','$routeParams','ggFireDataService',function($scope,$rootScope,$routeParams,ggFireDataService) {
	$scope.list = ggFireDataService.getList($scope.listId);
}]);

ggApp.controller('itemListController',['$scope','$rootScope','ggFireDataService',function($scope,$rootScope,ggFireDataService) {
	$scope.items = ggFireDataService.getItems($rootScope.authState.currentUser.id);
}]);
ggApp.controller('itemDetailController',['$scope','$rootScope','$routeParams','ggFireDataService',function($scope,$rootScope,$routeParams,ggFireDataService) {
	$scope.item = ggFireDataService.getItem($scope.itemId);
}]);

ggApp.controller('storeListController',['$scope','$rootScope','ggFireDataService',function($scope,$rootScope,ggFireDataService) {
	$scope.stores = ggFireDataService.getStores($rootScope.authState.currentUser.id);
	var _newStoreDefault = {
		ownerId: $rootScope.authState.currentUser.id
	};
	$scope.newStore = angular.copy(_newStoreDefault);
	$scope.addNewStore = function() {
		$scope.stores.$add($scope.newStore).then(function() {
			$scope.newStore = angular.copy(_newStoreDefault);
		});
	}
}]);
ggApp.controller('storeDetailController',['$scope','$rootScope','$routeParams','ggFireDataService',function($scope,$rootScope,$routeParams,ggFireDataService) {
	angular.extend($scope,$routeParams);
	$scope.store = ggFireDataService.getStore($scope.storeId);
}]);
