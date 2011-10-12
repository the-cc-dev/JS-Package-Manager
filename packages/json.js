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
 *   string   json.decycle ( mixed value )
 *   mixed    json.retrocycle ( string value )
 */

$('json', {
	package: function(pkg) {
		
		// JSON encoder
		pkg.encode = function(value) {
			return JSON.stringify(value);
		};
		
		// JSON decoder
		pkg.decode = function(value) {
			return JSON.parse(value);
		};
		
		// JSON cyclical encoder
		pkg.decycle = function(value) {
			return JSON.decycle(value);
		};
		
		// JSON cyclical decoder
		pkg.retrocycle = function(value) {
			return JSON.retrocycle(value);
		};
	
	// ------------------------------------------------------------------
	//  Patch JSON support if there is no native
	
		if (! (JSON && JSON.stringify)) {
			window.JSON = { };
			(function () {
				"use strict";
				
				/**
				 * http://www.JSON.org/json2.js
				 * 2011-02-23
				 *
				 * Public Domain.
				 *
				 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
				 *
				 * See http://www.JSON.org/js.html
				 */

				function f(n) {
					// Format integers to have at least two digits.
					return n < 10 ? '0' + n : n;
				}

				if (typeof Date.prototype.toJSON !== 'function') {

					Date.prototype.toJSON = function (key) {

						return isFinite(this.valueOf()) ?
						    this.getUTCFullYear()     + '-' +
						    f(this.getUTCMonth() + 1) + '-' +
						    f(this.getUTCDate())      + 'T' +
						    f(this.getUTCHours())     + ':' +
						    f(this.getUTCMinutes())   + ':' +
						    f(this.getUTCSeconds())   + 'Z' : null;
					};

					String.prototype.toJSON      =
						Number.prototype.toJSON  =
						Boolean.prototype.toJSON = function (key) {
						    return this.valueOf();
						};
				}

				var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
					escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
					gap,
					indent,
					meta = {    // table of character substitutions
						'\b': '\\b',
						'\t': '\\t',
						'\n': '\\n',
						'\f': '\\f',
						'\r': '\\r',
						'"' : '\\"',
						'\\': '\\\\'
					},
					rep;


				function quote(string) {

			// If the string contains no control characters, no quote characters, and no
			// backslash characters, then we can safely slap some quotes around it.
			// Otherwise we must also replace the offending characters with safe escape
			// sequences.

					escapable.lastIndex = 0;
					return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
						var c = meta[a];
						return typeof c === 'string' ? c :
						    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
					}) + '"' : '"' + string + '"';
				}


				function str(key, holder) {

			// Produce a string from holder[key].

					var i,          // The loop counter.
						k,          // The member key.
						v,          // The member value.
						length,
						mind = gap,
						partial,
						value = holder[key];

			// If the value has a toJSON method, call it to obtain a replacement value.

					if (value && typeof value === 'object' &&
						    typeof value.toJSON === 'function') {
						value = value.toJSON(key);
					}

			// If we were called with a replacer function, then call the replacer to
			// obtain a replacement value.

					if (typeof rep === 'function') {
						value = rep.call(holder, key, value);
					}

			// What happens next depends on the value's type.

					switch (typeof value) {
					case 'string':
						return quote(value);

					case 'number':

			// JSON numbers must be finite. Encode non-finite numbers as null.

						return isFinite(value) ? String(value) : 'null';

					case 'boolean':
					case 'null':

			// If the value is a boolean or null, convert it to a string. Note:
			// typeof null does not produce 'null'. The case is included here in
			// the remote chance that this gets fixed someday.

						return String(value);

			// If the type is 'object', we might be dealing with an object or an array or
			// null.

					case 'object':

			// Due to a specification blunder in ECMAScript, typeof null is 'object',
			// so watch out for that case.

						if (!value) {
						    return 'null';
						}

			// Make an array to hold the partial results of stringifying this object value.

						gap += indent;
						partial = [];

			// Is the value an array?

						if (Object.prototype.toString.apply(value) === '[object Array]') {

			// The value is an array. Stringify every element. Use null as a placeholder
			// for non-JSON values.

						    length = value.length;
						    for (i = 0; i < length; i += 1) {
						        partial[i] = str(i, value) || 'null';
						    }

			// Join all of the elements together, separated with commas, and wrap them in
			// brackets.

						    v = partial.length === 0 ? '[]' : gap ?
						        '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
						        '[' + partial.join(',') + ']';
						    gap = mind;
						    return v;
						}

			// If the replacer is an array, use it to select the members to be stringified.

						if (rep && typeof rep === 'object') {
						    length = rep.length;
						    for (i = 0; i < length; i += 1) {
						        if (typeof rep[i] === 'string') {
						            k = rep[i];
						            v = str(k, value);
						            if (v) {
						                partial.push(quote(k) + (gap ? ': ' : ':') + v);
						            }
						        }
						    }
						} else {

			// Otherwise, iterate through all of the keys in the object.

						    for (k in value) {
						        if (Object.prototype.hasOwnProperty.call(value, k)) {
						            v = str(k, value);
						            if (v) {
						                partial.push(quote(k) + (gap ? ': ' : ':') + v);
						            }
						        }
						    }
						}

			// Join all of the member texts together, separated with commas,
			// and wrap them in braces.

						v = partial.length === 0 ? '{}' : gap ?
						    '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
						    '{' + partial.join(',') + '}';
						gap = mind;
						return v;
					}
				}

			// If the JSON object does not yet have a stringify method, give it one.

				if (typeof JSON.stringify !== 'function') {
					JSON.stringify = function (value, replacer, space) {

			// The stringify method takes a value and an optional replacer, and an optional
			// space parameter, and returns a JSON text. The replacer can be a function
			// that can replace values, or an array of strings that will select the keys.
			// A default replacer method can be provided. Use of the space parameter can
			// produce text that is more easily readable.

						var i;
						gap = '';
						indent = '';

			// If the space parameter is a number, make an indent string containing that
			// many spaces.

						if (typeof space === 'number') {
						    for (i = 0; i < space; i += 1) {
						        indent += ' ';
						    }

			// If the space parameter is a string, it will be used as the indent string.

						} else if (typeof space === 'string') {
						    indent = space;
						}

			// If there is a replacer, it must be a function or an array.
			// Otherwise, throw an error.

						rep = replacer;
						if (replacer && typeof replacer !== 'function' &&
						        (typeof replacer !== 'object' ||
						        typeof replacer.length !== 'number')) {
						    throw new Error('JSON.stringify');
						}

			// Make a fake root object containing our value under the key of ''.
			// Return the result of stringifying the value.

						return str('', {'': value});
					};
				}


			// If the JSON object does not yet have a parse method, give it one.

				if (typeof JSON.parse !== 'function') {
					JSON.parse = function (text, reviver) {

			// The parse method takes a text and an optional reviver function, and returns
			// a JavaScript value if the text is a valid JSON text.

						var j;

						function walk(holder, key) {

			// The walk method is used to recursively walk the resulting structure so
			// that modifications can be made.

						    var k, v, value = holder[key];
						    if (value && typeof value === 'object') {
						        for (k in value) {
						            if (Object.prototype.hasOwnProperty.call(value, k)) {
						                v = walk(value, k);
						                if (v !== undefined) {
						                    value[k] = v;
						                } else {
						                    delete value[k];
						                }
						            }
						        }
						    }
						    return reviver.call(holder, key, value);
						}


			// Parsing happens in four stages. In the first stage, we replace certain
			// Unicode characters with escape sequences. JavaScript handles many characters
			// incorrectly, either silently deleting them, or treating them as line endings.

						text = String(text);
						cx.lastIndex = 0;
						if (cx.test(text)) {
						    text = text.replace(cx, function (a) {
						        return '\\u' +
						            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
						    });
						}

			// In the second stage, we run the text against regular expressions that look
			// for non-JSON patterns. We are especially concerned with '()' and 'new'
			// because they can cause invocation, and '=' because it can cause mutation.
			// But just to be safe, we want to reject all unexpected forms.

			// We split the second stage into 4 regexp operations in order to work around
			// crippling inefficiencies in IE's and Safari's regexp engines. First we
			// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
			// replace all simple value tokens with ']' characters. Third, we delete all
			// open brackets that follow a colon or comma or that begin the text. Finally,
			// we look to see that the remaining characters are only whitespace or ']' or
			// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

						if (/^[\],:{}\s]*$/
						        .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
						            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
						            .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

			// In the third stage we use the eval function to compile the text into a
			// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
			// in JavaScript: it can begin a block or an object literal. We wrap the text
			// in parens to eliminate the ambiguity.

						    j = eval('(' + text + ')');

			// In the optional fourth stage, we recursively walk the new structure, passing
			// each name/value pair to a reviver function for possible transformation.

						    return typeof reviver === 'function' ?
						        walk({'': j}, '') : j;
						}

			// If the text is not JSON parseable, then a SyntaxError is thrown.

						throw new SyntaxError('JSON.parse');
					};
				}
			}());
		}
		
	// ------------------------------------------------------------------
	//  Add cyclical reference based encoding methods
		
		if (typeof JSON.decycle !== 'function') {
			JSON.decycle = function decycle(object) {
				'use strict';

		// Make a deep copy of an object or array, assuring that there is at most
		// one instance of each object or array in the resulting structure. The
		// duplicate references (which might be forming cycles) are replaced with
		// an object of the form
		//      {$ref: PATH}
		// where the PATH is a JSONPath string that locates the first occurance.
		// So,
		//      var a = [];
		//      a[0] = a;
		//      return JSON.stringify(JSON.decycle(a));
		// produces the string '[{"$ref":"$"}]'.

		// JSONPath is used to locate the unique object. $ indicates the top level of
		// the object or array. [NUMBER] or [STRING] indicates a child member or
		// property.

				var objects = [],   // Keep a reference to each unique object or array
				    paths = [];     // Keep the path to each unique object or array

				return (function derez(value, path) {

		// The derez recurses through the object, producing the deep copy.

				    var i,          // The loop counter
				        name,       // Property name
				        nu;         // The new object or array

				    switch (typeof value) {
				    case 'object':

		// typeof null === 'object', so get out if this value is not really an object.

				        if (!value) {
				            return null;
				        }

		// If the value is an object or array, look to see if we have already
		// encountered it. If so, return a $ref/path object. This is a hard way,
		// linear search that will get slower as the number of unique objects grows.

				        for (i = 0; i < objects.length; i += 1) {
				            if (objects[i] === value) {
				                return {$ref: paths[i]};
				            }
				        }

		// Otherwise, accumulate the unique value and its path.

				        objects.push(value);
				        paths.push(path);

		// If it is an array, replicate the array.

				        if (Object.prototype.toString.apply(value) === '[object Array]') {
				            nu = [];
				            for (i = 0; i < value.length; i += 1) {
				                nu[i] = derez(value[i], path + '[' + i + ']');
				            }
				        } else {

		// If it is an object, replicate the object.

				            nu = {};
				            for (name in value) {
				                if (Object.prototype.hasOwnProperty.call(value, name)) {
				                    nu[name] = derez(value[name],
				                        path + '[' + JSON.stringify(name) + ']');
				                }
				            }
				        }
				        return nu;
				    case 'number':
				    case 'string':
				    case 'boolean':
				        return value;
				    }
				}(object, '$'));
			};
		}


		if (typeof JSON.retrocycle !== 'function') {
			JSON.retrocycle = function retrocycle($) {
				'use strict';

		// Restore an object that was reduced by decycle. Members whose values are
		// objects of the form
		//      {$ref: PATH}
		// are replaced with references to the value found by the PATH. This will
		// restore cycles. The object will be mutated.

		// The eval function is used to locate the values described by a PATH. The
		// root object is kept in a $ variable. A regular expression is used to
		// assure that the PATH is extremely well formed. The regexp contains nested
		// * quantifiers. That has been known to have extremely bad performance
		// problems on some browsers for very long strings. A PATH is expected to be
		// reasonably short. A PATH is allowed to belong to a very restricted subset of
		// Goessner's JSONPath.

		// So,
		//      var s = '[{"$ref":"$"}]';
		//      return JSON.retrocycle(JSON.parse(s));
		// produces an array containing a single element which is the array itself.

				var px =
				    /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

				(function rez(value) {

		// The rez function walks recursively through the object looking for $ref
		// properties. When it finds one that has a value that is a path, then it
		// replaces the $ref object with a reference to the value that is found by
		// the path.

				    var i, item, name, path;

				    if (value && typeof value === 'object') {
				        if (Object.prototype.toString.apply(value) === '[object Array]') {
				            for (i = 0; i < value.length; i += 1) {
				                item = value[i];
				                if (item && typeof item === 'object') {
				                    path = item.$ref;
				                    if (typeof path === 'string' && px.test(path)) {
				                        value[i] = eval(path);
				                    } else {
				                        rez(item);
				                    }
				                }
				            }
				        } else {
				            for (name in value) {
				                if (typeof value[name] === 'object') {
				                    item = value[name];
				                    if (item) {
				                        path = item.$ref;
				                        if (typeof path === 'string' && px.test(path)) {
				                            value[name] = eval(path);
				                        } else {
				                            rez(item);
				                        }
				                    }
				                }
				            }
				        }
				    }
				}($));
				return $;
			};
		}
		
	}
});

/* End of file json.js */
