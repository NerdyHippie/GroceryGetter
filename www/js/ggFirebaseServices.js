var ggFire = angular.module('ggFirebaseServices',['firebase']);
var firebaseRef = new Firebase("https://grocerygetter.firebaseio.com");

ggFire.service('ggFireAuthService',[function() {
	var svc = {

	};
	return svc;
}]);
ggFire.service('ggFireDataService',['$firebaseObject','$firebaseArray',function($firebaseObject,$firebaseArray) {
	var svc = {
		getUser: function(userId) {
			if (userId) {
				var userObj = $firebaseObject.$extend({
					$$defaults: {
						firstName: ''
						,lastName: ''
						,email: ''
					}
					,getFullName: function() {
						console.log('this from Users.getFullName()',this, this.firstName + ' ' + this.lastName);
						return this.firstName + ' ' + this.lastName
					}
				});

				return new userObj(firebaseRef.child('users').child(userId));
			} else {
				return new $firebaseArray(firebaseRef.child('users'));
			}

		}
	};
	return svc;
}]);