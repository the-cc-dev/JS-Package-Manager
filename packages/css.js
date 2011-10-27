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
 *   mixed    css.get ( Element elem, string prop )
 *   void     css.set ( Element elem, string prop, mixed value )
 *   void     css.set ( Element elem, object properties )
 *   boolean  css.enabled ( void )
 *   boolean  css.supportsRgba ( void )
 *   void     css.loadStylesheet ( string url )
 *   void     css.enableStylesheet ( mixed sheet )
 *   void     css.disableStylesheet ( mixed sheet )
 *   void     css.toggleStylesheet ( mixed sheet )
 *   void     css.switchStylesheet ( mixed sheet )
 *   void     css.addRules ( mixed rules )
 */

$('css', {
	package: function(pkg) {
	
		var undef = void(0);
	
	// ----------------------------------------------------------------------------
	//  Property mappings
	
		var propertyMap = { };
		var vendorPrefixes = ['webkit', 'Moz', 'ms', 'O', 'Khtml'];
	
	// ------------------------------------------------------------------
	//  Stylesheet manipulation variables
		
		var root = document.head || document.getElementsByTagName('head')[0];
		var links = document.getElementsByTagName('link');
		var relRegex = /alterat(e|ive) stylesheet/i;
		
	// ------------------------------------------------------------------
	//  Main get/set methods
		
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
	//  Support methods
		
		pkg.enabled = (function() {
			var flag = null;
			return function() {
				if (flag === null) {
					// Build the test nodes
					var testDiv = document.body.appendChild(document.createElement('div'));
					testDiv.appendChild(document.createTextNode('Testing for CSS...'));
					testDiv.style.display = 'none';
					// See if css is enabled
					flag = (testDiv.offsetWidth == 0 && testDiv.offsetHeight == 0) ? true : false;
					// Remove the test nodes
					document.body.removeChild(testDiv);
				}
				return flag;
			};
		}());
		
		pkg.supportsRgba = (function() {
			var flag = null;
			return function() {
				if (flag === null) {
					var p = document.createElement('p');
					try {
						p.style.color = 'rgba(1, 1, 1, 0.5)';
						flag = /^rgba/.test(p.style.color);
					} catch (e) {
						flag = false;
					}
					p = null;
				}
				return flag;
			};
		}());
	
	// ------------------------------------------------------------------
	//  Stylesheet methods
	
		/**
		 * Dynamically load a stylesheet
		 *
		 * @access  public
		 * @param   string    the file URL
		 * @return  void
		 */
		pkg.loadStylesheet = function(file) {
			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.href = file;
			root.insertBefore(link, root.firstChild);
		};
		
		/**
		 * Enable a disabled alternate stylesheet
		 *
		 * @access  public
		 * @param   mixed     the stylesheet
		 * @return  void
		 */
		pkg.enableStylesheet = function(sheet) {
			sheet = getStylesheet(sheet);
			if (sheet && relRegex.test(sheet.rel)) {
				sheet.disabled = false;
			}
		};
		
		/**
		 * Disable a enabled alternate stylesheet
		 *
		 * @access  public
		 * @param   mixed     the stylesheet
		 * @return  void
		 */
		pkg.disableStylesheet = function(sheet) {
			sheet = getStylesheet(sheet);
			if (sheet && relRegex.test(sheet.rel)) {
				sheet.disabled = true;
			}
		};
		
		/**
		 * Toggle an alternate stylesheet
		 *
		 * @access  public
		 * @param   mixed     the stylesheet
		 * @return  void
		 */
		pkg.toggleStylesheet = function(sheet) {
			sheet = getStylesheet(sheet);
			if (sheet && relRegex.test(sheet.rel)) {
				sheet.disabled =! sheet.disabled;
			}
		};
		
		/**
		 * Disable all stylesheets except the one given
		 *
		 * @access  public
		 * @param   mixed     the stylesheet
		 * @return  void
		 */
		pkg.switchStylesheet = function(sheet) {
			if (typeof sheet === 'string') {
				for (var i = 0, c = links.length; i < c; i++) {
					if (links[i].title === sheet) {
						pkg.enableStylesheet(links[i]);
					} else {
						pkg.disableStylesheet(links[i]);
					}
				}
			} else {
				for (var i = 0, c = links.length; i < c; i++) {
					if (links[i] === sheet) {
						pkg.enableStylesheet(links[i]);
					} else {
						pkg.disableStylesheet(links[i]);
					}
				}
			}
		};
		
		/**
		 * Add the given CSS rules to the document
		 *
		 * @access  public
		 * @param   mixed     rules
		 * @return  void
		 */
		pkg.addRules = (function() {
			var stylesheet = null;
			var testElement = document.body || document.createElement('p');
			return function(rules) {
				// If an object was given, parse it into a rule string
				if (typeof rules === 'object') {
					var _rules = '';
					for (var selector in rules) {
						if (rules.hasOwnProperty(selector)) {
							_rules += selector + ' { ';
							for (var property in rules[selector]) {
								if (rules[selector].hasOwnProperty(property)) {
									var value = rules[selector][property];
									var prefix = vendorProperty(testElement, property);
									property = hyphenate(property);
									if (prefix[0]) {
										property = '-' + prefix[0] + '-' + property;
									} else if (prefix[1] === opacityFallback) {
										if (testElement.style.msFilter !== undef) {
											property = '-ms-filter';
											value = '"alpha(opacity=' + (value * 100) + ')"';
										} else if (testElement.style.filter !== undef) {
											property = 'filter';
											value = 'alpha(opacity=' + (value * 100) + ')';
										}
									}
									_rules += property + ': ' + value + '; ';
								}
							}
							_rules += '}';
						}
					}
					rules = _rules;
				}
				// Do the actual rule embedding
				if (typeof rules === 'string') {
					if (stylesheet === null) {
						stylesheet = root.appendChild(
							document.createElement('style')
						);
						stylesheet.type = 'text/css';
					}
					if (stylesheet.styleSheet) {
						stylesheet.styleSheet.cssText += ' ' + rules;
					} else {
						stylesheet.appendChild(
							document.createTextNode(' ' + rules)
						);
					}
				}
			};
		}());
	
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
					propertyMap[prop] = [null, prop];
				} else {
					var capped = prop.charAt(0).toUpperCase() + prop.slice(1);
					for (var i = 0, c = vendorPrefixes.length; i < c; i++) {
						var vendorProp = vendorPrefixes[i] + capped;
						if (elem.style[vendorProp] !== undef) {
							propertyMap[prop] = [vendorPrefixes[i], vendorProp];
							break;
						}
					}
					if (! propertyMap.hasOwnProperty(prop)) {
						// Fallback for opacity using IE filter
						if (prop === 'opacity' && (elem.style.msFilter !== undef || elem.style.filter !== undef)) {
							propertyMap[prop] = [null, opacityFallback];
						} else {
							propertyMap[prop] = [null, prop];
						}
					}
				}
			}
			return propertyMap[prop];
		};

	// ----------------------------------------------------------------------------
	//  Internal property getter/setter
	
		function setStyle(elem, prop, value) {
			var setter = vendorProperty(elem, prop)[1];
			if (typeof setter === 'function') {
				setter(elem, value);
			} else {
				elem.style[setter] = value;
			}
		};
	
		function getStyle(elem, prop) {
			var getter = vendorProperty(elem, prop)[1];
			if (typeof getter === 'function') {
				return getter(elem);
			} else {
				return readStyleValue(elem, getter);
			}
		};
	
	// ----------------------------------------------------------------------------
	//  Low-level internal style reader
	
		function readStyleValue(elem, prop) {
			var result = null;
			if (elem.currentStyle) {
				result = elem.currentStyle[prop];
			} else if (window.getComputedStyle) {
				var computed = document.defaultView.getComputedStyle(elem, null);
				result = computed.getPropertyValue(prop);
				if (result === null) {
					result = computed.getPropertyValue(hyphenate(prop));
				}
			}
			return result;
		};
		
	// ------------------------------------------------------------------
	//  Helper functions
	
		function hyphenate(property) {
			return property.replace(/[A-Z]/g, function(letter) {
				return '-' + letter.toLowerCase();
			});
		}
		
		function getStylesheet(sheet) {
			// If a string was given, we are fetching by title attribute
			if (typeof sheet === 'string') {
				for (var i = 0, c = links.length; i < c; i++) {
					if (links[i].title === sheet) {
						sheet = links[i];
						break;
					}
				}
			}
			return (typeof sheet === 'object') ? sheet : null;
		}
	
	}
});

/* End of file css.js */
