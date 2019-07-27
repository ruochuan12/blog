# jQuery 源码学习 - 整体架构

虽然现在基本不怎么使用jQuery了，但jQuery流行10多年的JS库，还是有必要学习它的源码的。

本文章学习的是v3.4.1 版本。
源码地址：https://unpkg.com/jquery@3.4.1/dist/jquery.js

### 自执行匿名函数

```
(function(global, factory){

})(typeof window !== "underfined" ? window: this, function(window, noGlobal){

});
```
关于自执行函数不是很了解的读者可以看这篇文章。
[[译] JavaScript：立即执行函数表达式（IIFE）](https://segmentfault.com/a/1190000003985390)


### 支持多种环境下使用 比如 commonjs、cmd规范

commonjs node.js
```
( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {});
```

cmd 规范 require.js
```
if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}
```
amd 规范 seajs

### 无 new 构造
实际上也是可以 `new`的，因为`jQuery`是函数。

[面试官问：能否模拟实现JS的new操作符](https://juejin.im/post/5bde7c926fb9a049f66b8b52)

```
 jQuery = function( selector, context ) {

    // The jQuery object is actually just the init constructor 'enhanced'
    // Need init if jQuery is called (just allow error to be thrown if not included)
    return new jQuery.prototype.init( selector, context );
}

jQuery.prototype.init = function( selector, context, root ) {
        root = root || rootjQuery;
		return jQuery.makeArray( selector, this );
	};

jQuery.fn.init = function( selector, context, root ) {
        root = root || rootjQuery;
		return jQuery.makeArray( selector, this );
	};

```

### 链式调用

return this;

### extend

用法：
```
jQuery.extend( target [, object1 ] [, objectN ] )

jQuery.extend( [deep ], target, object1 [, objectN ] )
```
[jQuery.extend API](https://api.jquery.com/jQuery.extend/)
[jQuery.fn.extend API](https://api.jquery.com/jQuery.extend/)

```
// 例子 jQuery.extend
```
第一版

### jQuery.noConflict 很多js库都会有的防冲突功能

jQuery.noConflict 源码
```
var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};
```

### 扩展阅读
[songjz :jQuery 源码系列（一）总体架构](https://segmentfault.com/a/1190000008365621)

[chokcoco: jQuery- v1.10.2 源码解读](https://github.com/chokcoco/jQuery-)

[chokcoco:【深入浅出jQuery】源码浅析--整体架构](https://www.cnblogs.com/coco1s/p/5261646.html)