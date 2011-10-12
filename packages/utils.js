/**
 * Utilities Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 *
 * ------------------------------------------------------------------
 *
 * Methods:
 *   array     utils.toArray ( object arr )
 *   function  utils.bindScope ( object scope[, mixed args ... ], function func )
 *
 * Constructors:
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
		
		/**
		 * Cast an enumerable to an array
		 *
		 * @access  public
		 * @param   object    the enumerable
		 * @return  array
		 */
		pkg.toArray = (function() {
			var slice = Array.prototype.slice;
			return function(arr) {
				var result;
				try {
					result = slice.call(arr);
				} catch (e) {
					result = [ ];
					for (var i = 0, c = arr.length; i < c; i++) {
						result[i] = arr[i];
					}
				}
				return result;
			};
		}());
		
		/**
		 * Bind a scope to a function
		 *
		 * @access  public
		 * @param   object    scope
		 * @param   mixed     arguments ...
		 * @param   function  the function body
		 * @return  function
		 */
		pkg.bindScope = function(/* object scope, [mixed args ...], function func */) {
			var args = pkg.toArray(arguments);
			var scope = args.shift();
			var func = args.pop();
			var result = function() {
				var argv = args.concat(pkg.toArray(arguments));
				return func.apply(scope, argv);
			};
			result.toString = function() {
				return func.toString();
			};
			return result;
		};
		
		/**
		 * Round a decimal to a given number of places
		 *
		 * @access  public
		 * @param   number    the number to round
		 * @param   number    the number of places
		 * @return  number
		 */
		pkg.roundTo = function(num, places) {
			var mult = Math.pow(10, places);
			num *= mult;
			num = Math.round(num);
			return num / mult;
		};
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	}
});
