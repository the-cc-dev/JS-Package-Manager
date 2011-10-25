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
		 * @access  public
		 * @return  boolean
		 */
		pkg.supportsFontFace = (function() {
			var flag = null;
			return function() {
				if (flag === null) {
					//
					// ==================================== TODO ====================================
					//
				}
				return flag;
			};
		}());
		
		/**
		 * Load a given font dynamically using css @font-face
		 *
		 * @access  public
		 * @param   string    the font to load
		 * @return  void
		 */
		pkg.load = function(font) {
			//
			// ==================================== TODO ====================================
			//
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
