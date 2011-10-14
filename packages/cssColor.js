/**
 * CSS Color Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 * @depends    Packages: css, color, utils
 *
 * ------------------------------------------------------------------
 *
 * Methods:
 *   color.Color  css.color ( Element element, string property )
 */

$('cssColor', {
	require: ['css', 'color', 'utils'],
	package: function(pkg) {
		
		var rgb = 'rgb' + (css.supportsRgba() ? 'a' : '');
		
		// Storage for already initialized color objects
		var colorObjects = { };
		
		// Extend the css package
		css.color = function(element, property) {
			var uuid;
			// Make sure the element has a color storage object
			if (! element._colors) {
				element._colors = new ColorStorage(element);
			}
			// Check that there is a color object already created
			if (! element._colors[property]) {
				element._colors[property] = utils.uuid();
			}
			uuid = element._colors[property];
			// Make sure the color object exists
			if (! colorObjects[uuid]) {
				colorObjects[uuid] = new color.Color();
				colorObjects[uuid].addEventListener('change', function() {
					css.set(element, property, colorObjects[uuid].formatted(rgb));
				});
			}
			colorObjects[uuid].set(css.get(element, property));
			// Return the color object
			return colorObjects[uuid];
		};
	
	// ------------------------------------------------------------------
	//  Color Storage Constructor
		
		// A storage place for color codes
		function ColorStorage(element) {
			this._element = element;
		};
		ColorStorage.prototype.destroy = function() {
			for (var i in this) {
				if (this.hasOwnProperty(i) && colorObjects.hasOwnProperty(i)) {
					colorObjects[i].reset();
					delete colorObjects[i];
				}
			}
			this._element._colors = null;
		};
		
	}
});

/* End of file cssColor.js */
