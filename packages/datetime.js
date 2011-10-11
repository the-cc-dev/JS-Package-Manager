/**
 * Date/time Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 *
 * ------------------------------------------------------------------
 *
 * Properties:
 *   array   datetime.dayNames
 *   array   datetime.monthNames
 *   array   datetime.masks
 *   object  datetime.Tween.algos
 *
 * Methods:
 *   number  datetime.now ( void )
 *   number  datetime.requestAnimationFrame ( function callback[, Element elem ])
 *   string  datetime.format ([ mixed date[, string mask[, boolean utc ]]])
 *
 * Constructors:
 *   datetime.Timer ( void )
 *     void    datetime.Timer::start ( void )
 *     void    datetime.Timer::stop ( void )
 *     number  datetime.Timer::current ( void )
 *     void    datetime.Timer::reset ( void )
 *   datetime.Tween ( object opts )
 *     void    datetime.Tween::start ( void )
 *     void    datetime.Tween::stop ( void )
 *     void    datetime.Tween::reset ( void )
 */

$('datetime', {
	package: function(pkg) {
		
		/**
		 * Get the current timestamp
		 *
		 * @access  public
		 * @return  number
		 */
		pkg.now = function() {
			return +(new Date);
		};
		
		/**
		 * Shim for requestAnimationFrame
		 *
		 * @access  public
		 */
		pkg.requestAnimationFrame = (function() {
			var
			isReady = false,
			readyQueue = [ ],
			timeUndefined = true,
			requestAnimFrame = null,
			frameRate = 1000 / 60,
			onReady = function() {
				if (! isReady) {
					isReady = true;
					readyQueue.forEach(function(args) {
						self.requestAnimationFrame.apply(window, args);
					});
					readyQueue = null;
				}
			};
			// Check for a bug in webkitRequestAnimationFrame() that does not give
			// the timestamp parameter
			if (window.webkitRequestAnimationFrame) {
				webkitRequestAnimationFrame(function(time) {
					timeUndefined = (time == void(0));
					onReady();
				});
			} else {
				self.runAsync(function() {
					onReady();
				});
			}
			return function() {
				if (! isReady) {
					return readyQueue.push(arguments);
				}
				// Find the correct animation function
				if (requestAnimFrame === null) {
					requestAnimFrame = (
						window.requestAnimationFrame ||
						((! timeUndefined) ? window.webkitRequestAnimationFrame : false) ||
						window.mozRequestAnimationFrame ||
						window.oRequestAnimationFrame ||
						window.msRequestAnimationFrame ||
						function(callback, elem) {
							window.setTimeout(function() {
								callback(now());
							}, frameRate);
						}
					);
				}
				return requestAnimFrame.apply(window, arguments);
			};
		}());
	
	// ------------------------------------------------------------------
	//  Timer
		
		pkg.Timer = function() {
			this._running    = false;
			this._total      = 0;
			this._startTime  = 0;
		};
		pkg.Timer.prototype = {

			/**
			 * Start the timer
			 *
			 * @access  public
			 * @return  void
			 */
			start: function() {
				if (! this._running) {
					this._running = true;
					this._startTime = pkg.now();
				}
			},

			/**
			 * Stop/pause the timer
			 *
			 * @access  public
			 * @return  void
			 */
			stop: function() {
				if (this._running) {
					this._running = false;
					this._total += pkg.now() - this._startTime;
				}
			},

			/**
			 * Get the current time on the timer
			 *
			 * @access  public
			 * @return  number
			 */
			current: function() {
				return this._total + ((this._running) ? pkg.now() - this._startTime : 0);
			},

			/**
			 * Reset the timer to zero
			 *
			 * @access  public
			 * @return  void
			 */
			reset: function() {
				this._total = 0;
				this._running = false;
			}

		};
	
	// ------------------------------------------------------------------
	//  Tweening
		
		/**
		 * Tweening object constructor
		 *
		 * @access  public
		 * @param   object    configuration object
		 */
		pkg.Tween = (function() {
			var _default = {
				func: null,
				total: null,
				useraf: true,
				interval: 25,
				after: null,
				algo: 'linear'
			};
			function parseOptions(opts) {
				opts = opts || { };
				for (var i in _default) {
					if (_default.hasOwnProperty(i) && ! opts.hasOwnProperty(i)) {
						opts[i] = _default[i];
					}
				}
				if (typeof opts.algo === 'string') {
					opts.algo = pkg.Tween.algorithms[opts.algo];
				}
				return opts;
			};
			function useRequestAnimationFrameIf(flag, func) {
				if (flag) {
					pkg.requestAnimationFrame(func);
				} else {
					func();
				}
			};
			return function(opts) {
				
				var self      = this;
				var state     = 0;
				var timer     = new pkg.Timer();
				var timeout   = null;
				var running   = false;
				var finished  = false;
				
				opts = parseOptions(opts);
				
				function runFrame() {
					if (running) {
						useRequestAnimationFrameIf(opts.useraf, function() {
							state = opts.algo(opts.total, timer.current());
							if (state >= 1) {
								state = 1;
								running = false;
								finished = true;
							}
							opts.func(state);
							if (running) {
								if (useraf) {
									runFrame();
								} else {
									timeout = window.setTimeout(runFrame, opts.interval);
								}
							} else if (finished) {
								opts.after();
							}
						});
					}
				};
				
				if (! opts.func) { return false; }
				
				self.start = function() {
					if (! running) {
						finished = false;
						running = true;
						timer.start();
						runFrame();
					}
				};
				
				self.stop = function() {
					if (running) {
						finished = false;
						running = false;
						window.clearTimeout(timeout);
						timer.stop();
					}
				};
				
				self.reset = function() {
					self.stop();
					state = 0;
					timer.reset();
				};
				
			};
		}());
		
		pkg.Tween.algorithms = {
			linear: function(total, current) {
				return 1 - ((total - current) / total);
			}
		};
		
		
	// ------------------------------------------------------------------
	//  Date/time formatter
		
		/**
		 * Allowed formatting tokens:
		 *
		 *  d         - Day of the month as digits; no leading zero for single-digit days
		 *  dd        - Day of the month as digits; leading zero for single-digit days
		 *  ddd       - Day of the week as a three-letter abbreviation
		 *  dddd      - Day of the week as its full name.
		 *  m         - Month as digits; no leading zero for single-digit months.
		 *  mm        - Month as digits; leading zero for single-digit months.
		 *  mmm       - Month as a three-letter abbreviation.
		 *  mmmm      - Month as its full name.
		 *  yy        - Year as last two digits; leading zero for years less than 10.
		 *  yyyy      - Year represented by four digits.
		 *  h         - Hours; no leading zero for single-digit hours (12-hour clock).
		 *  hh        - Hours; leading zero for single-digit hours (12-hour clock).
		 *  H         - Hours; no leading zero for single-digit hours (24-hour clock).
		 *  HH        - Hours; leading zero for single-digit hours (24-hour clock).
		 *  M         - Minutes; no leading zero for single-digit minutes.
		 *  MM        - Minutes; leading zero for single-digit minutes.
		 *  s         - Seconds; no leading zero for single-digit seconds.
		 *  ss        - Seconds; leading zero for single-digit seconds.
		 *  l or L    - Milliseconds. l gives 3 digits. L gives 2 digits.
		 *  t         - Lowercase, single-character time marker string: a or p.
		 *  tt        - Lowercase, two-character time marker string: am or pm.
		 *  T         - Uppercase, single-character time marker string: A or P.
		 *  TT        - Uppercase, two-character time marker string: AM or PM.
		 *  Z         - US timezone abbreviation, e.g. EST or MDT. With non-US timezones
		 *              or in the Opera browser, the GMT/UTC offset is returned, e.g. GMT-0500
		 *  o         - GMT/UTC timezone offset, e.g. -0500 or +0230.
		 *  S         - The date's ordinal suffix (st, nd, rd, or th). Works well with d.
		 *  '' or ""  - Literal character sequence. Surrounding quotes are removed.
		 *
		 */
		pkg.format = (function() {
			var
			token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
			timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
			timezoneClip = /[^-+\dA-Z]/g,
			pad = function (val, len) {
				val = val + '';
				len = len || 2;
				while (val.length < len) {
					val = "0" + val;
				}
				return val;
			},
			toString = Object.prototype.toString,
			isDate = function(obj) {
				return (toString.call(obj) === '[object Date]');
			};

			// The actual format function
			return function(date, mask, utc) {
				// Get a Date object
				var type = typeof date;
				if (type === 'undefined') {
					date = new Date();
				} else if (type === 'string' || type === 'number') {
					date = new Date(date);
				}
				if (! isDate(date) || isNaN(date)) {
					return false;
				}
				// Get the format mask
				mask = (pkg.format.masks[mask] || mask || pkg.format.masks["default"]) + '';
				// Get the date information
				var
				_ = utc ? "getUTC" : "get",
				d = date[_ + "Date"](),
				D = date[_ + "Day"](),
				m = date[_ + "Month"](),
				y = date[_ + "FullYear"](),
				H = date[_ + "Hours"](),
				M = date[_ + "Minutes"](),
				s = date[_ + "Seconds"](),
				L = date[_ + "Milliseconds"](),
				o = utc ? 0 : date.getTimezoneOffset(),
				flags = {
					d:    d,
					dd:   pad(d),
					ddd:  pkg.format.dayNames[D],
					dddd: pkg.format.dayNames[D + 7],
					m:    m + 1,
					mm:   pad(m + 1),
					mmm:  pkg.format.monthNames[m],
					mmmm: pkg.format.monthNames[m + 12],
					yy:   String(y).slice(2),
					yyyy: y,
					h:    H % 12 || 12,
					hh:   pad(H % 12 || 12),
					H:    H,
					HH:   pad(H),
					M:    M,
					MM:   pad(M),
					s:    s,
					ss:   pad(s),
					l:    pad(L, 3),
					L:    pad(L > 99 ? Math.round(L / 10) : L),
					t:    H < 12 ? "a"  : "p",
					tt:   H < 12 ? "am" : "pm",
					T:    H < 12 ? "A"  : "P",
					TT:   H < 12 ? "AM" : "PM",
					Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
					o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
				};
				// Build and return the formatted string
				return mask.replace(token, function ($0) {
					return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
				});
			};
		}());

	// ----------------------------------------------------------------------------
	//  Build the list of day/month names and masks for the format function

		pkg.format.dayNames = [
			'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
			'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
		];
		pkg.format.monthNames = [
			'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		];
		pkg.format.masks = {
			"default":      "ddd mmm dd yyyy HH:MM:ss",
			shortDate:      "m/d/yy",
			mediumDate:     "mmm d, yyyy",
			longDate:       "mmmm d, yyyy",
			fullDate:       "dddd, mmmm d, yyyy",
			shortTime:      "h:MM TT",
			mediumTime:     "h:MM:ss TT",
			longTime:       "h:MM:ss TT Z",
			isoDate:        "yyyy-mm-dd",
			isoTime:        "HH:MM:ss",
			isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
			isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
		};
		
	}
});

/* End of file datetime.js */
