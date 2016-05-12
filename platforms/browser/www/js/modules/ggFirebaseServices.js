var ggFire = angular.module('ggFirebaseServices',['firebase'])
	.constant('FirebaseUrl','https://grocery-getter.firebaseio.com')
	.service('fbRootRef',['FirebaseUrl',Firebase]);

ggFire.factory('ggFirebaseAuth', ['fbRootRef','$firebaseAuth',function(fbRootRef, $firebaseAuth) {
	return $firebaseAuth(fbRootRef);
}]);

ggFire.service('ggFireAuthService',['$http','ggFirebaseAuth','fbRootRef','$firebaseObject',function($http,ggFirebaseAuth,fbRootRef,$firebaseObject) {
	var svc = {
		authData: {
			isLoggedIn: false
			,firebaseIsConnected: false
			,currentUser: {}
		}
		,logout: function() {
			ggFirebaseAuth.$unauth();
		}
		,setLoggedIn: function(authData) {
			svc.authData.isLoggedIn = true;
			svc.authData.currentUser = svc.setUserData(authData);
			//console.log(svc);
		}
		,setLoggedOut: function() {
			if (svc.authData.isLoggedIn) {
				if (svc.authData.desktopFormat) {
					if (confirm("Do you want to log out of your Google Account as well? (Do this to switch users)")) {
						//console.log('open logout window');
						window.open('https://accounts.google.com/logout');
					}
				}
				switch(svc.authData.currentUser.provider) {
					case 'google':
						$http.get('https://accounts.google.com/logout');
						break;
				}
			}
			svc.authData.isLoggedIn = false;
			svc.authData.currentUser = {};
		}
		,setUserData: function(authData) {
			var userObj = $firebaseObject(fbRootRef.child('users').child(authData.uid));
			var newUserData;

			switch(authData.provider) {
				case 'google':
					newUserData = {
						id: authData.uid
						,provider: authData.provider
						,fullName: authData.google.cachedUserProfile.name
						,firstName: authData.google.cachedUserProfile.given_name
						,lastName: authData.google.cachedUserProfile.family_name
						,thumbnail: authData.google.cachedUserProfile.picture
					};
					break;
			}

			angular.extend(userObj,newUserData);
			userObj.$save();

			return userObj;
		}
		,onAuth: function(authData) {
			if (!svc.authData.firebaseIsConnected) svc.authData.firebaseIsConnected = true;

			if (authData) {
				svc.setLoggedIn(authData);
			} else {
				svc.setLoggedOut();
			}
		}
		,loginWithGoogle: function() {
			ggFirebaseAuth.$authWithOAuthPopup('google').then(svc.onAuth);
			//,{remember:'sessionOnly'}
		}
	};

	ggFirebaseAuth.$onAuth(svc.onAuth);

	return svc;
}]);
ggFire.service('ggFireDataService',['fbRootRef','ggFireAuthService','$firebaseObject','$firebaseArray','FirebaseUrl',function(fbRootRef,ggFireAuthService,$firebaseObject,$firebaseArray,FirebaseUrl) {
	var svc = {
		genericGetItem: function(path,itemId) {
			if (itemId) path = path +'/'+ itemId;
			//console.log(path);
			return new $firebaseObject(fbRootRef.child(path));
		}
		,genericGetList: function(path) {
			return new $firebaseArray(fbRootRef.child(path));
		}
		,getUser: function(userId) {
			var userObj = $firebaseObject.$extend({
				$$defaults: {
					firstName: ''
					,lastName: ''
					,email: ''
				}
				,getFullName: function() {
					logIt('this from Users.getFullName()',this, this.firstName + ' ' + this.lastName);
					return this.firstName + ' ' + this.lastName
				}
			});

			return new userObj(fbRootRef.child('users').child(userId));
		}
		,getUsers: function() {
			return new $firebaseArray(fbRootRef.child('users'));
		}
		,getStores: function() {
			var fb = new Firebase(FirebaseUrl);
			var norm = new Firebase.util.NormalizedCollection(
				fb.child('stores')
				,fb.child('storePermissions')
			);

			norm.select('stores.name','stores.description','storePermissions.users');

			return new $firebaseArray(norm.ref());
		}
		,getStoreInfo: function(storeId) {
			//console.log('store id',storeId);
			return svc.genericGetItem('stores',storeId);
		}
		,getStoreUsers: function(storeId) {
			return svc.genericGetItem('storePermissions',storeId);
		}
		,getStorePermissions: function(storeId) {
			return new $firebaseObject(fbRootRef.child('storePermissions').child(storeId).child('users'));
		}
		,addNewStore: function(storeData,cb,ecb) {
			cb = cb || angular.noop;
			ecb = ecb || angular.noop;

			if (storeData) {
				var stores = svc.genericGetList('stores');

				stores.$add(storeData).then(function(storeResponse) {
					//console.log('store added',storeResponse.key());

					var storePermissions = svc.getStorePermissions(storeResponse.key());
					//console.log(storePermissions);
					storePermissions[ggFireAuthService.authData.currentUser.id] = "own";
					storePermissions.$save().then(function(permResponse) {
						//console.log('permissions added',permResponse);
						cb(storeResponse,permResponse);
					},ecb);
				},ecb);

			}
		}


		,getItems: function(args) {
			args = args || {};
			if (args.storeId) {
				var fb = new Firebase(FirebaseUrl);
				var norm = new Firebase.util.NormalizedCollection(
					[fb.child('stores').child(args.storeId).child('items'),'storeItems']
					,fb.child('items')
				);

				norm.select('items.name','items.qtyType');

				return new $firebaseArray(norm.ref());
				//return new $firebaseArray(fbRootRef.child('stores').child(args.storeId).child('items'))
			} else {
				return new $firebaseArray(fbRootRef.child('items'));
			}

		}
		,getItem: function(itemId) {
			return new $firebaseObject(fbRootRef.child('items').child(itemId));
		}



		,getLists: function() {
			return new $firebaseArray(fbRootRef.child('lists'));
		}
		,getList: function(listId) {
			return new $firebaseObject(fbRootRef.child('lists').child(listId));
		}
		,getQtyInfo: function(qtyId) {
			if (qtyId) {
				return new $firebaseObject(fbRootRef.child('qtyTypes').child(qtyId));
			} else {
				return new $firebaseArray(fbRootRef.child('qtyTypes'));
			}
		}
	};
	return svc;
}]);

