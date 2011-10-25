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
 *   number    utils.roundTo ( number num, number places )
 *   string    utils.uuid ( void )
 *   void      utils.globalEval ( string code )
 *   void      utils.runAsync ( function callback )
 *   void      utils.runAsyncIf ( mixed condition, function callback )
 *   object    utils.windowSize ( void )
 *   object    utils.merge ( object host, object donor[, object donor ... ])
 *   object    utils.mergeRecursive ( object host, object donor[, object donor ... ])
 *   mixed     utils.clone ( mixed value )
 *   number    utils.inforce ( number value, object options { min, max, places, rotate } )
 *   string    utils.vartype ( mixed value )
 *   boolean   utils.vartype.isDefined ( mixed value )
 *   boolean   utils.vartype.isSet ( mixed value )
 *   boolean   utils.vartype.isPrimative ( mixed value )
 *   boolean   utils.vartype.isNumber ( mixed value )
 *   boolean   utils.vartype.isString ( mixed value )
 *   boolean   utils.vartype.isBoolean ( mixed value )
 *   boolean   utils.vartype.isRegexp ( mixed value )
 *   boolean   utils.vartype.isDate ( mixed value )
 *   boolean   utils.vartype.isArray ( mixed value )
 *   boolean   utils.vartype.isObject ( mixed value )
 *   boolean   utils.vartype.isFunction ( mixed value )
 *   boolean   utils.vartype.isError ( mixed value )
 *   boolean   utils.vartype.isEvent ( mixed value )
 *   boolean   utils.vartype.isArguments ( mixed value )
 *   boolean   utils.vartype.isNodeList ( mixed value )
 *   boolean   utils.vartype.isEnumerable ( mixed value )
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
		
		/**
		 * Generates a v4 UUID
		 *
		 * @access  public
		 * @param   string    the PRNG to use
		 * @return  string
		 */
		pkg.uuid = function(prng) {
			var random = Math.random;
			// Allow using a non-native PRNG if "rand" is included
			if (prng) {
				if ($.packageLoaded('rand')) {
					gen = function() {
						return rand.double(prng);
					};
				} else {
					throw 'Must include the "rand" package to use a non-native PRNG';
				}
			}
			var ret = '', value;
			for (var i = 0; i < 32; i++) {
				value = random() * 16 | 0;
				// Insert the hypens
				if (i > 4 && i < 21 && ! (i % 4)) {
					ret += '-';
				}
				// Add the next random character
				ret += (
					(i === 12) ? 4 : (
						(i === 16) ? (value & 3 | 8) : value
					)
				).toString(16);
			}
			return ret;
		};
		
		/**
		 * Eval a string in global scope
		 *
		 * @access  public
		 * @param   string    the script string
		 * @return  void
		 */
		pkg.globalEval = (function() {
			var _support = null;
			function scriptEval() {
				if (_support === null) {
					var root = getHead(),
					script = createElem('script'),
					id = 'script' + (new Date()).getTime();
		
					script.type = 'text/javascript';
					try {
						script.appendChild(document.createTextNode('window.' + id + '=1;'));
					} catch(e) { }

					root.insertBefore(script, root.firstChild);

					// (IE doesn't support this, fails, and uses .text instead)
					if (window[id]) {
						_support = true;
						delete window[id];
					} else {
						_support = false;
					}
				}
		
				return _support;
			}
			return function(data, async) {
				if (typeof data === 'string' && /\S/.test(data)) {
					var runEval = function() {
						// Inspired by code by Andrea Giammarchi
						// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
						var
						head = document.getElementsByTagName('head')[0],
						script = document.createElement('script');
				
						script.type = 'text/javascript';

						if (scriptEval()) {
							script.appendChild(document.createTextNode(data));
						} else {
							script.text = data;
						}

						// Use insertBefore instead of appendChild to circumvent an IE6 bug.
						// This arises when a base node is used (#2709).
						head.insertBefore(script, head.firstChild);
						head.removeChild(script);
					};
					if (async) {
						window.setTimeout(runEval, 1);
					} else {
						runEval();
					}
				}
			};
		}());
		
		/**
		 * Run a function asynchronously
		 *
		 * @access  public
		 * @param   function  callback
		 * @return  void
		 */
		pkg.runAsync = (window.setImmediate ?
			function(func) {
				window.setImmediate(func);
			} :
			function(func) {
				window.setTimeout(func, 0);
			}
		);
		
		/**
		 * Run a function asynchronously if a condition is met, synchronously otherwise
		 *
		 * @access  public
		 * @param   mixed     the condition
		 * @param   function  callback
		 * @return  void
		 */
		pkg.runAsyncIf = function(cond, func) {
			cond ? pkg.runAsync(func) : func();
		};
		
		/**
		 * Get the current window dimensions
		 *
		 * @access  public
		 * @return  object
		 */
		pkg.windowSize = function() {
			return {
				w: window.innerWidth || document.documentElement.clientWidth || body().clientWidth,
				h: window.innerHeight || document.documentElement.clientHeight || body().clientHeight
			};
		};
		
		/**
		 * Merge multiple objects together (not recursive)
		 *
		 * @access  public
		 * @param   object    host
		 * @param   object    donors ...
		 * @return  object
		 */
		pkg.merge = function() {
			return mergeObjects(arguments, function(host, donor) {
				for (var i in donor) {
					if (donor.hasOwnProperty(i)) {
						host[i] = donor[i];
					}
				}
			});
		};
		
		/**
		 * Merge multiple objects together recursively
		 *
		 * @access  public
		 * @param   object    host
		 * @param   object    donors ...
		 * @return  object
		 */
		pkg.mergeRecursive = function() {
			function recursiveMerge(host, donor) {
				for (var i in donor) {
					if (donor.hasOwnProperty(i)) {
						if (! pkg.vartype.isPrimative(host[i]) && ! pkg.vartype.isPrimative(donor[i])) {
							recursiveMerge(host[i], donor[i]);
						} else {
							host[i] = donor[i];
						}
					}
				}
			}
			return mergeObjects(arguments, recursiveMerge);
		};
		
		/**
		 * Clone a variable
		 *
		 * @access  public
		 * @param   mixed     the value to clone
		 * @param   boolean   ignore a clone() method
		 * @return  mixed
		 */
		pkg.clone = function(value, ignoreClone) {
			// Return primatives immediately
			if (pkg.vartype.isPrimative(value)) {
				return value;
			}
			// Build the correct type of initial object
			var result;
			if (typeof value.clone === 'function' && ! ignoreClone) {
				result = value.clone();
			} else {
				switch (pkg.vartype(value)) {
					case 'date':
						result = new Date();
						result.setTime(value.getTime());
					break;
					case 'function':
						result = (function() {
							var old = value;
							return function() {
								return old.apply(this, arguments);
							};
						}());
					break;
					case 'regexp':
						result = new RegExp(value.source, (
							(value.global ? 'g' : '') + 
							(value.multiline ? 'm' : '') +
							(value.ignoreCase ? 'i' : '')
						));
					break;
					default:
						result = new (value.constructor || Object)();
					break;
				}
				pkg.merge(result, value);
			}
			return result;
		};
		
		/**
		 * Inforces a set of conditions on a number value
		 *
		 * @access  public
		 * @param   number    the number to modify
		 * @param   object    the inforce options { min, max, places, rotate }
		 * @return  number
		 */
		pkg.inforce = function(num, opts) {
			var minAndMax = (opts.hasOwnProperty('min') && opts.hasOwnProperty('max'));
			if (minAndMax && opts.min > opts.max) {
				throw new RangeError('utils.inforce: minimum value cannot be greater than maximum');
			}
			if (opts.rotate && minAndMax) {
				var diff = opts.max - opts.min;
				while (num < opts.min) {
					num += diff;
				}
				while (num >= opts.max) {
					num -= diff;
				}
			} else {
				if (opts.hasOwnProperty('min')) {
					num = Math.max(num, opts.min);
				}
				if (opts.hasOwnProperty('max')) {
					num = Math.min(num, opts.max);
				}
			}
			if (opts.hasOwnProperty('places')) {
				num = utils.roundTo(num, opts.places);
			}
			return num;
		}
	
	// ------------------------------------------------------------------
	//  Variable Type Method/Namespace
		
		pkg.vartype = (function() {

			// Used for picking out more general type data from a string
			var isEvent = /event$/;
			var isError = /error$/;
			var isNode = function(obj) {
				if (window.Node && obj instanceof window.Node) {return true;}
				return (typeof obj.nodeType === 'number' && typeof obj.nodeName === 'string' && typeof obj.innerHTML === 'string');
			};
	
			// Native object types
			var nativeTypes = ['object', 'array', 'regexp', 'function', 'date'];
	
			// Convert a value to a string
			var toString = (function() {
				var toStr = Object.prototype.toString;
				return function(obj) {
					return toStr.call(obj);
				};
			}());
	
			// Get a variable's type
			var ret = function(obj) {
				// Catch nulls
				if (obj === null) {return 'null';}
		
				// Get the typeof for primatives
				var type = typeof obj;
		
				// Handle mutables
				if (type === 'object' || type === 'function') {
					// Get type data from Object.prototype.toString.call(obj)
					type = toString(obj).split(' ')[1].substring(-1).toLowerCase();
			
					// Test for events
					if (isEvent.test(type)) {
						return 'event';
					}
			
					// Test for errors
					else if (isError.test(type)) {
						return 'error';
					}
			
					// Test for nodes
					else if (isNode(obj)) {
						return 'node';
					}
			
					// Check for types that aren't in the "nativeTypes" list and normalize them to "object"
					if (! contains(nativeTypes, type)) {
						return 'object';
					}
				}
		
				// Catch NaN values
				else if (type === 'number' && isNaN(obj)) {
					return 'nan';
				}
		
				return type;
			};
	
		// ----------------------------------------------------------------------------
		//  Add more specific use test methods
	
			// Test for variables that aren't undefined
			ret.isDefined = function(obj) {
				return (typeof obj !== 'undefined');
			};
	
			// Test for variables that aren't undefined or null
			ret.isSet = function(obj) {
				return (typeof obj !== 'undefined' && obj !== null);
			};
	
			// Test for a non-mutable
			ret.isPrimative = function(obj) {
				var type = typeof obj;
				return (type !== 'function' && (type !== 'object' || obj === null));
			};
	
			// Test for a number
			ret.isNumber = function(obj) {
				return (typeof obj === 'number' && ! isNaN(obj));
			};
	
			// Test for a string
			ret.isString = function(obj) {
				return (typeof obj === 'string');
			};
	
			// Test for a boolean
			ret.isBoolean = function(obj) {
				return (typeof obj === 'boolean');
			};
	
			// Test for a regular expression
			ret.isRegexp = function(obj) {
				return (toString(obj) === '[object RegExp]');
			};
	
			// Test for a date object
			ret.isDate = function(obj) {
				return (toString(obj) === '[object Date]');
			};
	
			// Test for an array
			ret.isArray = function(obj) {
				return (toString(obj) === '[object Array]');
			};
	
			// Test for an object
			ret.isObject = function(obj) {
				return (typeof obj === 'object' && obj);
			};
	
			// Test for a function
			ret.isFunction = function(obj) {
				return (toString(obj) === '[object Function]');
			};
	
			// Test for an error
			ret.isError = function(obj) {
				return (ret(obj) === 'error');
			};
	
			// Test for an event
			ret.isEvent = function(obj) {
				return (ret(obj) === 'event');
			};
	
			// Test for an arguments object
			ret.isArguments = function(obj) {
				return (toString(obj) === '[object Arguments]' || (ret.isNumber(obj.length) && ret.isFunction(obj.callee)));
			};
	
			// Test for a node list
			ret.isNodeList = function(obj) {
				return (! ret.isPrimative(obj) && ret.isNumber(obj.length) && ret.isFunction(obj.item) &&
					ret.isFunction(obj.nextNode) && ret.isFunction(obj.reset));
			};
	
			// Test for an enumerable
			ret.isEnumerable = function(obj) {
				return (ret.isArray(obj) || ret.isArguments(obj) ||
					(typeof ret.length === 'number' && ! obj.propertyIsEnumerable('length')));
			};
	
			return ret;
		}());
		
	// ------------------------------------------------------------------
	//  Internal Helpers
		
		function body() {
			return document.body || document.getElementsByTagName('body')[0];
		}
		
		function contains(arr, value) {
			if (arr.indexOf) {
				return arr.indexOf(value);
			}
			for (var i = 0, c = arr.length; i < c; i++) {
				if (arr[i] === value) {
					return true;
				}
			}
			return false;
		}
		
		function mergeObjects(args, strategy) {
			var donors = pkg.toArray(args);
			var host = donors.shift();
			// Start running through the donors, merging each one
			for (var i = 0, c = donors.length; i < c; i++) {
				strategy(host, donors[i]);
			}
			return host;
		}
		
	}
});
