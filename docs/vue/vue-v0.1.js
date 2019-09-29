function Vue (options) {
	if (!(this instanceof Vue)
	) {
	  warn('Vue is a constructor and should be called with the `new` keyword');
	}
	this._init(options);
  }
  initMixin(Vue);


  /**
	 * Observer class that is attached to each observed
	 * object. Once attached, the observer converts the target
	 * object's property keys into getter/setters that
	 * collect dependencies and dispatch updates.
	 */
	var Observer = function Observer (value) {
		this.value = value;
		this.dep = new Dep();
		this.vmCount = 0;
		def(value, '__ob__', this);
		if (Array.isArray(value)) {
		  if (hasProto) {
			protoAugment(value, arrayMethods);
		  } else {
			copyAugment(value, arrayMethods, arrayKeys);
		  }
		  this.observeArray(value);
		} else {
		  this.walk(value);
		}
	  };

	  /**
	   * Walk through all properties and convert them into
	   * getter/setters. This method should only be called when
	   * value type is Object.
	   */
	  Observer.prototype.walk = function walk (obj) {
		var keys = Object.keys(obj);
		for (var i = 0; i < keys.length; i++) {
		  defineReactive$$1(obj, keys[i]);
		}
	  };

	  /**
	   * Observe a list of Array items.
	   */
	  Observer.prototype.observeArray = function observeArray (items) {
		for (var i = 0, l = items.length; i < l; i++) {
		  observe(items[i]);
		}
	  };

	  // helpers

	  /**
	   * Augment a target Object or Array by intercepting
	   * the prototype chain using __proto__
	   */
	  function protoAugment (target, src) {
		/* eslint-disable no-proto */
		target.__proto__ = src;
		/* eslint-enable no-proto */
	  }

	  /**
	   * Augment a target Object or Array by defining
	   * hidden properties.
	   */
	  /* istanbul ignore next */
	  function copyAugment (target, src, keys) {
		for (var i = 0, l = keys.length; i < l; i++) {
		  var key = keys[i];
		  def(target, key, src[key]);
		}
	  }

	  /*  */

	var uid = 0;

	/**
	 * A dep is an observable that can have multiple
	 * directives subscribing to it.
	 */
	var Dep = function Dep () {
	  this.id = uid++;
	  this.subs = [];
	};

	Dep.prototype.addSub = function addSub (sub) {
	  this.subs.push(sub);
	};

	Dep.prototype.removeSub = function removeSub (sub) {
	  remove(this.subs, sub);
	};

	Dep.prototype.depend = function depend () {
	  if (Dep.target) {
		Dep.target.addDep(this);
	  }
	};

	Dep.prototype.notify = function notify () {
	  // stabilize the subscriber list first
	  var subs = this.subs.slice();
	  if (!config.async) {
		// subs aren't sorted in scheduler if not running async
		// we need to sort them now to make sure they fire in correct
		// order
		subs.sort(function (a, b) { return a.id - b.id; });
	  }
	  for (var i = 0, l = subs.length; i < l; i++) {
		subs[i].update();
	  }
	};

	// The current target watcher being evaluated.
	// This is globally unique because only one watcher
	// can be evaluated at a time.
	Dep.target = null;
	var targetStack = [];

	function pushTarget (target) {
	  targetStack.push(target);
	  Dep.target = target;
	}

	function popTarget () {
	  targetStack.pop();
	  Dep.target = targetStack[targetStack.length - 1];
	}

	var uid$2 = 0;
	/**
	 * A watcher parses an expression, collects dependencies,
	 * and fires callback when the expression value changes.
	 * This is used for both the $watch() api and directives.
	 */
	var Watcher = function Watcher (
		vm,
		expOrFn,
		cb,
		options,
		isRenderWatcher
	  ) {
		this.vm = vm;
		if (isRenderWatcher) {
		  vm._watcher = this;
		}
		vm._watchers.push(this);
		// options
		if (options) {
		  this.deep = !!options.deep;
		  this.user = !!options.user;
		  this.lazy = !!options.lazy;
		  this.sync = !!options.sync;
		  this.before = options.before;
		} else {
		  this.deep = this.user = this.lazy = this.sync = false;
		}
		this.cb = cb;
		this.id = ++uid$2; // uid for batching
		this.active = true;
		this.dirty = this.lazy; // for lazy watchers
		this.deps = [];
		this.newDeps = [];
		this.depIds = new _Set();
		this.newDepIds = new _Set();
		this.expression = expOrFn.toString();
		// parse expression for getter
		if (typeof expOrFn === 'function') {
		  this.getter = expOrFn;
		} else {
		  this.getter = parsePath(expOrFn);
		  if (!this.getter) {
			this.getter = noop;
			warn(
			  "Failed watching path: \"" + expOrFn + "\" " +
			  'Watcher only accepts simple dot-delimited paths. ' +
			  'For full control, use a function instead.',
			  vm
			);
		  }
		}
		this.value = this.lazy
		  ? undefined
		  : this.get();
	  };

	  /**
	   * Evaluate the getter, and re-collect dependencies.
	   */
	  Watcher.prototype.get = function get () {
		pushTarget(this);
		var value;
		var vm = this.vm;
		try {
		  value = this.getter.call(vm, vm);
		} catch (e) {
		  if (this.user) {
			handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
		  } else {
			throw e
		  }
		} finally {
		  // "touch" every property so they are all tracked as
		  // dependencies for deep watching
		  if (this.deep) {
			traverse(value);
		  }
		  popTarget();
		  this.cleanupDeps();
		}
		return value
	  };

	  /**
	   * Add a dependency to this directive.
	   */
	  Watcher.prototype.addDep = function addDep (dep) {
		var id = dep.id;
		if (!this.newDepIds.has(id)) {
		  this.newDepIds.add(id);
		  this.newDeps.push(dep);
		  if (!this.depIds.has(id)) {
			dep.addSub(this);
		  }
		}
	  };

	  /**
	   * Clean up for dependency collection.
	   */
	  Watcher.prototype.cleanupDeps = function cleanupDeps () {
		var i = this.deps.length;
		while (i--) {
		  var dep = this.deps[i];
		  if (!this.newDepIds.has(dep.id)) {
			dep.removeSub(this);
		  }
		}
		var tmp = this.depIds;
		this.depIds = this.newDepIds;
		this.newDepIds = tmp;
		this.newDepIds.clear();
		tmp = this.deps;
		this.deps = this.newDeps;
		this.newDeps = tmp;
		this.newDeps.length = 0;
	  };

	  /**
	   * Subscriber interface.
	   * Will be called when a dependency changes.
	   */
	  Watcher.prototype.update = function update () {
		/* istanbul ignore else */
		if (this.lazy) {
		  this.dirty = true;
		} else if (this.sync) {
		  this.run();
		} else {
		  queueWatcher(this);
		}
	  };

	  /**
	   * Scheduler job interface.
	   * Will be called by the scheduler.
	   */
	  Watcher.prototype.run = function run () {
		if (this.active) {
		  var value = this.get();
		  if (
			value !== this.value ||
			// Deep watchers and watchers on Object/Arrays should fire even
			// when the value is the same, because the value may
			// have mutated.
			isObject(value) ||
			this.deep
		  ) {
			// set new value
			var oldValue = this.value;
			this.value = value;
			if (this.user) {
			  try {
				this.cb.call(this.vm, value, oldValue);
			  } catch (e) {
				handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
			  }
			} else {
			  this.cb.call(this.vm, value, oldValue);
			}
		  }
		}
	  };

	  /**
	   * Evaluate the value of the watcher.
	   * This only gets called for lazy watchers.
	   */
	  Watcher.prototype.evaluate = function evaluate () {
		this.value = this.get();
		this.dirty = false;
	  };

	  /**
	   * Depend on all deps collected by this watcher.
	   */
	  Watcher.prototype.depend = function depend () {
		var i = this.deps.length;
		while (i--) {
		  this.deps[i].depend();
		}
	  };

	  /**
	   * Remove self from all dependencies' subscriber list.
	   */
	  Watcher.prototype.teardown = function teardown () {
		if (this.active) {
		  // remove self from vm's watcher list
		  // this is a somewhat expensive operation so we skip it
		  // if the vm is being destroyed.
		  if (!this.vm._isBeingDestroyed) {
			remove(this.vm._watchers, this);
		  }
		  var i = this.deps.length;
		  while (i--) {
			this.deps[i].removeSub(this);
		  }
		  this.active = false;
		}
	  };
