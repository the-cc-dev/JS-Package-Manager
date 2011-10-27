/**
 * Fonts Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 *
 * ------------------------------------------------------------------
 *
 * Methods:
 *   boolean  fonts.fontExists ( string font )
 *   mixed    fonts.firstAvailable ([ string font[, string font[, ... ]]])
 *   boolean  fonts.supportsFontFace ( void )
 *   void     fonts.load ( string font )
 *   string   fonts.fontPath ([ string file ])
 *   void     fonts.fontPath.set ([ string path = './' ])
 */

$('fonts', {
	require: ['css'],
	package: function(pkg) {
		
		var controlFonts = ['sans-serif', 'serif', 'cursive'];
		var fontTestString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789mmmmmmmmmm';
		
		var fontTestWrapper = document.createElement('div');
		var fontTestElement = fontTestWrapper.appendChild(document.createElement('span'));
		var fontTestControl = fontTestWrapper.appendChild(document.createElement('span'));
		
		var fontPath = './';
		
		fontTestElement.innerHTML = fontTestString;
		fontTestControl.innerHTML = fontTestString;
		
		/**
		 * Test if the given font exists
		 *
		 * @access  public
		 * @param   string    font name
		 * @return  boolean
		 */
		pkg.fontExists = function(font) {
			var fontExists = false;
			document.body.appendChild(fontTestWrapper);
			// We have to test for multiple default fonts in case the font being
			// tested for is one of the client defaults.
			for (var i = 0, c = controlFonts.length; i < c; i++) {
				var control = controlFonts[i];
				// First, set the test element to the correct font-family
				fontTestElement.style.fontFamily = font + ' ' + control;
				// Then, set our control element to the default font
				fontTestControl.style.fontFamily = control;
				// Now, test for any differences in dimensions
				if (! compareDimensions(fontTestElement, fontTestControl)) {
					// Only if all three tests fail does the font not exist, so
					// we can stop testing at this point
					fontExists = true;
					break;
				}
			}
			document.body.removeChild(fontTestWrapper);
			return fontExists;
		};
		
		/**
		 * Given a list of fonts, return the first one available to the client
		 *
		 * @access  public
		 * @param   string    font ...
		 * @return  mixed
		 */
		pkg.firstAvailable = function(/* string font[, ... ] */) {
			var fonts = Array.prototype.slice.call(arguments);
			for (var i = 0, c = fonts.length; i < c; i++) {
				if (pkg.fontExists(fonts[i])) {
					return fonts[i];
				}
			}
			return null;
		};
		
		/**
		 * Test if the client supports using css @font-face declarations
		 *
		 * Implementation concept borrowed from:
		 * @link    http://paulirish.com/2009/font-face-feature-detection/
		 *
		 * @access  public
		 * @return  boolean
		 */
		pkg.supportsFontFace = (function() {
			var flag = null;
			function checkSupport() {
				var sheet;
				var doc = document;
				var root = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement;
				var style = doc.createElement('style');
				var implementation = doc.implementation || { hasFeature: function() { return false; } };
				
				style.type = 'text/css';
				root.insertBefore(style, root.firstChild);
				sheet = style.sheet || style.styleSheet;
				
				var supportAtRule = (implementation.hasFeature('CSS2', '') ?
					function (rule) {
						if (! (sheet && rule)) {
							return false;
						}
						var result = false;
						try {
							sheet.insertRule(rule, 0);
							result =! (/unknown/i).test(sheet.cssRules[0].cssText);
							sheet.deleteRule(sheet.cssRules.length - 1);
						} catch (e) { }
						return result;
					} :
					function (rule) {
						if (! (sheet && rule)) {
							return false;
						}
						sheet.cssText = rule;
						return sheet.cssText.length !== 0 && ! (/unknown/i).test(sheet.cssText) &&
							sheet.cssText.replace(/\r+|\n+/g, '').indexOf(rule.split(' ')[0]) === 0;
					}
				);
				flag = supportAtRule('@font-face { font-family: "font"; src: "font.ttf"; }');
			}
			return function() {
				if (flag === null) {
					checkSupport();
				}
				return flag;
			};
		}());
		
		/**
		 * Load a given font dynamically using css @font-face
		 *
		 * @access  public
		 * @param   string    the font-family
		 * @param   string    the font file
		 * @return  void
		 */
		pkg.load = function(font, file) {
			if (pkg.supportsFontFace()) {
				file = pkg.fontPath(file);
				css.addRules([
					'@font-face {',
					'	font-family: ' + font + ';',
					'	src: url("' + file + '.eot?#iefix") format("embedded-opentype"),',
					'	     url("' + file + '.woff") format("woff"),',
					'	     url("' + file + '.ttf") format("truetype"),',
					'	     url("' + file + '.svg#svgFontName") format("svg");',
					'}'
				]);
			}
		};
		
		/**
		 * Get the font path
		 *
		 * @access  public
		 * @param   string    a specific file in the path
		 * @return  string
		 */
		pkg.fontPath = function(file) {
			if (file) {
				return fontPath + file;
			}
			return fontPath;
		};
		
		/**
		 * Set the font path
		 *
		 * @access  public
		 * @param   string    the new path
		 * @return  void
		 */
		pkg.fontPath.set = function(path) {
			if (! path) {
				path = './';
			}
			if (path.charAt(path.length - 1) !== '/') {
				path += '/';
			}
			fontPath = path;
		};
		
		
		
		
	// ------------------------------------------------------------------
	//  Helpers
		
		/**
		 * Tests for equal dimensions
		 */
		function compareDimensions(elem1, elem2) {
			return (elem1.offsetWidth === elem2.offsetWidth && elem1.offsetHeight === elem2.offsetHeight);
		}
		
	}
});

/* End of file fonts.js */
