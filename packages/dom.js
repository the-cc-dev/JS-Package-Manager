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
 */

$('dom', {
	require: ['css'],
	package: function(pkg) {
		
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
		
	}
});

/* End of file dom.js */
