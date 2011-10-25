// Set the package path
$.path.set('../packages/');

// Define the main package
$('main', {
	require: ['validation'],
	package: function(pkg) {
		
		var element = document.body.appendChild(document.createElement('input'));
		var validator = new validation.Validator();
		validator.addRule([
			['element', element],
			['required', true, 'This field is required'],
			['type', 'email', 'Value given is not a valid email address'],
			['length-min', 12, 'Needs a minimum length of 12']
		]);
		
		var messages = document.body.appendChild(document.createElement('ul'));
		
		window.validate = function() {
			try {
				messages.innerHTML = '';
				validator.validate();
				messages.style.color = '#080';
				messages.innerHTML = '<li>Passed!</li>';
			} catch (e) {
				var failures = '<li>' + e.failures.join('</li><li>') + '</li>';
				messages.style.color = '#800';
				messages.innerHTML = failures;
			}
		};
		
	}
});
