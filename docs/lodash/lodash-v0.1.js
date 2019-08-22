
;(function() {
	var runInContext = (function runInContext(context) {
		context = context == null ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));
		/** Used to restore the original `_` reference in `_.noConflict`. */
	  	var oldDash = root._;
	  	function lodash(value) {
			if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
			  if (value instanceof LodashWrapper) {
				return value;
			  }
			  if (hasOwnProperty.call(value, '__wrapped__')) {
				return wrapperClone(value);
			  }
			}
			return new LodashWrapper(value);
		}
		var baseCreate = (function() {
			function object() {}
			return function(proto) {
				  if (!isObject(proto)) {
					return {};
				  }
				  if (objectCreate) {
					return objectCreate(proto);
				  }
				  object.prototype = proto;
				  var result = new object;
				  object.prototype = undefined;
				  return result;
			};
		}());
		function baseLodash() {
			// No operation performed.
		}

		function LodashWrapper(value, chainAll) {
			this.__wrapped__ = value;
			this.__actions__ = [];
			this.__chain__ = !!chainAll;
			this.__index__ = 0;
			this.__values__ = undefined;
		}

		// Ensure wrappers are instances of `baseLodash`.
		  lodash.prototype = baseLodash.prototype;
		  lodash.prototype.constructor = lodash;

		  LodashWrapper.prototype = baseCreate(baseLodash.prototype);
		  LodashWrapper.prototype.constructor = LodashWrapper;

		/**
	   * Creates a clone of `wrapper`.
	   *
	   * @private
	   * @param {Object} wrapper The wrapper to clone.
	   * @returns {Object} Returns the cloned wrapper.
	   */
	  function wrapperClone(wrapper) {
		if (wrapper instanceof LazyWrapper) {
		  return wrapper.clone();
		}
		var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
		result.__actions__ = copyArray(wrapper.__actions__);
		result.__index__  = wrapper.__index__;
		result.__values__ = wrapper.__values__;
		return result;
	  }

	  /**
	   * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
	   *
	   * @private
	   * @constructor
	   * @param {*} value The value to wrap.
	   */
	  function LazyWrapper(value) {
		this.__wrapped__ = value;
		this.__actions__ = [];
		this.__dir__ = 1;
		this.__filtered__ = false;
		this.__iteratees__ = [];
		this.__takeCount__ = MAX_ARRAY_LENGTH;
		this.__views__ = [];
	  }

	  function noConflict() {
		if (root._ === this) {
		  root._ = oldDash;
		}
		return this;
	  }

	  function mixin(object, source, options) {
		var props = keys(source),
			methodNames = baseFunctions(source, props);

		if (options == null &&
			!(isObject(source) && (methodNames.length || !props.length))) {
		  options = source;
		  source = object;
		  object = this;
		  methodNames = baseFunctions(source, keys(source));
		}
		var chain = !(isObject(options) && 'chain' in options) || !!options.chain,
			isFunc = isFunction(object);

		arrayEach(methodNames, function(methodName) {
		  var func = source[methodName];
		  object[methodName] = func;
		  if (isFunc) {
			object.prototype[methodName] = function() {
			  var chainAll = this.__chain__;
			  if (chain || chainAll) {
				var result = object(this.__wrapped__),
					actions = result.__actions__ = copyArray(this.__actions__);

				actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
				result.__chain__ = chainAll;
				return result;
			  }
			  return func.apply(object, arrayPush([this.value()], arguments));
			};
		  }
		});

		return object;
	  }

	  lodash.extend = assignIn;
	  lodash.extendWith = assignInWith;

	  // Add methods to `lodash.prototype`.
	  mixin(lodash, lodash);


	  mixin(lodash, (function() {
		var source = {};
		baseForOwn(lodash, function(func, methodName) {
		  if (!hasOwnProperty.call(lodash.prototype, methodName)) {
			source[methodName] = func;
		  }
		});
		return source;
	  }()), { 'chain': false });

	  return lodash;
	});
	// Export lodash.
	var _ = runInContext();
}.call(this));
