/**
 * Color Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 * @depends    Packages: utils
 *
 * ------------------------------------------------------------------
 *
 * Properties:
 *   object    color.colorNames { aqua, black, blue, fuchsia, gray, green, lime,
 *                                maroon, navy, olive, purple, red, silver, teal,
 *                                white, yellow }
 *
 * Methods:
 *   array     color.parse ( string value )
 *   array     color.rgbTo.hex ( array rgb )
 *   array     color.rgbTo.hsl ( array rgb )
 *   array     color.rgbTo.hsv ( array rgb )
 *   array     color.rgbTo.cmy ( array rgb )
 *   array     color.rgbTo.cmyk ( array rgb )
 *   array     color.rgbFrom.hex ( array hex )
 *   array     color.rgbFrom.hsl ( array hsl )
 *   array     color.rgbFrom.hsv ( array hsv )
 *   array     color.rgbFrom.cmy ( array cmy )
 *   array     color.rgbFrom.cmyk ( array cmyk )
 *
 * Constructors:
 *   color.Color ( void )
 *   color.Color ( string color )
 *   color.Color ( string type, array value )
 *     void         color.Color::set ( string value )
 *     void         color.Color::set ( string format, array value )
 *     mixed        color.Color::get ( string value )
 *     void         color.Color::addEventListener ( string event, function callback )
 *     void         color.Color::removeEventListener ( string event, function callback )
 *     void         color.Color::dispatchEvent ( string event )
 *     color.Color  color.Color::clone ( void )
 *     string       color.Color::formatted ( string type )
 *     void         color.Color::setOpacity ( number opac )
 *     void         color.Color::setRGBChannel ( string channel, number value )
 *     void         color.Color::shiftRGBChannel ( string channel, number value )
 *     void         color.Color::setCMYChannel ( string channel, number value )
 *     void         color.Color::shiftCMYChannel ( string channel, number value )
 *     void         color.Color::setHSLChannel ( string channel, number value )
 *     void         color.Color::shiftHSLChannel ( string channel, number value )
 *     number       color.Color::getChannel ( string channel )
 *     void         color.Color::setChannel ( string channel, number value )
 *     void         color.Color::shiftChannel ( string channel, number value )
 *     array        color.Color::rgbDiff ( mixed other )
 *     void         color.Color::inverse ( void )
 *     void         color.Color::mix ( mixed other, number ratio )
 *   color.ColorDiff ( mixed first, mixed second )
 *     color.Color  color.ColorDiff::first ( void )
 *     color.Color  color.ColorDiff::second ( void )
 *     color.Color  color.ColorDiff::atPosition ( number position )
 */

$('color', {
	require: ['utils'],
	package: function(pkg) {
		
		// The places of various channels in color values stored here
		// for easy lookup
		var _channels = {
			rgb: {
				r: 0, g: 1, b: 2
			},
			cmy: {
				c: 0, m: 1, y: 2
			},
			hsl: {
				h: 0, s: 1, l: 2
			}
		};
		
		// Rules object for utils.inforce()
		var _rgbRules = { min: 0, max: 255, places: 0 };
		
		/*
		 * The 16 valid color names as defined by the W3C
		 * and their rgb color codes in array format.
		 *
		 * @var  object  colorNames
		 */
		pkg.colorNames = {
			aqua:    [0, 255, 255],
			black:   [0, 0, 0],
			blue:    [0, 0, 255],
			fuchsia: [255, 0, 255],
			gray:    [128, 128, 128],
			green:   [0, 128, 0],
			lime:    [0, 255, 0],
			maroon:  [128, 0, 0],
			navy:    [0, 0, 128],
			olive:   [128, 128, 0],
			purple:  [128, 0, 128],
			red:     [255, 0, 0],
			silver:  [192, 192, 192],
			teal:    [0, 128, 128],
			white:   [255, 255, 255],
			yellow:  [255, 255, 0]
		};
		
	// ------------------------------------------------------------------
	//  Color Constructor
		
		pkg.Color = function() {
			var rgb, alpha,
			
			eventHandles = {
				change: [ ]
			};
			
			function inforceRules() {
				if (rgb) {
					rgb[0] = utils.inforce(rgb[0], _rgbRules);
					rgb[1] = utils.inforce(rgb[1], _rgbRules);
					rgb[2] = utils.inforce(rgb[2], _rgbRules);
				}
				if (utils.vartype.isSet(alpha)) {
					alpha = utils.inforce(alpha, {
						min: 0, max: 1, places: 2
					});
				}
			}
			
			/**
			 * Sets the color value
			 *
			 * @access  public
			 * @param   string    the color string
			 * @return  void
			 */
			this.set = function() {
				// Parse the given arguments
				switch (arguments.length) {
					case 2:
						var type = arguments[0];
						var color = arguments[1];
						var hasAlpha = (type.charAt(type.length - 1) === 'a');
						if (hasAlpha) {
							type = type.slice(0, -1);
						}
						if (type === 'rgb') {
							rgb = utils.toArray(color);
						} else {
							rgb = pkg.rgbFrom[type](color);
						}
						if (hasAlpha) {
							alpha = rgb.pop();
						} else {
							alpha = 1;
						}
					break;
					case 1:
						if (rgb = pkg.parse(arguments[0])) {
							alpha = rgb.pop();
						} else {
							throw new Error('color.Color: parse error: invalid color string given');
						}
					break;
					case 0:
						rgb = null;
						alpha = null;
					break;
					default:
						throw new Error('color.Color: too many parameters given');
					break;
				}
				inforceRules();
				this.dispatchEvent('change');
			};
		
			/**
			 * Gets color values
			 *
			 * @access  public
			 * @param   string    the value to fetch (eg. "rgb", "hsla", "alpha")
			 * @return  mixed
			 */
			this.get = function(value) {
				var ret;
				value = value || 'rgb';
				if (value === 'opacity' || value === 'alpha') {
					ret = alpha;
				} else {
					var _rgb = utils.toArray(rgb);
					var needsAlpha = (value.charAt(value.length - 1) === 'a');
					if (needsAlpha) {
						_rgb.push(alpha);
						value = value.slice(0, -1);
					}
					ret = (value === 'rgb') ? _rgb : pkg.rgbTo[value](_rgb);
					roundColor(value, ret, needsAlpha);
				}
				return ret;
			};
			
			/**
			 * Add an event listener
			 *
			 * @access  public
			 * @param   string    the event name
			 * @param   function  callback
			 * @return  void
			 */
			this.addEventListener = function(event, func) {
				if (eventHandles.hasOwnProperty(event)) {
					if (! utils.vartype.isFunction(func)) {
						throw new TypeError('color.Color: addEventListener expected a function');
					}
					eventHandles[event].push(func);
				}
			};
			
			/**
			 * Remove an event listener
			 *
			 * @access  public
			 * @param   string    the event name
			 * @param   function  callback
			 * @return  void
			 */
			this.removeEventListener = function(event, func) {
				if (eventHandles.hasOwnProperty(event)) {
					if (! utils.vartype.isFunction(func)) {
						throw new TypeError('color.Color: removeEventListener expected a function');
					}
					var result = [ ];
					var funcs = eventHandles[event];
					for (var i = 0, c = funcs.length; i < c; i++) {
						if (funcs[i] !== func) {
							result.push(funcs[i]);
						}
					}
					eventHandles[event] = result;
				}
			};
			
			/**
			 * Dispatch an event listener
			 *
			 * @access  public
			 * @param   string    the event type
			 * @return  void
			 */
			this.dispatchEvent = function(event) {
				if (eventHandles.hasOwnProperty(event)) {
					var funcs = eventHandles[event];
					for (var i = 0, c = funcs.length; i < c; i++) {
						funcs[i].call(this);
					}
				}
			};
			
			/**
			 * Creates a clone of the color object
			 *
			 * @access  public
			 * @return  pkg.Color
			 */
			this.clone = function() {
				var color = new pkg.Color('rgba', this.get('rgba'));
				for (var event in eventHandles) {
					if (eventHandles.hasOwnProperty(event)) {
						for (var i = 0, c = eventHandles[event].length; i < c; i++) {
							color.addEventListener(event, eventHandles[event][i]);
						}
					}
				}
				return color;
			};
			
			/**
			 * Removes all stored data
			 *
			 * @access  public
			 * @return  void
			 */
			this.reset = function() {
				rgb = alpha = eventHandles = null;
			};
			
			// Initiaize
			this.set.apply(this, arguments);
			
		};
		
		pkg.Color.prototype = {
			
			/**
			 * Get a formatted color string
			 *
			 * @access  public
			 * @param   string    the format to return
			 * @return  string
			 */
			formatted: function(type) {
				type = (type || 'rgb');
				var value = this.get(type);
				if (type === 'hex' || type === 'hexa') {
					return '#' + value.join('');
				} else {
					return type + '(' + value.join(',') + ')';
				}
			},
			
			/**
			 * Change the opacity of the current color
			 *
			 * @access  public
			 * @param   number    the new opacity
			 * @return  void
			 */
			setOpacity: function(opac) {
				var color = this.get('rgb');
				opac = utils.inforce(opac, {
					min: 0, max: 1, places: 2
				});
				color.push(opac);
				this.set('rgba', color);
			},
			
			/**
			 * Set a single RGB channel
			 *
			 * @access  public
			 * @param   string    the channel to change (eg. "r")
			 * @param   number    the new value (0-255)
			 * @return  void
			 */
			setRGBChannel: function(channel, value) {
				var color = this.get('rgba');
				channel = _channels.rgb[channel.toLowerCase()];
				color[channel] = utils.inforce(value, {
					min: 0, max: 255, places: 0
				});
				this.set('rgba', color);
			},
			
			/**
			 * Shift a single RGB channel
			 *
			 * @access  public
			 * @param   string    the channel to change (eg. "r")
			 * @param   number    the amount to shift (-255 - +255)
			 * @return  void
			 */
			shiftRGBChannel: function(channel, value) {
				var color = this.get('rgba');
				channel = _channels.rgb[channel.toLowerCase()];
				color[channel] = utils.inforce(color[channel] + value, {
					min: 0, max: 255, places: 0
				});
				this.set('rgba', color);
			},
			
			/**
			 * Set a single CMY channel
			 *
			 * @access  public
			 * @param   string    the channel to change (eg. "c")
			 * @param   number    the new value (0-1)
			 * @return  void
			 */
			setCMYChannel: function(channel, value) {
				var color = this.get('cmya');
				channel = _channels.cmy[channel.toLowerCase()];
				color[channel] = utils.inforce(value, {
					min: 0, max: 1, places: 2
				});
				this.set('cmya', color);
			},
			
			/**
			 * Shift a single CMY channel
			 *
			 * @access  public
			 * @param   string    the channel to change (eg. "c")
			 * @param   number    the amount to shift (-1 - +1)
			 * @return  void
			 */
			setCMYChannel: function(channel, value) {
				var color = this.get('cmya');
				channel = _channels.cmy[channel.toLowerCase()];
				color[channel] = utils.inforce(color[channel] + value, {
					min: 0, max: 1, places: 2
				});
				this.set('cmya', color);
			},
			
			/**
			 * Set a single HSL channel
			 *
			 * @access  public
			 * @param   string    the channel to change (eg. "h")
			 * @param   number    the new value (h: 0-360, sl: 0-1)
			 * @return  void
			 */
			setHSLChannel: function(channel, value) {
				var color = this.get('hsla');
				channel = _channels.hsl[channel.toLowerCase()];
				color[channel] = utils.inforce(value, (
					channel === 0 /* is hue */ ?
					{ min: 0, max: 360, places: 0, rotate: true } :
					{ min: 0, max: 1, places: 2 }
				));
				this.set('hsla', color);
			},
			
			/**
			 * Shift a single HSL channel
			 *
			 * @access  public
			 * @param   string    the channel to change (eg. "h")
			 * @param   number    the amount to shift (h: -360 - +360, sl: -1 - +1)
			 * @return  void
			 */
			shiftHSLChannel: function(channel, value) {
				var color = this.get('hsla');
				channel = _channels.hsl[channel.toLowerCase()];
				color[channel] = utils.inforce(color[channel] + value, (
					channel === 0 /* is hue */ ?
					{ min: 0, max: 360, places: 0, rotate: true } :
					{ min: 0, max: 1, places: 2 }
				));
				this.set('hsla', color);
			},
			
			/**
			 * Get a single channel
			 *
			 * @access  public
			 * @param   string    the channel (eg. "hue")
			 * @return  number
			 */
			getChannel: function(channel) {
				var getter;
				switch (channel) {
					case 'red':
					case 'green':
					case 'blue':
						getter = 'rgb';
					break;
					case 'cyan':
					case 'magenta':
					case 'yellow':
						getter = 'cmy';
					break;
					case 'hue':
					case 'saturation':
					case 'lightness':
						getter = 'hsl';
					break;
					case 'alpha':
						return this.get('alpha');
					break;
					default:
						throw new Error('color.Color: getChannel: invalid channel name given');
					break;
				}
				return this.get(getter)[_channels[getter][channel.charAt(0)]];
			},
			
			/**
			 * Set a single channel
			 * 
			 * @access  public
			 * @param   string    the channel (eg. "hue")
			 * @param   number    the new value
			 * @return  void
			 */
			setChannel: function(channel, value) {
				var setter;
				switch (channel) {
					case 'red':
					case 'green':
					case 'blue':
						setter = 'setRGBChannel';
					break;
					case 'cyan':
					case 'magenta':
					case 'yellow':
						setter = 'setCMYChannel';
					break;
					case 'hue':
					case 'saturation':
					case 'lightness':
						setter = 'setHSLChannel';
					break;
					case 'alpha':
						return this.setOpacity(value);
					break;
					default:
						throw new Error('color.Color: setChannel: invalid channel name given');
					break;
				}
				this[setter](channel.charAt(0), value);
			},
			
			/**
			 * Shift a single channel
			 * 
			 * @access  public
			 * @param   string    the channel (eg. "hue")
			 * @param   number    the amount to shift
			 * @return  void
			 */
			shiftChannel: function(channel, value) {
				this.setChannel(channel, this.getChannel(channel) + value);
			},
			
			/**
			 * Get the RGB format difference in two colors
			 *
			 * @access  public
			 * @param   mixed     the other color
			 * @return  array
			 */
			rgbDiff: function(other) {
				other = getRgbArray(other);
				if (utils.vartype.isArray(other)) {
					var color = this.get('rgba');
					var result = [ ];
					for (var i = 0; i < 4; i++) {
						result[i] = utils.inforce(color[i] - other[i], (
							(i === 3) ?
							{ min: -1, max: 1, places: 2 } :
							{ min: -255, max: 255, places: 0 }
						));
					}
					return result;
				}
				return false;
			},
			
			/**
			 * Inverse the current color (does not effect opacity)
			 *
			 * @access  public
			 * @return  void
			 */
			inverse: function() {
				var rgb = this.get('rgba');
				for (var i = 0; i < 3; i++) {
					rgb[i] = 255 - rgb[i];
				}
				this.set('rgba', rgb);
			},
			
			/**
			 * Mix in some of another color
			 *
			 * @access  public
			 * @param   mixed     the other color
			 * @param   number    the mix-in ratio
			 * @return  void
			 */
			mix: function(other, ratio) {
				// Figure out the mix-in ratio
				ratio = (ratio === void(0)) ? 0.5 : ratio;
				ratio = utils.inforce(ratio, {
					min: 0, max: 1
				});
				// Mix the colors
				var color = this.get('rgba');
				other = getRgbArray(other);
				var otherRatio = 1 - ratio;
				for (var i = 0; i < 3; i++) {
					color[i] = (color[i] * otherRatio) + (other[i] * ratio);
				}
				this.set('rgba', color);
			}
			
		};
	
	// ------------------------------------------------------------------
	//  Color diff constructor
		
		pkg.ColorDiff = function(first, second) {
			
			// Get the color objects
			if (! first instanceof pkg.Color) {
				first = new pkg.Color(first);
			}
			if (! second instanceof pkg.Color) {
				second = new pkg.Color(second);
			}
			
			// Get the difference
			var diff = second.rgbDiff(first);
			
			// Convert first and second to arrays for faster value access
			first = first.get('rgba');
			second = second.get('rgba');
			
			// Fetches a color object for the first color
			this.first = function() {
				return new pkg.Color(first);
			};
			
			// Fetches a color object for the second color
			this.second = function() {
				return new pkg.Color(second);
			};
			
			// Gets a color object at a given position
			this.atPosition = function(position) {
				return new pkg.Color('rgba', [
					first[0] + diff[0] * position,
					first[1] + diff[1] * position,
					first[2] + diff[2] * position,
					first[3] + diff[3] * position
				]);
			};
			
		};
	
	// ------------------------------------------------------------------
	//  Color string parser
		
		pkg.parse = (function() {
			var regexes = {
				rgb: /(rgba?)\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*(,\s*([0-1]?(\.[0-9]+)?)\s*)?\)/,
				rgbPercent: /(rgba?)\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*(,\s*([0-1]?(\.[0-9]+)?)\s*)?\)/,
				hsv: /(hsva?)\(\s*([0-9]{1,3})\s*,\s*([0-9]?(\.[0-9]+)?)\s*,\s*([0-9]?(\.[0-9]+)?)\s*(,\s*([0-1]?(\.[0-9]+)?)\s*)?\)/,
				hsl: /(hsla?)\(\s*([0-9]{1,3})\s*,\s*([0-9]?(\.[0-9]+)?)\s*,\s*([0-9]?(\.[0-9]+)?)\s*(,\s*([0-1]?(\.[0-9]+)?)\s*)?\)/,
				cmy: /(cmya?)\(\s*([0-9]?(\.[0-9]+)?)\s*,\s*([0-9]?(\.[0-9]+)?)\s*,\s*([0-9]?(\.[0-9]+)?)\s*(,\s*([0-1]?(\.[0-9]+)?)\s*)?\)/,
				cmyk: /(cmyka?)\(\s*([0-9]?(\.[0-9]+)?)\s*,\s*([0-9]?(\.[0-9]+)?)\s*,\s*([0-9]?(\.[0-9]+)?)\s*,\s*([0-9]?(\.[0-9]+)?)\s*(,\s*([0-1]?(\.[0-9]+)?)\s*)?\)/,
				hexLong: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})?/,
				hexShort: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])?/
			};
			return function(color) {
				var result, floats;
			
				// Check for a string
				if (typeof color !== 'string') {return false;}
			
				// Look for color names
				if (pkg.colorNames.hasOwnProperty(color)) {
					result = utils.toArray(pkg.colorNames[color]);
					result.push(1); // Add the opacity
					return result;
				}
		
				// Look for rgb(num,num,num) or rgba(num,num,num,num)
				if (result = regexes.rgb.exec(color)) {
					// Rgb
					if (result[1] === 'rgb' && ! result[6]) {
						return [int(result[2]), int(result[3]), int(result[4]), 1];
					}
					// Rgba
					else if (result[1] === 'rgba' && result[6]) {
						return [int(result[2]), int(result[3]), int(result[4]), float(result[6])];
					}
					// Bad syntax
					else {
						return false;
					}
				}
			
				// Look for rgb(num%,num%,num%) and rgba(num%,num%,num%,num)
				if (result = regexes.rgbPercent.exec(color)) {
					// Rgb
					if (result[1] === 'rgb' && ! result[6]) {
						return [float(result[2]) * 2.55, float(result[3]) * 2.55, float(result[4]) * 2.55, 1];
					}
					// Rgba
					else if (result[1] === 'rgba' && result[6]) {
						return [float(result[2]) * 2.55, float(result[3]) * 2.55, float(result[4]) * 2.55, float(result[6])];
					}
					// Bad syntax
					else {
						return false;
					}
				}
			
				// Look for hsv(num,num,num) and hsva(num,num,num,num)
				if (result = regexes.hsv.exec(color)) {
					// Hsv
					if (result[1] === 'hsv' && ! result[6]) {
						return pkg.rgbFrom.hsv([
							int(result[2]), float(result[3]), float(result[4]), 1
						]);
					}
					// Hsva
					else if (result[1] === 'hsva' && result[6]) {
						return pkg.rgbFrom.hsv([
							int(result[2]), float(result[3]), float(result[4]), float(result[6])
						]);
					}
					// Bad syntax
					else {
						return false;
					}
				}
			
				// Look for hsl(num,num,num) and hsla(num,num,num,num)
				if (result = regexes.hsl.exec(color)) {
					// Hsl
					if (result[1] === 'hsl' && ! result[6]) {
						return pkg.rgbFrom.hsl([
							int(result[2]), float(result[3]), float(result[4]), 1
						]);
					}
					// Hsla
					else if (result[1] === 'hsva' && result[6]) {
						return pkg.rgbFrom.hsl([
							int(result[2]), float(result[3]), float(result[4]), float(result[6])
						]);
					}
					// Bad syntax
					else {
						return false;
					}
				}
			
				// Look for cmy(num,num,num) and cmya(num,num,num,num)
				if (result = regexes.cmy.exec(color)) {
					// Cmy
					if (result[1] === 'cmy' && ! result[9]) {
						return pkg.rgbFrom.cmy([
							float(result[2]), float(result[4]), float(result[6]), 1
						]);
					}
					// Cmya
					else if (result[1] === 'cmya' && result[9]) {
						return pkg.rgbFrom.cmy([
							float(result[2]), float(result[4]), float(result[6]), float(result[9])
						]);
					}
					// Bad syntax
					else {
						return false;
					}
				}
			
				// Look for cmyk(num,num,num,num) and cmyka(num,num,num,num,num)
				if (result = regexes.cmy.exec(color)) {
					// Cmyk
					if (result[1] === 'cmyk' && ! result[11]) {
						return pkg.rgbFrom.cmyk([
							float(result[2]), float(result[4]), float(result[6]), float(result[8]), 1
						]);
					}
					// Cmyka
					else if (result[1] === 'cmyka' && result[11]) {
						return pkg.rgbFrom.cmyka([
							float(result[2]), float(result[4]), float(result[6]), float(result[8]), float(result[11])
						]);
					}
					// Bad syntax
					else {
						return false;
					}
				}
		
				// Look for #ffffff and #ffffffff
				if (result = regexes.hexLong.exec(color)) {
					return [int(result[1], 16), int(result[2], 16), int(result[3], 16), (int(result[4] || 'ff', 16) / 255)];
				}
		
				// Look for #fff and #ffff
				if (result = regexes.hexShort.exec(color)) {
					result[4] = result[4] || 'f';
					return [
						int(result[1] + result[1], 16),
						int(result[2] + result[2], 16),
						int(result[3] + result[3], 16),
						int(result[4] + result[4], 16) / 255
					];
				}
		
				// otherwise...
				return false;
			};
		}());
	
	// ------------------------------------------------------------------
	//  Conversion from RGB methods
	
		pkg.rgbTo = {
			
			// Rgb -> hex
			hex: function(rgb) {
				var n, hex = utils.toArray(rgb);
				for (var i = 0, c = hex.length; i < c; i++) {
					if (i === 3) {
						hex[i] *= 255;
					}
					n = Math.round(parseInt(hex[i]))
					hex[i] = "0123456789ABCDEF".charAt((n - (n % 16)) / 16) + "0123456789ABCDEF".charAt(n % 16);
				}
				return hex;
			},
			
			// Rgb -> hsv
			hsv: function(rgb) {
				var 
				r = rgb[0] / 255,
				g = rgb[1] / 255,
				b = rgb[2] / 255,
				minVal = Math.min(r, g, b),
				maxVal = Math.max(r, g, b),
				delta = maxVal - minVal,
				h, s, v = maxVal,
				hsv = utils.toArray(rgb);
				if (delta === 0) {
					h = 0;
					s = 0;
				} else {
					s = delta / maxVal;
					var delR = (((maxVal - r) / 6) + (delta / 2)) / delta;
					var delG = (((maxVal - g) / 6) + (delta / 2)) / delta;
					var delB = (((maxVal - b) / 6) + (delta / 2)) / delta;

					if (r === maxVal) {h = delB - delG;}
					else if (g === maxVal) {h = (1 / 3) + delR - delB;}
					else if (b === maxVal) {h = (2 / 3) + delG - delR;}
		
					if (h < 0) {h += 1;}
					if (h > 1) {h -= 1;}
				}
				hsv[0] = h * 360;
				hsv[1] = s;
				hsv[2] = v;
				return hsv;
			},
			
			// Rgb -> hsl
			hsl: function(rgb) {
				var
				r = (rgb[0] / 255),
				g = (rgb[1] / 255),
				b = (rgb[2] / 255),
				minVal = Math.min(r, g, b),
				maxVal = Math.max(r, g, b),
				delta = maxVal - minVal,
				l = (maxVal + minVal) / 2,
				h = 0, s = 0,
				hsl = utils.toArray(rgb);
				if (delta === 0) {
					h = s = 0;
				} else {
					if (l <= 0.5) {
						// s = maxVal / (maxVal + minVal)
						s = delta / (2 * l);
					} else {
						// s = maxVal / (2 - maxVal - minVal)
						s = delta / (2 - (2 * l));
					}
					var delR = (((maxVal - r ) / 6 ) + ( delta / 2 ) ) / delta;
					var delG = (((maxVal - g ) / 6 ) + ( delta / 2 ) ) / delta;
					var delB = (((maxVal - b ) / 6 ) + ( delta / 2 ) ) / delta;
					if (r == maxVal) h = delB - delG;
					else if (g == maxVal) h = (1 / 3) + delR - delB;
					else if (b == maxVal) h = (2 / 3) + delG - delR;
					if (h < 0) h += 1;
					if (h > 1) h -= 1;
				}
				h *= 360;
				hsl[0] = utils.inforce(h, { places: 0 });
				hsl[1] = utils.inforce(s, { places: 2 });
				hsl[2] = utils.inforce(l, { places: 2 });;
				return hsl;
			},
			
			// Rgb -> cmy
			cmy: function(rgb) {
				var cmy = utils.toArray(rgb);
				for (var i = 0; i < 3; i++) {
					cmy[i] = utils.roundTo(1 - cmy[i] / 255, 2);
				}
				return cmy;
			},
			
			// Rgb -> cmyk
			cmyk: function(rgb) {
				var
				cmy = pkg.rgbTo.cmy(rgb),
				c = cmy[0],
				m = cmy[1],
				y = cmy[2],
				a = cmy[3],
				k = 1,
				cmyk;
				if (c < k) k = c;
				if (m < k) k = m;
				if (y < k) k = y;
				if (k === 1) {  // Black
					c = m = y = 0;
				} else {
					c = (c - k) / (1 - k);
					m = (m - k) / (1 - k);
					y = (y - k) / (1 - k);
				}
				cmyk = [c, m, y, k];
				// Preserve an alpha value if there is one
				if (utils.vartype.isSet(a)) {
					cmyk.push(a);
				}
				return cmyk;
			}
			
		};
	
	// ------------------------------------------------------------------
	//  Conversion to RGB methods
		
		pkg.rgbFrom = {
			
			// Hex -> rgb
			hex: function(hex) {
				var n, rgb = utils.toArray(hex);
				for (var i = 0, c = rgb.length; i < c; i++) {
					n = String(rgb[i]);
					if (n.length === 1) {
						n += n;
					}
					rgb[i] = parseInt(n, 16);
					if (i === 3) {
						rgb[i] = utils.roundTo(rgb[i] / 255, 2);
					}
				}
				return rgb;
			},
			
			// Hsv -> rgb
			hsv: function(hsv) {
				var
				r, g, b,
				i,
				f, p, q, t,
				h = utils.inforce(hsv[0], {
					min: 0, max: 360, places: 0, rotate: true
				}),
				s = utils.inforce(hsv[1], {
					min: 0, max: 1, places: 2
				}),
				v = utils.inforce(hsv[2], {
					min: 0, max: 1, places: 2
				}),
				rgb = utils.toArray(hsv);
				if (s === 0) {
					r = g = b = v;
				} else {
					h /= 60;
					i = Math.floor(h);
					f = h - i;
					p = v * (1 - s);
					q = v * (1 - s * f);
					t = v * (1 - s * (1 - f));
					switch(i) {
						case 0: r = v; g = t; b = p; break;
						case 1: r = q; g = v; b = p; break;
						case 2: r = p; g = v; b = t; break;
						case 3: r = p; g = q; b = v; break;
						case 4: r = t; g = p; b = v; break;
						case 5: r = v; g = p; b = q; break;
						default: return false; break;
					}
				}
				rgb[0] = r * 255;
				rgb[1] = g * 255;
				rgb[2] = b * 255;
				return rgb;
			},
			
			// Hsl -> rgb
			hsl: function(hsl) {
				var
				h = utils.inforce(hsl[0], {
					min: 0, max: 360, places: 0, rotate: true
				}) / 360,
				s = utils.inforce(hsl[1], {
					min: 0, max: 1, places: 2
				}),
				l = utils.inforce(hsl[2], {
					min: 0, max: 1, places: 2
				}),
				var1, var2, r, g, b,
				rgb = utils.toArray(hsl);
				if (s === 0) {
					r = g = b = l;
				} else {
					if (l < 0.5) {
						var2 = l * (1 + s);
					} else {
						var2 = (l + s) - (s * l);
					}
					var1 = 2 * l - var2;
					r = hueToRgb(var1, var2, h + (1 / 3));
					g = hueToRgb(var1, var2, h);
					b = hueToRgb(var1, var2, h - (1 / 3));
				}
				rgb[0] = utils.roundTo(r * 255, 0);
				rgb[1] = utils.roundTo(g * 255, 0);
				rgb[2] = utils.roundTo(b * 255, 0);
				return rgb;
			},
			
			// Cmy -> rgb
			cmy: function(cmy) {
				var rgb = utils.toArray(cmy);
				for (var i = 0; i < 3; i++) {
					rgb[i] = utils.roundTo((1 - rgb[i]) * 255, 0);
				}
				return rgb;
			},
			
			// Cmyk -> rgb
			cmyk: function(cmyk) {
				var
				a = cmyk[4],
				rgb = pkg.rgbFrom.cmy([
					cmyk[0] * (1 - cmyk[3]) + cmyk[3],
					cmyk[1] * (1 - cmyk[3]) + cmyk[3],
					cmyk[2] * (1 - cmyk[3]) + cmyk[3]
				]);
				if (utils.vartype.isSet(a)) {
					rgb.push(a);
				}
				return rgb;
			}
			
		};
	
	// ------------------------------------------------------------------
	//  Internal Functions
	
		function roundArray(arr, places, byReference) {
			arr = byReference ? arr : utils.toArray(arr);
			if (utils.vartype.isArray(places)) {
				for (var i = 0, c = arr.length; i < c; i++) {
					arr[i] = utils.roundTo(arr[i], places[i]);
				}
			} else {
				for (var i = 0, c = arr.length; i < c; i++) {
					arr[i] = utils.roundTo(arr[i], places);
				}
			}
			return arr;
		}
		
		function roundColor(format, color, hasAlpha) {
			var places;
			switch (format) {
				case 'rgb':
					places = [0, 0, 0];
				break;
				case 'hsl':
				case 'hsv':
					places = [0, 2, 2];
				break;
				case 'cmy':
					places = [2, 2, 2];
				break;
				case 'cmyk':
					places = [2, 2, 2, 2];
				break;
				case 'hex':
					places = false;
				break;
			}
			if (places) {
				if (hasAlpha) {
					places.push(2);
				}
				roundArray(color, places, true);
			}
		}
		
		function int() {
			return parseInt.apply(this, arguments);
		}
		
		function float() {
			return parseFloat.apply(this, arguments);
		}
		
		function hueToRgb(v1, v2, vH) {
			if (vH < 0) {vH += 1;}
			if (vH > 1) {vH -= 1;}
			if ((6 * vH) < 1) {return (v1 + (v2 - v1) * 6 * vH);}
			if ((2 * vH) < 1) {return (v2);}
			if ((3 * vH) < 2) {return (v1 + (v2 - v1) * ((2 / 3) - vH) * 6);}
			return v1;
		}
		
		function getRgbArray(color) {
			if (typeof color === 'string') {
				color = pkg.parse(color);
			}
			if (color instanceof pkg.Color) {
				color = color.get('rgba');
			}
			return color;
		}
		
	}
});

/* End of file color.js */
