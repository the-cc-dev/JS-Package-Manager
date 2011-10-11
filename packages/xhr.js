/**
 * XHR Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 *
 * ------------------------------------------------------------------
 *
 * Methods:
 *   void     xhr.config ( object cfg )
 *   boolean  xhr.supported ( void )
 *   object   xhr.request ( string url, object options )
 *   object   xhr.get ( string url, function callback )
 *   object   xhr.post ( string url, function callback )
 *   object   xhr.put ( string url, function callback )
 *   object   xhr.del ( string url, function callback )
 *   object   xhr.submitForm ( Element form, object options )
 * 
 * Constructors:
 *   xhr.XhrError ([ string message ]) <extends> Error
 */

$('xhr', {
	package: function(pkg) {
	
		var
		settings    = {
			url        : null,
			method     : 'GET',
			timeout    : 0,
			sync       : false,
			allowCache : true,
			data       : null,
			headers    : {
				'X-Requested-With': 'XMLHttpRequest'
			}
		},
		isRunning   = false,
		queue       = [ ],

		// According the the XMLHttpRequest specification, any string should be allowed
		// as an HTTP method (exluding the 3 listed as insecure), not just those defined
		// in the HTTP RFCs. If this flag is set to false, only recognized methods (those
		// listed in the array below) will be allowed to be given.
		strictMode  = true,
		
		methods     = ['GET', 'POST', 'HEAD', 'DELETE', 'PUT', 'OPTIONS', 'CONNECT', 'TRACE', 'TRACK'],
		badMethods  = ['CONNECT', 'TRACE', 'TRACK'];
		
	// ------------------------------------------------------------------
	//  Public methods
		
		/**
		 * Changes default config values
		 */
		pkg.config = function(cfg) {
			for (var i in cfg) {
				if (cfg.hasOwnProperty(i)) {
					settings[i] === cfg[i];
				}
			}
		};
		
		/**
		 * XHR Error Class
		 *
		 * @access  public
		 * @param   string    the error message
		 */
		pkg.XhrError = $.defineError('XhrError');

		/**
		 * Check if AJAX is supported
		 *
		 * @access  public
		 * @return  boolean
		 */
		pkg.supported = (function() {
			var flag = null;
			return function() {
				if (flag === null) {
					flag =!! getXHR();
				}
				return flag;
			};
		}());

		/**
		 * Make an AJAX request
		 *
		 * @access  public
		 * @param   string    the URL
		 * @param   object    the options
		 * @return  XMLHttpRequest
		 */
		pkg.request = function(url, options) {
			options.url = url;
			return makeRequest(options);
		};
		
		/**
		 * Shortcut request methods for get, post, put, and delete
		 *
		 * @access  public
		 * @param   string    the URL
		 * @param   function  callback
		 * @return  XMLHttpRequest
		 */
		var shortcuts = ['get', 'post', 'put', 'del'];
		for (var i = 0, c = shortcuts.length; i < c; i++) {
			(function(method) {
				var reqMethod = (method === 'del') ? 'delete' : method;
				pkg[method] = function(url, after) {
					return makeRequest({
						url: url,
						method: reqMethod,
						callback: after
					});
				};
			}(shortcuts[i]));
		}

		/**
		 * Submit a form using AJAX
		 *
		 * @access  public
		 * @param   element   the form element
		 * @param   mixed     a callback/an options object
		 * @return  XMLHttpRequest
		 */
		pkg.submitForm = function(form, options) {
			// Check for a callback given as param 2
			var callback = (typeof options === 'function') ? options : null;
			if (typeof options !== 'object') {
				var options = { };
			}
			// Add the callback to the options object
			if (callback) {
				options.callback = callback;
			}
			// Get the request method
			options.method = options.method || form.getAttribute('method') || form.method;
			if (options.method == null || options.method === '') {
				options.method = 'GET';
			}
			// Get the URL
			options.url = options.url || form.getAttribute('action') || form.action;
			if (options.url == null || options.url === '') {
				options.url = window.location + '';
			}
			// Get the form data
			options.data = serializeForm(form);
			// Run the request
			return makeRequest(options);
		};

	// ----------------------------------------------------------------------------
	//  Internal functions

		/**
		 * Make an AJAX request
		 *
		 * @access  private
		 * @param   object    the request options
		 * @param   boolean   is this request from the queue?
		 * @return  object
		 */
		function makeRequest(options, fromQueue) {
			if (typeof options !== 'object') {
				var options = { };
			}
			// Merge in the default settings
			options = merge(settings, options);
			// Make sure the request method is valid
			options.method = options.method.toUpperCase();
			if (! strictMode && ! contains(methods, options.method)) {
				throw new pkg.XhrError(options.method + '" is not a valid HTTP method');
			}
			if (contains(badMethods, options.method)) {
				throw new pkg.XhrError(options.method + '" is not allowed for XHR requests as it is considered insecure');
			}
			// If there is already a request running, queue this one
			if (! fromQueue && (isRunning || queue.length)) {
				queue.push(options);
				return;
			}
			debug.log(options.method + ' ' + options.url);
			isRunning = true;
			// Create the XHR object
			var xhr = getXHR();
			// Open the request
			xhr.open(options.method, options.url, (! options.sync));
			// If caching isn't allowed
			if (! options.allowCache) {
				options.url += ((options.url.indexOf('?') > -1) ? '&' : '?') + 'nocache=' + (new Date()).getTime();
			}
			// Handle any data
			if (options.data) {
				// If the data is in object form, serialize it
				if (typeof options.data === 'object') {
					options.data = serializeRequestData(options.data);
				}
				// Data is passed as a URL query string
				if (options.method === 'GET' || options.method === 'HEAD') {
					if (options.url.indexOf('?') === -1) {
						options.data = '?' + options.data;
					}
					options.url += options.data;
					options.data = null;
				}
				// For a request body, extra headers are needed
				else {
	//				xhr.setRequestHeader('Connection', 'close');
					xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	//				xhr.setRequestHeader('Content-Length', options.data.length);
				}
			} else {
				options.data = null;
			}
			// Set request headers
			if (typeof options.headers === 'object' && options.headers) {
				for (var i in options.headers) {
					if (options.headers.hasOwnProperty(i)) {
						xhr.setRequestHeader(i, options.headers[i]);
					}
				}
			}
			// Build the callback
			var timer = null,
			timedout = false,
			callbackFired = false,
			after = function() {
				// Make sure if there's a timeout that it has been canceled
				window.clearTimeout(timer);
				callbackFired = true;
				timedout = timedout || arguments[0] || false;
				var
				response = null,
				result = 'success';
				// Check for a timeout
				if (timedout) {
					result = 'timeout';
				}
				// Check for an error
				else if (xhr.status >= 400) {
					result = 'error';
				}
				// Get the response
				response = xhr.responseText;
				// Run the callback
				if (typeof options.callback === 'function') {
					options.callback({
						status: result,
						response: response,
						xhr: xhr,
						retry: function() {
							makeRequest(options);
						}
					});
				}
				// If there are queued requests, keep going
				isRunning = false;
				if (queue.length) {
					window.setTimeout(function() {
						makeRequest(queue.shift(), true);
					}, 1);
				}
			};
			// Handle a synchronous request
			if (options.sync) {
				// Send the request
				xhr.send(options.data);
				// Run the callback
				after();
			}
			// Handle an asynchronous request
			else {
				// Set the readystatechage handler
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {after();}
				};
				// If there is a timeout, set it
				if (options.timeout) {
					timer = window.setTimeout(function() {
						timedout = true;
						xhr.abort();
						window.setTimeout(function() {
							if (! callbackFired) {
								after(true);
							}
						}, 10);
					}, options.timeout);
				}
				// Send the request
				xhr.send(options.data);
			}
			return xhr;
		};

		/**
		 * Alias for Array.prototype.slice
		 *
		 * @access  private
		 * @param   mixed     the thing to slice
		 * @return  array
		 */
		function slice(arr) {
			var ret;
			try {
				ret = Array.prototype.slice.call(arr, 0);
			} catch (e) {
				ret = [ ];
				for (var i = 0, c = arr.length; i < c; i++) {
					ret[i] = arr[i];
				}
			}
			return ret;
		};

		/**
		 * Get an ActiveXObject
		 *
		 * @access  private
		 * @param   mixed     the type(s)
		 * @return  object
		 */
		function AXO(type) {
			if (window.ActiveXObject) {
				if (typeof type === 'string') {
					var obj;
					try {
						obj = new ActiveXObject(type);
					} catch (e) { obj = false; }
					return obj;
				} else if (typeof type === 'object' && typeof object.length === 'number') {
					var obj;
					for (var i = 0, c = type.length; i < c; i++) {
						if (obj = AXO(type[i])) { break; }
					}
					return obj;
				}
			} else { return false; }
		};

		/**
		 * Get an XMLHttpRequest object
		 *
		 * @access  private
		 * @return  object
		 */
		function getXHR() {
			var xmlhttp;
			// Standards Compliant
			if (window.XMLHttpRequest) {
				xmlhttp = new window.XMLHttpRequest();
			}
			// Internet Explorer < 8
			else {
				xmlhttp = AXO(['MSXML2.XMLHTTP.6.0', 'MSXML3.XMLHTTP', 'Microsoft.XMLHTTP', 'MSXML2.XMLHTTP.3.0']);
			}
			return xmlhttp;
		};

		/**
		 * Check if an array contains a value
		 *
		 * @access  private
		 * @param   array     the array to search
		 * @param   mixed     the value to search for
		 * @return  boolean
		 */
		function contains(arr, item) {
			for (var i = 0, c = arr.length; i < c; i++) {
				if (arr[i] === item) {return true;}
			}
			return false;
		};

		/**
		 * Serializes request data into a query string
		 *
		 * @access  private
		 * @param   object    the data to serialize
		 * @return  string
		 */
		function serializeRequestData(data) {
			var queryItems = [ ];
			for (var i in data) {
				if (data.hasOwnProperty(i)) {
					var name = encodeURIComponent(i);
					switch (typeof data[i]) {
						case 'object':
							// Handle objects
							if (data[i]) {
								// Handle arrays
								if (data[i].propertyIsEnumerable('length')) {
									for (var j = 0, c = data[i].length; j < c; j++) {
										queryItems.push(name + '[]=' + encodeURIComponent(data[i][j] + ''));
									}
								}
							}
							// Handle null
							else {
								queryItems.push(name + '=NULL');
							}
						break;
						case 'function':
						case 'undefined':
							// Ignore functions and undefined...
						break;
						default:
							// Handle primatives
							queryItems.push(name + '=' + encodeURIComponent(data[i]));
						break;
					}
				}
			}
			return queryItems.join('&');
		};

		/**
		 * Clone a variable
		 *
		 * @access  private
		 * @param   mixed     the value to clone
		 * @return  mixed
		 */
		function clone(obj) {
			var ret;
			if (typeof obj === 'object' && obj) {
				ret = new (obj.constructor || Object)();
				for (var i in obj) {
					if (obj.hasOwnProperty(i)) {
						ret[i] = clone(obj[i]);
					}
				}
			} else {
				ret = obj;
			}
			return ret;
		};

		/**
		 * Merge the properties of obj2 onto a clone of obj1
		 *
		 * @access  private
		 * @param   object    the base object
		 * @param   object    the donor object
		 * @return  object
		 */
		function merge(obj1, obj2) {
			obj1 = clone(obj1);
			for (var i in obj2) {
				if (obj2.hasOwnProperty(i)) {
					if (typeof obj1[i] === 'object' && obj1[i] && typeof obj2[i] === 'object' && obj2[i]) {
						obj1[i] = merge(obj1[i], obj2[i]);
					} else {
						obj1[i] = clone(obj2[i]);
					}
				}
			}
			return obj1;
		};

		/**
		 * Serialize the values in a form
		 *
		 * @access  private
		 * @param   element   the form to submit
		 * @return  string
		 */
		function serializeForm(form) {
			var resultItems = [ ];
			var fields = slice(form.getElementsByTagName('input')).concat(
				slice(form.getElementsByTagName('textarea'))).concat(
				slice(form.getElementsByTagName('select')));
			for (var i = 0, c = fields.length; i < c; i++) {
				var field = fields[i], name, value;
				// Encode the field name
				if (field.name.indexOf('[') > -1) {
					name = field.name.split('[');
					name = encodeURIComponent(name[0]) + '[' + name[1];
				} else {
					name = encodeURIComponent(field.name);
				}
				// Encode the field value
				value = encodeURIComponent(field.value);
				// Add the name/value pair to the items list
				resultItems.push(name + '=' + value);
			}
			return resultItems.join('&');
		};
	
	}
});

/* End of file xhr.js */
