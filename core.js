/**
 * Core package loader library
 */

var $ = (function() {
	
	var doc = document;
	var root = doc.head || doc.getElementsByTagName('head')[0];
	var packages = { };
	
// ------------------------------------------------------------------
//  Define the main $ function

	var $ = function(packageName, definition) {
		// Check that the module hasn't already been loaded
		if (packages[packageName] && packages[packageName].loaded) {
			throw new $.PackageError('Cannot redefine package "' + packageName + '"; Package already exists.');
		}
		// Mark the package as being loaded
		if (! packages.hasOwnProperty(packageName)) {
			packages[packageName] = {
				loaded: false,
				after: Callstack()
			};
		}
		// The list of the pre-required packages
		var prereqs = definition.require || [ ];
		// Check if all needed packages are loaded
		function checkPackagesLoaded() {
			for (var i = 0, c = prereqs.length; i < c; i++) {
				if (! packages[prereqs[i]] || ! packages[prereqs[i]].loaded) {
					return false;
				}
			}
			// Run the package function
			var pkg = { };
			definition.package(pkg);
			storeToNamespace(packageName, pkg);
			// When the package function finishes running, clean up by running any
			// callback that has been registered.
			packages[packageName].loaded = true;
			packages[packageName].after();
		};
		// Load required packages
		for (var i = 0, c = prereqs.length; i < c; i++) {
			(function(pkg) {
				if (! packages.hasOwnProperty(pkg)) {
					packages[pkg] = {
						loaded: false,
						after: Callstack(checkPackagesLoaded)
					};
				} else if (! packages[pkg].loaded) {
					packages[pkg].after.push(checkPackagesLoaded);
				}
				loadScriptFile($.path(pkg));
			}(prereqs[i]));
		}
		checkPackagesLoaded();
	};
	
// ------------------------------------------------------------------
//  Define the PackageError constructor
	
	$.PackageError = function(msg) {
		Error.call(this, msg);
		this.name = 'PackageError';
		this.message = msg;
	};
	$.PackageError.prototype = new Error();
	
// ------------------------------------------------------------------
//  Path control
	
	$.path = (function() {
		var path = '/';
		var func = function(pkg) {
			if (pkg) {
				return path + pkg.split('.').join('/') + '.js';
			}
			return path;
		};
		func.set = function(setTo) {
			if (typeof setTo === 'string') {
				path = setTo;
				if (path.charAt(path.length - 1) !== '/') {
					path += '/';
				}
			}
		};
		return func;
	}());
	
// ------------------------------------------------------------------
//  Dynamic package loader

	$.require = function(package, after) {
		if (packages[package]) {
			// If the package is already loaded, just run the callback
			if (packages[package].loaded) {
				after();
			}
			// If it's being loaded, add the callback to the stack
			else {
				packages[package].after.push(after);
			}
		}
		// If not loaded/loading, load the package
		else {
			packages[package] = {
				loaded: false,
				after: Callstack(after)
			};
			loadScriptFile($.path(package));
		}
	};

// ------------------------------------------------------------------
//  Helper functions
	
	// Includes a JavaScript file
	function loadScriptFile(src) {
		var script = doc.createElement('script');
		script.charset = 'utf-8';
		script.type = 'text/javascript';
		script.src = src;
		var last = doc.getElementsByTagName('script');
		root.insertBefore(script, last[last.length - 1]);
	};
	
	// A stackable function
	// Example:
	//  var func = Callstack();
	//  func.push(function() { });
	//  func.push(function() { });
	//  func();
	function Callstack(func) {
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
			arr.push.apply(arr, arguments);
		};
		if (typeof func === 'function') {
			arr.push(func);
		}
		return ret;
	};
	
	// Store the given value in the given location ns in the global scope
	function storeToNamespace(ns, value) {
		ns = ns.split('.');
		var current = window;
		for (var i = 0, c = ns.length - 1; i < c; i++) {
			if (typeof current[ns[i]] !== 'object') {
				current[ns[i]] = { };
			}
			current = current[ns[i]];
		}
		current[ns.pop()] = value;
	};
	
// ------------------------------------------------------------------
//  Expose
	
	return $;
	
}());

/* End of file core.js */
