//     Underscore.js 1.9.1
//     http://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

	// Baseline setup
	// --------------

	// Establish the root object, `window` (`self`) in the browser, `global`
	// on the server, or `this` in some virtual machines. We use `self`
	// instead of `window` for `WebWorker` support.
	var root = typeof self == 'object' && self.self === self && self ||
			  typeof global == 'object' && global.global === global && global ||
			  this ||
			  {};

	// Save the previous value of the `_` variable.
	var previousUnderscore = root._;
	// Save bytes in the minified (but not gzipped) version:
	var ArrayProto = Array.prototype, ObjProto = Object.prototype;
	// Create quick reference variables for speed access to core prototypes.
	var push = ArrayProto.push;
	// Create a safe reference to the Underscore object for use below.
	var _ = function(obj) {
		if (obj instanceof _) return obj;
		if (!(this instanceof _)) return new _(obj);
		this._wrapped = obj;
	};

	// Return a sorted list of the function names available on the object.
	// Aliased as `methods`.
	_.functions = _.methods = function(obj) {
		var names = [];
		for (var key in obj) {
		  if (_.isFunction(obj[key])) names.push(key);
		}
		return names.sort();
	  };

	// Export the Underscore object for **Node.js**, with
	// backwards-compatibility for their old module API. If we're in
	// the browser, add `_` as a global object.
	// (`nodeType` is checked to ensure that `module`
	// and `exports` are not HTML elements.)
	if (typeof exports != 'undefined' && !exports.nodeType) {
		if (typeof module != 'undefined' && !module.nodeType && module.exports) {
		exports = module.exports = _;
		}
		exports._ = _;
	} else {
		root._ = _;
	}

	// Current version.
	_.VERSION = '1.9.1';
		// Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	// previous owner. Returns a reference to the Underscore object.
	_.noConflict = function() {
		root._ = previousUnderscore;
		return this;
	  };
	  // OOP
	// ---------------
	// If Underscore is called as a function, it returns a wrapped object that
	// can be used OO-style. This wrapper holds altered versions of all the
	// underscore functions. Wrapped objects may be chained.

	// Helper function to continue chaining intermediate results.
	var chainResult = function(instance, obj) {
		return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
		_.each(_.functions(obj), function(name) {
		  var func = _[name] = obj[name];
		  _.prototype[name] = function() {
			var args = [this._wrapped];
			push.apply(args, arguments);
			return chainResult(this, func.apply(_, args));
		  };
		});
		return _;
	  };
	  // Add all of the Underscore functions to the wrapper object.
	_.mixin(_);

	// Extracts the result from a wrapped and chained object.
	_.prototype.value = function() {
		return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
		return String(this._wrapped);
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (typeof define == 'function' && define.amd) {
		define('underscore', [], function() {
		  return _;
		});
	  }
}());
