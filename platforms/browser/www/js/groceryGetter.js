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
	$scope.lists = ggFireDataService.getLists();
	$scope.stores = ggFireDataService.getStores();

	var _newListDefault = {
		ownerId: $rootScope.authState.currentUser.id
	};
	$scope.newList = angular.copy(_newListDefault);
	$scope.addNewList = function() {
		$scope.lists.$add($scope.newList).then(function() {
			$scope.newList = angular.copy(_newListDefault);
		});
	}
}]);
ggApp.controller('listDetailController',['$scope','$rootScope','$routeParams','ggFireDataService',function($scope,$rootScope,$routeParams,ggFireDataService) {
	angular.extend($scope,$routeParams);

	ggFireDataService.getList($scope.listId).$loaded(function(data) {
		$scope.list = data;

		$scope.storeItems = ggFireDataService.getItems({storeId:data.storeId});
	});
}]);

ggApp.controller('itemListController',['$scope','$rootScope','ggFireDataService',function($scope,$rootScope,ggFireDataService) {
	$scope.items = ggFireDataService.getItems();
	$scope.stores = ggFireDataService.getStores();

	var _newItemDefault = {
		ownerId: $rootScope.authState.currentUser.id
	};
	$scope.newItem = angular.copy(_newItemDefault);
	$scope.addNewItem = function() {
		if ($scope.newItem.storeId) {
			$scope.items.$add($scope.newItem).then(function() {
				$scope.newItem = angular.copy(_newItemDefault);
			});
		}

	}
}]);
ggApp.controller('itemDetailController',['$scope','$rootScope','$routeParams','ggFireDataService',function($scope,$rootScope,$routeParams,ggFireDataService) {
	angular.extend($scope,$routeParams);
	$scope.item = ggFireDataService.getItem($scope.itemId);
}]);

ggApp.controller('storeListController',['$scope','$rootScope','ggFireDataService',function($scope,$rootScope,ggFireDataService) {
	$scope.stores = ggFireDataService.getStores();
	$scope.stores = ggFireDataService.getStores();

	var _newStoreDefault = {};

	$scope.newStore = angular.copy(_newStoreDefault);
	$scope.addNewStore = function() {
		ggFireDataService.addNewStore($scope.newStore,function() {
			$scope.newStore = angular.copy(_newStoreDefault);
		});
	}
}]);
ggApp.controller('storeDetailController',['$scope','$rootScope','$routeParams','ggFireDataService',function($scope,$rootScope,$routeParams,ggFireDataService) {
	angular.extend($scope,$routeParams);
	$scope.store = ggFireDataService.getStoreInfo($scope.storeId);
}]);
