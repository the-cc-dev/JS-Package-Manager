/**
 * CSS Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 *
 * ------------------------------------------------------------------
 *
 * Methods:
 *   mixed  css.get ( Element elem, string prop )
 *   void   css.set ( Element elem, string prop, mixed value )
 *   void   css.set ( Element elem, object properties )
 */

$('css', {
	package: function(pkg) {
	
		var undef = void(0);
	
	// ----------------------------------------------------------------------------
	//  Property mappings
	
		var propertyMap = { };
		var vendorPrefixes = ['webkit', 'Moz', 'ms', 'O', 'Khtml'];
		
	// ------------------------------------------------------------------
	//  Public interface
		
		pkg.get = function(elem, prop) {
			return getStyle(elem, prop);
		};
		
		pkg.set = function(elem, prop, value) {
			// Set multiple properties
			if (typeof prop === 'object') {
				for (var i in prop) {
					if (prop.hasOwnProperty(i)) {
						setStyle(elem, i, prop[i]);
					}
				}
			}
			// Set a single property
			if (typeof prop === 'string' && value !== undef) {
				setStyle(elem, prop, value);
			}
		};
	
	// ------------------------------------------------------------------
	//  Internal fallback helpers
	
		function opacityFallback(elem, opac) {
			if (opac !== undef) {
				opac = 'alpha(opacity=' + (opac * 100) + ')';
				elem.style.msFilter = '"' + opac + '"';
				elem.style.filter = opac;
			} else {
				opac = readStyleValue(elem, 'msFilter') || readStyleValue(elem, 'filter');
				opac = parseInt(opac.split('=')[1]) / 100;
				return opac;
			}
		};
	
		function vendorProperty(elem, prop) {
			if (! propertyMap.hasOwnProperty(prop)) {
				if (elem.style[prop] !== undef) {
					propertyMap[prop] = prop;
				} else {
					var capped = prop.charAt(0).toUpperCase() + prop.slice(1);
					for (var i = 0, c = vendorPrefixes.length; i < c; i++) {
						var vendorProp = vendorPrefixes[i] + capped;
						if (elem.style[vendorProp] !== undef) {
							propertyMap[prop] = vendorProp;
							break;
						}
					}
					if (! propertyMap.hasOwnProperty(prop)) {
						// Fallback for opacity using IE filter
						if (prop === 'opacity' && (elem.style.msFilter !== undef || elem.style.filter !== undef)) {
							propertyMap[prop] = opacityFallback;
						} else {
							propertyMap[prop] = prop;
						}
					}
				}
			}
			return propertyMap[prop];
		};

	// ----------------------------------------------------------------------------
	//  Internal property getter/setter
	
		function setStyle(elem, prop, value) {
			var setter = vendorProperty(elem, prop);
			if (typeof setter === 'function') {
				setter(elem, value);
			} else {
				elem.style[setter] = value;
			}
		};
	
		function getStyle(elem, prop) {
			var getter = vendorProperty(prop);
			if (typeof getter === 'function') {
				return getter(elem);
			} else {
				return readStyleValue(elem, getter);
			}
		};
	
	// ----------------------------------------------------------------------------
	//  Low-level internal style reader
	
		function readStyleValue(elem, prop) {
			if (elem.currentStyle) {
				return elem.currentStyle[prop];
			} else if (window.getComputedStyle) {
				return document.defaultView.getComputedStyle(elem, null).getPropertyValue(prop);
			}
			return null;
		};
	
	}
});

/* End of file css.js */
