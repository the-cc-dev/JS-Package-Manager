/**
 * Utilities Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 *
 * ------------------------------------------------------------------
 *
 * Constructor:
 *   utils.Callstack ([ function ... ]) <extends> Function
 *     number   utils.Callstack.push ( function ... )
 */

$('utils', {
	package: function(pkg) {
		
		/**
		 * A callstack constructor
		 *
		 * @access  public
		 * @param   function  ...
		 */
		pkg.Callstack = function(/* func ... */) {
			var arr = [ ];
			var ret = function() {
				var result;
				for (var i = 0, c = arr.length; i < c; i++) {
					if (typeof arr[i] === 'function') {
						result = arr[i].apply(this, arguments);
					}
				}
				return result;
			};
			ret.push = function() {
				return arr.push.apply(arr, arguments);
			};
			// Push in any given functions
			for (var i = 0, c = arguments.length; i < c; i++) {
				if (typeof arguments[i] === 'function') {
					arr.push(arguments[i]);
				}
			}
			return ret;
		};
		
	}
});
