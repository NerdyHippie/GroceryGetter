function logIt() {
	console.log(' /// --- ');
	for (var i in arguments) {
		console.log(arguments[i]);
	}
	console.log(' --- /// ')
}