/**
 * JSON Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 *
 * ------------------------------------------------------------------
 *
 * Methods:
 *   string   json.encode ( mixed value )
 *   mixed    json.decode ( string value )
 */

$('json', {
	package: function(pkg) {
		
		// If there is no native JSON support, load the patch
		if (! (JSON && JSON.stringify)) {
			$.require('json-patch');
		}
		
		// JSON encoder
		pkg.encode = function(value) {
			return JSON.stringify(value);
		};
		
		// JSON decoder
		pkg.decode = function(value) {
			return JSON.parse(value);
		};
		
	}
});

/* End of file json.js */
