// Set the package path
$.path.set('packages/');

// Define the main package
$('main', {
	require: ['module'],
	package: function(pkg) {
		console.log(module.string);
		$.require('other.module', function() {
			console.log('other.module ran');
		});
	}
});
