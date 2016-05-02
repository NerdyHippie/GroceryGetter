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
						provider: authData.provider
						,fullName: authData.google.cachedUserProfile.name
						,firstName: authData.google.cachedUserProfile.given_name
						,lastName: authData.google.cachedUserProfile.family_name
						,thumbnail: authData.google.cachedUserProfile.picture
					};
					break;
			}

			angular.extend(userObj,newUserData);
			userObj.$save()

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
ggFire.service('ggFireDataService',['fbRootRef','$firebaseObject','$firebaseArray',function(fbRootRef,$firebaseObject,$firebaseArray) {
	var svc = {
		getUser: function(userId) {
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
	};
	return svc;
}]);

