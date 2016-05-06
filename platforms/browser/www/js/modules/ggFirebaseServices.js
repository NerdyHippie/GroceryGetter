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
			svc.authData.isLoggedIn = false;
			if (svc.authData.desktopFormat) {
				window.open('https://accounts.google.com/logout');
			}
			switch(svc.authData.currentUser.provider) {
				case 'google':
					$http.get('https://accounts.google.com/logout');
					break;
			}
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
			ggFirebaseAuth.$authWithOAuthPopup('google',{remember:'sessionOnly'}).then(svc.onAuth);
		}
	};

	ggFirebaseAuth.$onAuth(svc.onAuth);

	return svc;
}]);
ggFire.service('ggFireDataService',['fbRootRef','ggFireAuthService','$firebaseObject','$firebaseArray','FirebaseUrl',function(fbRootRef,ggFireAuthService,$firebaseObject,$firebaseArray,FirebaseUrl) {
	var svc = {
		genericGetItem: function(path,itemId) {
			if (itemId) path = path +'/'+ itemId;
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
					console.log('store added',storeResponse.key());

					var storePermissions = svc.getStorePermissions(storeResponse.key());
					console.log(storePermissions);
					storePermissions[ggFireAuthService.authData.currentUser.id] = "own";
					storePermissions.$save().then(function(permResponse) {
						console.log('permissions added',permResponse);
						cb(storeResponse,permResponse);
					},ecb);
				},ecb);

			}
		}


		,getItems: function(args) {
			args = args || {};
			if (args.storeId) {

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
	};
	return svc;
}]);

