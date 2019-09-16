function Vue (options) {
	if (!(this instanceof Vue)
	) {
	  warn('Vue is a constructor and should be called with the `new` keyword');
	}
	this._init(options);
  }
  initMixin(Vue);
