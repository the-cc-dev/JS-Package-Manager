// Set the package path
$.path.set('../packages/');

// Define the main package
$('main', {
	require: ['fx', 'cssColor'],
	package: function(pkg) {
		
		window.setTimeout(function() {
			fx.animate(document.body, {
				duration: 1000,
				changes: { backgroundColor: '#800' },
				oncomplete: function() {
					console.log('animation finished');
				}
			});
		}, 500);
		
	}
});
