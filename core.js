/**
 * Core package loader library
 */

var $ = (function() {
	
	var doc = document;
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
			var pkg = PackageNamespace();
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
					loadScriptFile($.path(pkg));
				} else if (! packages[pkg].loaded) {
					packages[pkg].after.push(checkPackagesLoaded);
				}
			}(prereqs[i]));
		}
		checkPackagesLoaded();
	};
	
	$.packageLoaded = function(pkg) {
		return (packages.hasOwnProperty(pkg) && packages[pkg].loaded);
	};
	
// ------------------------------------------------------------------
//  Package namespace constructor
	
	function PackageNamespace(name) {
		var ret = function() {
			if (typeof ret.__invoke === 'function') {
				return ret.__invoke.apply(ret, arguments);
			} else {
				throw new $.PackageError('Cannot invoke package namespace; no __invoke method is defined.');
			}
		};
		
		
		
		return ret;
	};
	
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
				if (path.length && path.charAt(path.length - 1) !== '/') {
					path += '/';
				}
			}
		};
		return func;
	}());
	
// ------------------------------------------------------------------
//  Configuration control

	$.config = function(opts) {
		for (var i in opts) {
			if (opts.hasOwnProperty(i)) {
				switch (i) {
					case 'path':
						$.path.set(opts[i]);
					break;
					case 'useMinified':
						useMinified =!! opts[i];
					break;
					default:
						// unknown config option. do nothing.
					break;
				}
			}
		}
	};
	
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
//  Method for easily defining new Error classes

	$.defineError = function(name, init) {
		var constructor = function(message) {
			Error.call(this, message);
			this.name = name;
			this.message = message;
			this.stack = (function() {
				var err;
				try { (0)(); } catch (e) { err = e; }
				return (err.stack || err.stacktrace || void(0));
			}());
			if (typeof init === 'function') {
				init.apply(this, arguments);
			}
		};
		constructor.prototype = new Error();
		return constructor;
	};
	
// ------------------------------------------------------------------
//  Define the PackageError constructor
	
	$.PackageError = $.defineError('PackageError');

// ------------------------------------------------------------------
//  Helper functions
	
	// Includes a JavaScript file
	function loadScriptFile(src) {
		var script = doc.createElement('script');
		script.charset = 'utf-8';
		script.type = 'text/javascript';
		script.src = src;
		var last = doc.getElementsByTagName('script');
		last = last[last.length - 1];
		last.parentNode.insertBefore(script, last);
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
				current[ns[i]] = new PackageNamespace();
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
