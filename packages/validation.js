/**
 * Form Validation Package
 *
 * @author     James Brumond
 * @copyright  Copyright 2011 James Brumond
 * @license    Dual licensed under MIT and GPL
 *
 * ------------------------------------------------------------------
 * 
 * Constructors:
 *   validation.Validator ( void )
 *     void      validation.Validator::addRule ( array definition )
 *     boolean   validation.Validator::validate ( void )
 *   validation.ValidatorRuleDefinition ( array definition )
 *     boolean   validation.ValidatorRuleDefinition::runTests ( void )
 *   validation.ValidationFailure ( string message, array failures )
 *   
 */

$('validation', {
	require: ['utils'],
	package: function(pkg) {
		
		var ruleTypes = [ 'required', 'type', 'minimum', 'maximum', 'length', 'length-min', 'length-max', 'pattern', 'callback' ];
		var emailRegex = new RegExp('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9]' +
			'(?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$', 'i');
		
	// ------------------------------------------------------------------
	//  The validator constructor
		
		pkg.Validator = function() {
			this._rules = [ ];
		};
		
		/**
		 * Add a rule to the validator
		 *
		 * @access  public
		 * @param   object    the validation rule
		 * @return  void
		 */
		pkg.Validator.prototype.addRule = function(rule) {
			// Create a rule object
			if (rule.toString() !== '[object ValidatorRuleDefinition]') {
				rule = new pkg.ValidatorRuleDefinition(rule);
			}
			// Add the rule to the validator
			this._rules.push(rule);
		};
		
		/**
		 * Run the validation tests
		 *
		 * @access  public
		 * @return  boolean
		 */
		pkg.Validator.prototype.validate = function() {
			var failures = [ ];
			
			// Run all the tests and store any failures
			for (var i = 0, c = this._rules.length; i < c; i++) {
				var rule = this._rules[i];
				try {
					rule.runTests();
				} catch (message) {
					failures.push(message);
				}
			}
			
			// If there were failed tests, throw a failure exception
			if (failures.length) {
				throw new pkg.ValidationFailure('Validation failed; ' + this._rules.length +
					' tests, ' + failures.length + ' failures', failures);
			}
			
			return true;
		};
		
		pkg.Validator.prototype.toString = function() {
			return '[object Validator]';
		};
	
	// ------------------------------------------------------------------
	//  The rule constructor
		
		pkg.ValidatorRuleDefinition = function(def) {
			if (! utils.vartype.isArray(def)) {
				throw new TypeError('Rule definition is expected to be an array structure');
			}
			// Run through the definition and build a more useful structure
			def = utils.toArray(def);
			this._def = { };
			for (var i = 0, c = def.length; i < c; i++) {
				var key = def[i].shift();
				if (! this._def[key]) {
					this._def[key] = [ ];
				}
				this._def[key].push(def[i]);
			}
		};
		
		/**
		 * Run the validation tests
		 *
		 * @access  public
		 * @return  void
		 */
		pkg.ValidatorRuleDefinition.prototype.runTests = function() {
			// Get the test element
			try {
				var element = this._def.element[0][0];
				if (typeof element === 'string') {
					element = document.getElementById(element);
				}
				if (! element || typeof element !== 'object') { throw 0; }
			} catch (e) {
				throw 'Could not get element for test';
			}
			var value = element.value;
			// Run through the tests...
			TESTS: for (var i = 0, c1 = ruleTypes.length; i < c1; i++) {
				var type = ruleTypes[i];
				if (this._def.hasOwnProperty(type)) {
					var rules = this._def[type];
					for (var j = 0, c2 = rules.length; j < c2; j++) {
						var rule = rules[j];
						try {
							switch (type) {
								
								// Handle "required" rules
								case 'required':
									if (! value) {
										if (rule[0]) {
											throw 0;
										} else {
											break TESTS;
										}
									}
								break;
							
								// Handle "type" rules
								case 'type':
									switch (rule[0]) {
										case 'float':
										case 'double':
											if (! isDouble(value)) { throw 0; }
										break;
										case 'int':
										case 'integer':
											if (! isInt(value)) { throw 0; }
										break;
										case 'number':
											if (! isNumber(value)) { throw 0; }
										break;
										case 'email':
											if (! isEmail(value)) { throw 0; }
										break;
										default:
											throw 0;
										break;
									}
								break;
								
								// Handle "minimum" rules
								case 'minimum':
									if (! isNumber(value) || Number(value) < rule[0]) { throw 0; }
								break;
								
								// Handle "maximum" rules
								case 'minimum':
									if (! isNumber(value) || Number(value) > rule[0]) { throw 0; }
								break;
								
								// Handle "length" rules
								case 'length':
									if (String(value).length !== rule[0]) { throw 0; }
								break;
								
								// Handle "length-min" rules
								case 'length-min':
									if (String(value).length < rule[0]) { throw 0; }
								break;
								
								// Handle "length-max" rules
								case 'length-max':
									if (String(value).length > rule[0]) { throw 0; }
								break;
								
								// Handle "pattern" rules
								case 'pattern':
									if (! rule[0].test(value)) { throw 0; }
								break;
								
								// Handle "callback" rules
								case 'callback':
									if (! rule[0].call(element, value)) { throw 0; }
								break;
								
							}
						} catch (e) { throw rule[1]; }
					}
				}
			}
		};
		
		pkg.ValidatorRuleDefinition.prototype.toString = function() {
			return '[object ValidatorRuleDefinition]';
		};
	
	// ------------------------------------------------------------------
	//  Validation failure error
		
		pkg.ValidationFailure = $.defineError('ValidationFailure',
			function(message, failures) {
				this.failures = failures;
			}
		);
	
	// ------------------------------------------------------------------
	//  Helper functions
		
		function isNumber(value) {
			return String(parseFloat(value)) === value;
		}
		
		function isDouble(value) {
			return isNumber(value) && value.indexOf('.') < 0;
		}
		
		function isInt(value) {
			return isNumber(value) && value.indexOf('.') >= 0;
		}
		
		function isEmail(value) {
			return emailRegex.test(value);
		}
		
	}
});

/* End of file validation.js */
