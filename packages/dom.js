/**
 * DOM Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 * @depends    Packages: css
 *
 * ------------------------------------------------------------------
 *
 * Methods:
 *   Element  dom.createElement ([ string tag = 'div'[, object attrs ]])
 *   Node     dom.insertBefore ( Node node, Node ref )
 *   Node     dom.insertAfter ( Node node, Node ref )
 *   boolean  dom.hasClass ( Element element, string classname )
 *   void     dom.addClass ( Element element, string classname )
 *   void     dom.removeClass ( Element element, string classname )
 */

$('dom', {
	require: ['css'],
	package: function(pkg) {
		
		var classRegexes = { };
		function createClassRegex(cn) {
			classRegexes[cn] = new RegExp('(^|\\s)+' + cn + '(\\s|$)+', 'g');
		}
		
		/**
		 * Create a DOM element
		 *
		 * @access  public
		 * @param   string    the tag name
		 * @param   object    attributes
		 * @return  object
		 */
		pkg.createElement = function(tag, attrs) {
			var parent;
			var elem = document.createElement(tag || 'div');
			var after = function() { };
			if (attrs) {
				document.body.appendChild(elem);
				for (var i in attrs) {
					if (attrs.hasOwnProperty(i)) {
						switch (i) {
							case 'style':
								css.set(elem, attrs[i]);
							break;
							case 'parentNode':
								parent = attrs[i];
							break;
							case 'after':
								after = attrs[i];
							break;
							default:
								elem[i] = attrs[i];
							break;
						}
					}
				}
				document.body.removeChild(elem);
			}
			if (parent) {
				parent.appendChild(elem);
			}
			after(elem);
			return elem;
		};
		
		/**
		 * Insert one DOM node before another
		 *
		 * @access  public
		 * @param   object    new node
		 * @param   object    old node
		 * @return  object
		 */
		pkg.insertBefore = function(node, ref) {
			if (ref.parentNode) {
				ref.parentNode.insertBefore(node, ref);
			}
			return node;
		};
		
		/**
		 * Insert one DOM node after another
		 *
		 * @access  public
		 * @param   object    new node
		 * @param   object    old node
		 * @return  object
		 */
		pkg.insertAfter = function(node, ref) {
			if (ref.parentNode) {
				if (ref.nextSibling) {
					ref.parentNode.insertBefore(node, ref.nextSibling);
				} else {
					ref.parentNode.appendChild(node);
				}
			}
			return node;
		};
		
		/**
		 * Check if an element has a given classname
		 *
		 * @access  public
		 * @param   object    the element
		 * @param   string    the class name
		 * @return  boolean
		 */
		pkg.hasClass = function(element, cn) {
			if (! classRegexes[cn]) {
				createClassRegex(cn);
			}
			return classRegexes[cn].test(element.className);
		};
		
		/**
		 * Add a classname to an element
		 *
		 * @access  public
		 * @param   object    the element
		 * @param   string    the class name
		 * @return  void
		 */
		pkg.addClass = function(element, cn) {
			if (! pkg.hasClass(element, cn)) {
				element.className += (element.className.length ? ' ' : '') + cn;
			}
		};
		
		/**
		 * Remove a classname from an element
		 *
		 * @access  public
		 * @param   object    the element
		 * @param   string    the class name
		 * @return  void
		 */
		pkg.removeClass = function(element, cn) {
			if (pkg.hasClass(element, cn)) {
				element.className = element.className.replace(classRegexes[cn], ' ');
			}
		};
		
	}
});

/* End of file dom.js */
