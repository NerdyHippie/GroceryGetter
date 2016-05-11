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
		.when('/qtyTypes', {
			templateUrl: 'views/qtyTypeList.html',
			controller: 'qtyTypeListController'
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
ggApp.controller('listDisplayController',['$scope','ggFireDataService',function($scope,ggFireDataService) {
	$scope.list = ggFireDataService.getList($scope.listData.$id);
	console.log('storeId',$scope.listData.store);
	$scope.storeInfo = ggFireDataService.getStoreInfo($scope.listData.store);
	$scope.storeItems = ggFireDataService.getItems({storeId:$scope.listData.store});

	$scope.toggleListShow = function() {
		$scope.listShow = !$scope.listShow;
	};

	var _newItemDefault = {};
	$scope.newItem = angular.copy(_newItemDefault);

	$scope.addItemToList = function() {
		if ($scope.newItem.itemId && $scope.newItem.qty) {
			if (!$scope.list.items) $scope.list.items = {};
			var qty = $scope.newItem.qty || null;
			$scope.list.items[$scope.newItem.itemId] = qty;
			$scope.list.$save();
			$scope.newItem = angular.copy(_newItemDefault);
		}

	}
}]);
ggApp.directive('listDisplay',[function() {
	return {
		restrict: 'EA'
		,scope: {
			listData: '=listDisplay'
		}
		,controller: 'listDisplayController'
		,templateUrl: 'directiveTemplates/listDisplay.html'
	}
}]);
ggApp.controller('listItemDisplayController',['$scope','ggFireDataService',function($scope,ggFireDataService) {

	ggFireDataService.getItem($scope.itemId).$loaded(function(data) {
		$scope.item = data;
		$scope.qtyInfo = ggFireDataService.getQtyInfo(data.qtyType);

		//$scope.storeItems = ggFireDataService.getItems({storeId:data.storeId});
	});

	$scope.qtyType = function() {
		if ($scope.qtyInfo && $scope.qtyInfo.$value) {
			var typeArray = $scope.qtyInfo.$value.split('|');
			if ($scope.qty > 1) {
				return typeArray[1];
			} else {
				return typeArray[0];
			}
		}
	}
}]);
ggApp.directive('listItemDisplay',[function() {
	return {
		restrict: 'EA'
		,scope: {
			itemId: '='
			,qty: '='
		}
		,controller: 'listItemDisplayController'
		,templateUrl: 'directiveTemplates/listItemDisplay.html'
	}
}]);

ggApp.controller('qtyTypeListController',['$scope','$rootScope','ggFireDataService',function($scope,$rootScope,ggFireDataService) {
	$scope.types = ggFireDataService.getQtyInfo();

	$scope.newItem = "";
	$scope.addNewItem = function() {
		$scope.types.$add($scope.newItem).then(function() {
			$scope.newItem = "";
		});
	}
}]);
ggApp.controller('qtyTypeSelectController',['$scope','ggFireDataService',function($scope,ggFireDataService) {
	$scope.qtypes = ggFireDataService.getQtyInfo();

	$scope.parseQtyType = function(type) {
		var names = type.split('|');
		return names[0] + '/' + names[1];
	};
}]);

ggApp.controller('itemListController',['$scope','$rootScope','ggFireDataService',function($scope,$rootScope,ggFireDataService) {
	$scope.items = ggFireDataService.getItems();
	$scope.stores = ggFireDataService.getStores();

	var _newItemDefault = {
		ownerId: $rootScope.authState.currentUser.id
	};
	$scope.newItem = angular.copy(_newItemDefault);
	$scope.addNewItem = function() {
		if ($scope.newItem.stores) {
			$scope.items.$add($scope.newItem).then(function(ref) {
				console.log('newItem added',ref);
				for (var i in $scope.newItem.stores) {
					var storeId = $scope.newItem.stores[i];
					ggFireDataService.getStoreInfo(storeId).$loaded(function(data) {
						var store = data;
						if (!store.items) store.items = {};
						store.items[ref.key()] = 0;
						store.$save()
					})
				}
				$scope.newItem = angular.copy(_newItemDefault);
			});
		}

	}
}]);
ggApp.controller('itemListInlineEditController',['$scope','ggFireDataService',function($scope,ggFireDataService) {
	$scope.stores = ggFireDataService.getStores();

	function __addRemoveStores(storeId,itemId,addItem) {
		var itemVal = null;
		if (addItem) itemVal = 0;

		ggFireDataService.getStoreInfo(storeId).$loaded(function(data) {
			var store = data;

			if (!store.items) store.items = {};
			store.items[itemId] = itemVal;

			store.$save();
		});
	}

	$scope.saveItem = function() {
		$scope.parentList.$save($scope.item).then(function() {
			if (!$scope.backupCopy.stores) $scope.backupCopy.stores = [];
			if ($scope.item.stores != $scope.backupCopy.stores) {
				var storesAdded = [];
				var storesRemoved = [];
				if ($scope.item.stores) {
					storesAdded = angular.copy($scope.item.stores).filter(function(val) {
						return $scope.backupCopy.stores.indexOf(val) == -1;
					});
				}
				if ($scope.backupCopy.stores) {
					storesRemoved = angular.copy($scope.backupCopy.stores).filter(function(val) {
						return $scope.item.stores.indexOf(val) == -1;
					});
				}

				console.log(storesAdded,storesRemoved);

				for (var a in storesAdded) {
					var addStoreId = storesAdded[a];
					__addRemoveStores(addStoreId,$scope.item.$id,true);
				}

				for (var r in storesRemoved) {
					var remStoreId = storesRemoved[r];
					__addRemoveStores(remStoreId,$scope.item.$id,false);
				}

			}
			$scope.cancelEdit(true);
		},errorCB);
	};

	$scope.$watch(function() {
		return $scope.item.qtyType;
	},function(newVal,oldVal) {
		$scope.showNewQtype = !newVal;
	});

	$scope.cancelEdit = function(doNotRestore) {
		if (!doNotRestore) $scope.item = angular.copy($scope.backupCopy);
		$scope.editMode = false;
		delete $scope.backupCopy;

		$scope.singleQty = '';
		$scope.multiQty = '';
	};

	$scope.toggleEdit = function() {
		$scope.editMode = !$scope.editMode;
		$scope.backupCopy = angular.copy($scope.item);

		// TODO get qty types here
		$scope.singleQty = "singleName";
		$scope.multiQty = "multiName";
	};
	$scope.toggleShowStores = function() {
		$scope.showStores = !$scope.showStores;
	};
}]);
ggApp.directive('itemListInlineEdit',[function() {
	return {
		restrict: 'EA'
		,scope: {
			item: '=itemListInlineEdit'
			,parentList: '='
		}
		,controller: 'itemListInlineEditController'
		,templateUrl: 'directiveTemplates/itemListInlineEdit.html'
	}
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


function errorCB(error) {
	alert('an error occurred');
	console.error(error)
}