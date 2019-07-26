# jQuery 源码学习 - 整体架构

虽然不用jQuery做主力了，
jQuery

本文章学习的是v3.4.1 版本。

### 匿名自执行函数

```

```

### 支持多种环境下使用 commonjs、cmd规范


### 无 new 构造
实际上也是可以 new的，因为jQuery是函数。

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