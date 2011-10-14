/**
 * Effects Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 * @depends    Packages: css, color, datetime, utils
 *
 * ------------------------------------------------------------------
 *
 * Methods:
 *   void      fx.config ( object options )
 *   void      fx.animate ( Element element, object options )
 *
 * Constructors:
 *   fx.Animation ( object options )
 *     void      fx.Animation::start ( void )
 *     void      fx.Animation::stop ( void )
 */

$('fx', {
	require: ['css', 'color', 'datetime', 'utils'],
	package: function(pkg) {
		
		var _defaults = {
			changes: { },
			duration: 600,
			element: null,
			onredraw: null,
			oncomplete: null,
			algorithm: 'easeInQuad'
		};
		
		/**
		 * Change the default options
		 */
		pkg.config = function(options) {
			utils.mergeRecursive(_defaults, options);
		};
		
		/**
		 * Animation constructor
		 */
		pkg.Animation = function(options) {
			var self = this;
			
			// Merge in the default options
			options = utils.mergeRecursive({ }, _defaults, options);
			
			// Create the control tween
			var tween = new datetime.Tween({
				useraf: true,
				total: options.duration,
				algo: options.algorithm,
				after: function() {
					if (utils.vartype.isFunction(options.oncomplete)) {
						options.oncomplete.call(self);
					}
				},
				func: drawFrame
			});
			
			// Calculate info about changes
			var changes = (function() {
				var ret = { };
				for (var i in options.changes) {
					if (options.changes.hasOwnProperty(i)) {
						ret[i] = new AnimationProperty(options.element, i, options.changes[i]);
					}
				}
				return ret;
			}());
			
			// Draw a new frame
			var hasRedrawEvent = utils.vartype.isFunction(options.onredraw);
			function drawFrame(state) {
				// Make the needed changes
				for (var i in changes) {
					if (changes.hasOwnProperty(i)) {
						css.set(options.element, changes[i].property, changes[i].atState(state));
					}
				}
				// If there is a redraw event registered, call it
				if (hasRedrawEvent) {
					options.onredraw.call(self, state);
				}
			}
			
			// Start animating
			var initialized = false;
			this.start = function() {
				if (! initialized) {
					initialized = true;
					for (var i in changes) {
						if (changes.hasOwnProperty(i)) {
							changes[i].init();
						}
					}
				}
				tween.start();
			};
			
			// Stop animating
			this.stop = function() {
				tween.stop();
			};
			
		};
		
	// ------------------------------------------------------------------
	//  Shortcut methods
		
		pkg.animate = function(element, options) {
			options.element = element;
			(new pkg.Animation(options)).start();
		};
		
		pkg.fadeOut = function(element, duration, callback) {
			pkg.animate(element, {
				duration: duration,
				changes: { opacity: 0 },
				oncomplete: callback
			});
		};
		
		pkg.fadeIn = function(element, duration, callback) {
			pkg.animate(element, {
				duration: duration,
				changes: { opacity: 1 },
				oncomplete: callback
			});
		};
		
	// ------------------------------------------------------------------
	//  Internal helpers
		
		var propertyTypes = {
			int: ['zIndex'],
			float: ['lineHeight', 'opacity'],
			measure: [
				'width', 'height', 'top', 'right', 'bottom', 'left',
				'borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'
				
			],
			color: [
				'color', 'backgroundColor',
				'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'
			]
		};
		
		function lookupPropertyType(property) {
			for (var type in propertyTypes) {
				if (propertyTypes.hasOwnProperty(type)) {
					for (var i = 0, c = propertyTypes[type].length; i < c; i++) {
						if (propertyTypes[type][i] === property) {
							return type;
						}
					}
				}
			}
			return false;
		}
		
	// ------------------------------------------------------------------
	//  AnimationProperty constructors
		
		function AnimationProperty(element, property, result) {
			this.type      = lookupPropertyType(property);
			this.element   = element;
			this.property  = property;
			this.result    = result;
			this.start     = null;
			this.end       = null;
			this.delta     = null;
			animationPropertyTypes[this.type].call(this);
		}
		
		var animationPropertyTypes = {
			// Int type methods
			int: function() {
				this.init = function() {
					this.start = parseInt(css.get(this.element, this.property));
					this.end   = parseInt(this.result);
					this.delta = this.end - this.start;
				};
				this.atState = function(state) {
					return this.start + this.delta * state;
				};
			},
			// Float type methods
			float: function() {
				this.init = function() {
					this.start = parseFloat(css.get(this.element, this.property));
					this.end   = parseFloat(this.result);
					this.delta = this.end - this.start;
				};
				this.atState = function(state) {
					return this.start + this.delta * state;
				};
			},
			// Measure type methods
			measure: function() {
				this.init = function() {
					this.start = parseFloat(css.get(this.element, this.property));
					this.end   = parseFloat(this.result);
					this.delta = this.end - this.start;
				};
				this.atState = function(state) {
					return (this.start + this.delta * state) + 'px';
				};
			},
			// Color type methods
			color: function() {
				var format = 'rgb' + (css.supportsRgba() ? 'a' : '');
				this.init = function() {
					this.start = new color.Color(css.get(this.element, this.property));
					if (typeof this.result === 'object') {
						this.end = this.start.clone();
						for (var i in this.result) {
							if (this.result.hasOwnProperty(i)) {
								this.end.setChannel(i, this.result[i]);
							}
						}
					} else {
						this.end = new color.Color(this.result);
					}
					this.delta = new color.ColorDiff(this.start, this.end);
				};
				this.atState = function(state) {
					return this.delta.atPosition(state).formatted(format);
				};
			}
		};
		
	}
});

/* End of file fx.js */
