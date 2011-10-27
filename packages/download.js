/**
 * File Download Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 *
 * ------------------------------------------------------------------
 *
 * Methods:
 *   void     download.go ( string url[, object postParams ])
 */

$('download', {
	package: function(pkg) {
		
		// How long do we wait before removing the element
		var timeout = 20000;
		
		// Make a download request to a given URL
		pkg.go = function(url, postParams) {
			return makeRequest(url, postParams);
		};
	
	// ------------------------------------------------------------------
	//  Internals
		
		// Make the download request
		function makeRequest(url, postParams) {
			var frame = getFrame(), form;
			if (postParams) {
				form = postToFrame(frame, url, postParams);
			} else {
				frameDoc(frame).location.assign(url);
			}
			// After the allotted time, remove the involved elements from the DOM
			setTimeout(function() {
				if (frame.parentNode) {
					frame.parentNode.removeChild(frame);
				}
				if (form && form.parentNode) {
					form.parentNode.removeChild(form);
				}
				frame = form = null;
			}, timeout);
		}
		
		// Build an iframe for making the request
		function getFrame() {
			var id = 'ifr' + (+new Date), frame;
			try {
				// Fix the IE7- bug with assigning the name attribute
				frame = document.createElement('<iframe name="' + id + '"/>');
				// Make sure some other browser didn't fail silently
				if (! frame || frame.nodeName.toLowerCase() !== 'iframe' || frame.name !== id) {
					throw null;
				}
			} catch (e) {
				// Create the frame for every other browser
				frame = document.createElement('iframe');
				frame.name = id;
			}
			frame.id = id;
			hideElement(frame);
			frame = document.body.appendChild(frame);
			if (document.frames) {
				frame = document.frames[id];
			}
			return frame;
		}
		
		// Send a POST request via the given iframe
		function postToFrame(frame, data) {
			var form = document.createElement('form');
			hideElement(form);
			form.target = frame.id;
			form.innerHTML = buildFormInputs(data);
			form = document.body.append(form);
			form.submit();
		}
		
		// Build a string of inputs from a data object
		function buildFormInputs(data, nestUnder) {
			var i, c, name, value;
			var formContent = '';
			var inputName = (nestUnder ?
				function(name) { return name; } :
				function(name) {
					return nestUnder + '[' + name + ']';
				}
			);
			if (nestUnder && isArray(data)) {
				name = inputName('');
				for (i = 0, c = data.length; i < c; i++) {
					formContent += input(name, data[i]);
				}
			} else {
				for (i in data) {
					if (data.hasOwnProperty(i)) {
						name = inputName(i);
						value = (data[i] === null) ? 'NULL' : data[i];
						if (typeof value === 'object') {
							formContent += buildFormInputs(data[i], name);
						} else {
							formContent += input(name, value);
						}
					}
				}
			}
			return formContent;
		}
		
		// Create an input with a given name and value
		function input(name, value) {
			return '<input type="hidden" name="' + name + '" value="' + value + '" />';
		}
		
		// Check if a value is an array
		function isArray(value) {
			return Object.prototype.toString.call(value) === '[object Array]';
		}
		
		// Hide an element while keeping iframes usable
		function hideElement(element) {
			element.border = 0;
			element.style.height = '10px';
			element.style.width = '10px';
			element.style.border = '0px';
			element.style.positiion = 'fixed';
			element.style.top = '10px';
			element.style.bottom = '10px';
			element.style.visibility = 'hidden';
		}
		
		// Get the document object of an iframe
		function frameDoc(frame) {
			if ('contentDocument' in frame) {
				return frame.contentDocument;
			} else if ('contentWindow' in frame) {
				return frame.contentWindow.document;
			} else if ('document' in frame) {
				return frame.document;
			} else {
				return false;
			}
		}
		
	}
});

/* End of file download.js */
