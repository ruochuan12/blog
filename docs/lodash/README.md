# 学习 lodash  源码整体架构，打造属于自己的函数式编程类库

## 前言

这是`学习源码整体架构系列`第三篇。整体架构这词语好像有点大，姑且就算是源码整体结构吧，主要就是学习是代码整体结构，不深究具体函数的实现。文章学习的是打包整合后的代码，不是实际仓库中的拆分的代码。

上上篇文章写了`jQuery源码整体架构`，[学习 jQuery 源码整体架构，打造属于自己的 js 类库](https://juejin.im/post/5d39d2cbf265da1bc23fbd42)

上一篇文章写了`underscore源码整体架构`，[学习 underscore 源码整体架构，打造属于自己的函数式编程类库](https://juejin.im/post/5d4bf94de51d453bb13b65dc)

感兴趣的读者可以点击阅读。

`underscore`分析的源码很多。但很少`lodash`分析。原因之一可能是由于`lodash`源码行数太多。注释加起来一万多行。

分析`lodash`整体代码结构的文章比较少，笔者利用谷歌、必应、`github`搜索都没有找到，可能是找的方式不对。于是打算自己写一篇。平常开发大多数人都会使用`lodash`,而且都或多或少知道，`lodash`比`underscore`性能好，性能好的主要原因是使用了惰性求值这一特性。

本文章学习的`lodash`的版本是：`v4.17.15`。`unpkg.com`地址 https://unpkg.com/lodash@4.17.15/lodash.js

**分享一个只知道函数名找源码定位函数申明位置的`VSCode` 技巧**：`Ctrl + p`。输入 `@functionName` 定位函数`functionName`在源码文件中的具体位置。如果知道调用位置，那直接按`alt+鼠标左键`即可跳转到函数申明的位置。

## 匿名函数执行

```js
;(function() {

}.call(this));
```

暴露 lodash

```js
var _ = runInContext();
```

## runInContext 函数

这里的简版源码，只关注函数入口和返回值。

```js
var runInContext = (function runInContext(context) {
	// ...
	function lodash(value) {}{
		// ...
		return new LodashWrapper(value);
	}
	// ...
	return lodash;
});
```
可以看到申明了一个`runInContext`函数。里面有一个lodash函数，最后处理返回这个`lodash`函数。

再看`lodash`函数中的返回值 `new LodashWrapper(value)`。

### LodashWrapper 函数

```js
function LodashWrapper(value, chainAll) {
	this.__wrapped__ = value;
	this.__actions__ = [];
	this.__chain__ = !!chainAll;
	this.__index__ = 0;
	this.__values__ = undefined;
}
```

TODO:
设置了这些属性：
`__wrapped__`：存放参数`value`。
`__actions__`：存放待执行的函数体`func`， 函数参数 `args`，函数执行的`this` 指向 `thisArg`。

`__chain__`、`undefined`两次取反转成布尔值`false`，不支持链式调用。和`underscore`一样，默认是不支持链式调用的。

`__index__`：
`__value__`：

接着往下搜索源码，`LodashWrapper`，
会发现这两行代码。

```js
LodashWrapper.prototype = baseCreate(baseLodash.prototype);
LodashWrapper.prototype.constructor = LodashWrapper;
```

接着往上找`baseCreate、baseLodash`这两个函数。

### baseCreate 原型继承

```js
//  立即执行匿名函数
// 返回一个函数，用于设置原型 可以理解为是 __proto__
var baseCreate = (function() {
	// 这句放在函数外，是为了不用每次调用baseCreate都重复申明 object
	// underscore 源码中，把这句放在开头就申明了一个空函数 `Ctor`
	function object() {}
	return function(proto) {
		// 如果传入的参数不是object也不是function 是null
		// 则返回空对象。
		if (!isObject(proto)) {
			return {};
		}
		// 如果支持Object.create方法，则返回 Object.create
		if (objectCreate) {
			// Object.create
			return objectCreate(proto);
		}
		// 如果不支持Object.create 用 ployfill new
		object.prototype = proto;
		var result = new object;
		// 还原 prototype
		object.prototype = undefined;
		return result;
	};
}());

// 空函数
function baseLodash() {
	// No operation performed.
}

// Ensure wrappers are instances of `baseLodash`.
lodash.prototype = baseLodash.prototype;
// 为什么会有这一句？因为上一句把lodash.prototype.construtor 设置为Object了。这一句修正constructor
lodash.prototype.constructor = lodash;

LodashWrapper.prototype = baseCreate(baseLodash.prototype);
LodashWrapper.prototype.constructor = LodashWrapper;
```

笔者画了一张图，表示这个关系。
![lodash 原型关系图](./lodash-v4.17.15-prototype.png)

#### 衍生的 isObject 函数

判断`typeof value`不等于`null`，并且是`object`或者`function`。
```js
function isObject(value) {
	var type = typeof value;
	return value != null && (type == 'object' || type == 'function');
}
```

### Object.create() 用法举例

笔者之前整理的一篇文章中也有讲过，可以翻看[JavaScript 对象所有API解析](https://segmentfault.com/a/1190000010753942)

[MDN Object.create()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)

`Object.create(proto, [propertiesObject])`
方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__。
它接收两个参数，不过第二个可选参数是属性描述符（不常用，默认是`undefined`）。

```js
var anotherObject = {
    name: '若川'
};
var myObject = Object.create(anotherObject, {
    age: {
        value：18,
    },
});
// 获得它的原型
Object.getPrototypeOf(anotherObject) === Object.prototype; // true 说明anotherObject的原型是Object.prototype
Object.getPrototypeOf(myObject); // {name: "若川"} // 说明myObject的原型是{name: "若川"}
myObject.hasOwnProperty('name'); // false; 说明name是原型上的。
myObject.hasOwnProperty('age'); // true 说明age是自身的
myObject.name; // '若川'
myObject.age; // 18;
```

对于不支持`ES5`的浏览器，`MDN`上提供了`ployfill`方案。

```js
if (typeof Object.create !== "function") {
    Object.create = function (proto, propertiesObject) {
        if (typeof proto !== 'object' && typeof proto !== 'function') {
            throw new TypeError('Object prototype may only be an Object: ' + proto);
        } else if (proto === null) {
            throw new Error("This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.");
        }

        if (typeof propertiesObject != 'undefined') throw new Error("This browser's implementation of Object.create is a shim and doesn't support a second argument.");

        function F() {}
        F.prototype = proto;
        return new F();
    };
}
```

`lodash`上有很多方法和属性，但在`lodash.prototype`也有很多与lodash上相同的方法。肯定不是在`lodash.prototype`上重新写一遍。而是通过`mixin`挂载的。

## mixin

### mixin 具体用法

```js
_.mixin([object=lodash], source, [options={}])
```

>添加来源对象自身的所有可枚举函数属性到目标对象。 如果 object 是个函数，那么函数方法将被添加到原型链上。

>注意: 使用 _.runInContext 来创建原始的 lodash 函数来避免修改造成的冲突。

**添加版本**

>0.1.0

**参数**

>[object=lodash] (Function|Object): 目标对象。

>source (Object): 来源对象。

>[options={}] (Object): 选项对象。

>[options.chain=true] (boolean): 是否开启链式操作。

**返回**

>(*): 返回 object.

### mixin 源码

<details>
<summary>点击这里展开源码，后文注释解析</summary>

```js
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
```
</details>
接下来先看衍生的函数。

其实看到具体定义的函数代码就大概知道这个函数的功能。为了不影响主线，导致文章篇幅过长。具体源码在这里就不展开。

感兴趣的读者可以自行看这些函数衍生的其他函数的源码。

### mixin 衍生的函数 keys

在 `mixin` 函数中 其实最终调用的就是 `Object.keys`
```js
function keys(object) {
	return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}
```

### mixin 衍生的函数 baseFunctions

返回函数数组集合
```js
function baseFunctions(object, props) {
	return arrayFilter(props, function(key) {
		return isFunction(object[key]);
	});
}
```

### mixin 衍生的函数 isFunction

判断参数是否是函数
```js
function isFunction(value) {
	if (!isObject(value)) {
		return false;
	}
	// The use of `Object#toString` avoids issues with the `typeof` operator
	// in Safari 9 which returns 'object' for typed arrays and other constructors.
	var tag = baseGetTag(value);
	return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}
```

### mixin 衍生的函数 arrayEach

类似 [].forEarch
```js
function arrayEach(array, iteratee) {
	var index = -1,
		length = array == null ? 0 : array.length;

	while (++index < length) {
		if (iteratee(array[index], index, array) === false) {
			break;
		}
	}
	return array;
}
```

### mixin 衍生的函数 arrayPush

类似 [].push
```js
function arrayPush(array, values) {
	var index = -1,
		length = values.length,
		offset = array.length;

	while (++index < length) {
	array[offset + index] = values[index];
	}
	return array;
}
```

### mixin 衍生的函数 copyArray

拷贝数组

```js
function copyArray(source, array) {
	var index = -1,
		length = source.length;

	array || (array = Array(length));
	while (++index < length) {
		array[index] = source[index];
	}
	return array;
}
```

### mixin 源码解析

`lodash` 源码中两次调用 `mixin`

```js
// Add methods that return wrapped values in chain sequences.
lodash.after = after;
// code ... 等 153 个支持链式调用的方法

// Add methods to `lodash.prototype`.
// 把lodash上的静态方法赋值到 lodash.prototype 上
mixin(lodash, lodash);

// Add methods that return unwrapped values in chain sequences.
lodash.add = add;
// code ... 等 152 个不支持链式调用的方法


// 这里其实就是过滤 after 等支持链式调用的方法，获取到 lodash 上的 add 等 添加到lodash.prototype 上。
mixin(lodash, (function() {
	var source = {};
	baseForOwn(lodash, function(func, methodName) {
		// 第一次 mixin 调用了所以赋值到了lodash.prototype
		// 所以这里用 Object.hasOwnProperty 排除不在lodash.prototype 上的方法。也就是 add 等 152 个不支持链式调用的方法。
		if (!hasOwnProperty.call(lodash.prototype, methodName)) {
			source[methodName] = func;
		}
	});
	return source;
// 最后一个参数options 特意注明不支持链式调用
}()), { 'chain': false });
```

结合两次调用`mixin` 代入到源码解析如下

```js
function mixin(object, source, options) {
	// source 对象中可以枚举的属性
	var props = keys(source),
		// source 对象中的方法名称数组
		methodNames = baseFunctions(source, props);

	if (options == null &&
		!(isObject(source) && (methodNames.length || !props.length))) {
		// 如果 options 没传为 undefined  undefined == null 为true
		// 且 如果source 不为 对象或者不是函数
		// 且 source对象的函数函数长度 或者 source 对象的属性长度不为0
		// 把 options 赋值为 source
		options = source;
		// 把 source 赋值为 object
		source = object;
		// 把 object 赋值为 this 也就是 _ (lodash)
		object = this;
		// 获取到所有的方法名称数组
		methodNames = baseFunctions(source, keys(source));
	}
	// 是否支持 链式调用
	// options  不是对象或者不是函数，是null或者其他值
	// 判断options是否是对象或者函数，如果不是或者函数则不会执行 'chain' in options 也就不会报错
	//  且 chain 在 options的对象或者原型链中
	// 知识点 in [MDN in :  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/in
	// 如果指定的属性在指定的对象或其原型链中，则in 运算符返回true。

	// 或者 options.chain 转布尔值
	var chain = !(isObject(options) && 'chain' in options) || !!options.chain,
		// object 是函数
		isFunc = isFunction(object);

	// 循环 方法名称数组
	arrayEach(methodNames, function(methodName) {
		// 函数本身
		var func = source[methodName];
		// object 通常是 lodash  也赋值这个函数。
		object[methodName] = func;
		if (isFunc) {
			// 如果object是函数 赋值到  object prototype  上，通常是lodash
			object.prototype[methodName] = function() {
				// 实例上的__chain__ 属性 是否支持链式调用
				// 这里的 this 是 new LodashWrapper 实例 类似如下
				/**
				 {
					__actions__: [],
					__chain__: true
					__index__: 0
					__values__: undefined
					__wrapped__: []
				 }
				 **/

				var chainAll = this.__chain__;
				// options 中的 chain 属性 是否支持链式调用
				// 两者有一个符合链式调用  执行下面的代码
				if (chain || chainAll) {
					// 通常是 lodash
					var result = object(this.__wrapped__),
					// 复制 实例上的 __action__ 到 result.__action__ 和 action 上
					actions = result.__actions__ = copyArray(this.__actions__);

					// action 添加 函数 和 args 和 this 指向，延迟计算调用。
					actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
					//实例上的__chain__ 属性  赋值给 result 的 属性 __chain__
					result.__chain__ = chainAll;
					// 最后返回这个实例
					return result;
				}

				// 都不支持链式调用。直接调用
				// 把当前实例的 value 和 arguments 对象 传递给 func 函数作为参数调用。返回调用结果。
				return func.apply(object, arrayPush([this.value()], arguments));
			};
		}
	});

	// 最后返回对象 object
	return object;
}
```

## lodash 究竟在_和_.prototype挂载了多少方法和属性

再来看下`lodash`究竟挂载在`_`函数对象上有多少静态方法和属性，和挂载`_.prototype`上有多少方法和属性。

使用`for in`循环一试遍知。看如下代码：
```js
var staticMethods = [];
var staticProperty = [];
for(var name in _){
	if(typeof _[name] === 'function'){
		staticMethods.push(name);
	}
	else{
		staticProperty.push(name);
	}
}
console.log(staticProperty); // ["templateSettings", "VERSION"] 2个
console.log(staticMethods); // ["after", "ary", "assign", "assignIn", "assignInWith", ...] 305个
// 其实就是上文提及的 lodash.after 等153个支持链式调用的函数 、lodash.add 等 152 不支持链式调用的函数 赋值而来。
```

```js
var prototypeMethods = [];
var prototypeProperty = [];
for(var name in _.prototype){
	if(typeof _.prototype[name] === 'function'){
		prototypeMethods.push(name);
	}
	else{
		prototypeProperty.push(name);
	}
}
console.log(prototypeProperty); // []
console.log(prototypeMethods); // ["after", "all", "allKeys", "any", "assign", ...] 317个
// 相比lodash上的静态方法多了12个，说明除了mixin外，还有12个其他形式赋值而来。

```

支持链式调用的方法最后返回是实例对象，获取最后的处理的结果值，最后需要调用`value`方法。

## 举个简单的例子

```js
var result = _.chain([1, 2, 3, 4, 5])
.map(el => el + 1)
.take(3)
.value();

// 具体功能也很简单 获取1-5 加一，最后获取其中三个值。
console.log('result:', result);
```
// 如果是 平常实现该功能也简单
```js
var result = [1, 2, 3, 4, 5].map(el => el + 1).slice(0, 3);
console.log('result:', result);
```

## lodash.prototype.value 即 wrapperValue

```js
function baseWrapperValue(value, actions) {
	var result = value;
	// 如果是lazyWrapper的实例，则调用LazyWrapper.prototype.value 方法，也就是 lazyValue 方法
	if (result instanceof LazyWrapper) {
		result = result.value();
	}
	// 类似 [].reduce()
	return arrayReduce(actions, function(result, action) {
		return action.func.apply(action.thisArg, arrayPush([result], action.args));
	}, result);
}
function wrapperValue() {
	return baseWrapperValue(this.__wrapped__, this.__actions__);
}
lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;
```

## LazyWrapper.prototype.value 即 lazyValue

```js
function LazyWrapper(value) {
	this.__wrapped__ = value;
	this.__actions__ = [];
	this.__dir__ = 1;
	this.__filtered__ = false;
	this.__iteratees__ = [];
	this.__takeCount__ = MAX_ARRAY_LENGTH;
	this.__views__ = [];
}
/**
* Extracts the unwrapped value from its lazy wrapper.
*
* @private
* @name value
* @memberOf LazyWrapper
* @returns {*} Returns the unwrapped value.
*/
function lazyValue() {
	var array = this.__wrapped__.value(),
		dir = this.__dir__,
		isArr = isArray(array),
		isRight = dir < 0,
		arrLength = isArr ? array.length : 0,
		view = getView(0, arrLength, this.__views__),
		start = view.start,
		end = view.end,
		length = end - start,
		index = isRight ? end : (start - 1),
		iteratees = this.__iteratees__,
		iterLength = iteratees.length,
		resIndex = 0,
		takeCount = nativeMin(length, this.__takeCount__);

	if (!isArr || (!isRight && arrLength == length && takeCount == length)) {
		return baseWrapperValue(array, this.__actions__);
	}
	var result = [];

	outer:
	while (length-- && resIndex < takeCount) {
		index += dir;

		var iterIndex = -1,
			value = array[index];

		while (++iterIndex < iterLength) {
		var data = iteratees[iterIndex],
			iteratee = data.iteratee,
			type = data.type,
			computed = iteratee(value);

		if (type == LAZY_MAP_FLAG) {
			value = computed;
		} else if (!computed) {
			if (type == LAZY_FILTER_FLAG) {
				continue outer;
			} else {
				break outer;
			}
		}
		}
		result[resIndex++] = value;
	}
	return result;
}
// Ensure `LazyWrapper` is an instance of `baseLodash`.
LazyWrapper.prototype = baseCreate(baseLodash.prototype);
LazyWrapper.prototype.constructor = LazyWrapper;

LazyWrapper.prototype.value = lazyValue;
```

## Add `LazyWrapper` methods to `lodash.prototype`

<details>
<summary>点击这里展开源码</summary>

```js
// Add `LazyWrapper` methods to `lodash.prototype`.
baseForOwn(LazyWrapper.prototype, function(func, methodName) {
	var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName),
		isTaker = /^(?:head|last)$/.test(methodName),
		lodashFunc = lodash[isTaker ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName],
		retUnwrapped = isTaker || /^find/.test(methodName);

	if (!lodashFunc) {
		return;
	}
	lodash.prototype[methodName] = function() {
		var value = this.__wrapped__,
			args = isTaker ? [1] : arguments,
			isLazy = value instanceof LazyWrapper,
			iteratee = args[0],
			useLazy = isLazy || isArray(value);

		var interceptor = function(value) {
			var result = lodashFunc.apply(lodash, arrayPush([value], args));
			return (isTaker && chainAll) ? result[0] : result;
		};

		if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
			// Avoid lazy use if the iteratee has a "length" value other than `1`.
			isLazy = useLazy = false;
		}
		var chainAll = this.__chain__,
			isHybrid = !!this.__actions__.length,
			isUnwrapped = retUnwrapped && !chainAll,
			onlyLazy = isLazy && !isHybrid;

		if (!retUnwrapped && useLazy) {
			value = onlyLazy ? value : new LazyWrapper(this);
			var result = func.apply(value, args);
			result.__actions__.push({ 'func': thru, 'args': [interceptor], 'thisArg': undefined });
			return new LodashWrapper(result, chainAll);
		}
		if (isUnwrapped && onlyLazy) {
			return func.apply(this, args);
		}
		result = this.thru(interceptor);
		return isUnwrapped ? (isTaker ? result.value()[0] : result.value()) : result;
	};
});
```
<details>

TODO:

- [x] mixin 使用解释、外部使用示例
- [ ] 补图原型关系图
- [ ] 挂载方法和属性图
- [ ] lazyWrapper 解释 惰性求值
- [ ] lodash.prototype.value 求值解析

## 总结

读者发现有不妥或可改善之处，欢迎评论指出。另外觉得写得不错，可以点赞、评论、转发，也是对笔者的一种支持。万分感谢。

## 推荐阅读

[lodash github仓库](https://github.com/lodash/lodash)

[lodash 官方文档](https://lodash.com/docs/4.17.15)

[lodash 中文文档](https://lodashjs.com/)

[打造一个类似于lodash的前端工具库](http://blog.zollty.com/b/archive/create-a-front-end-tool-library.html)

[惰性求值——lodash源码解读](https://juejin.im/post/5b784baf51882542ed141a84)

[luobo tang：lazy.js 惰性求值实现分析](https://zhuanlan.zhihu.com/p/24138694)

[lazy.js github 仓库](https://github.com/dtao/lazy.js)

[本文章学习的`lodash`的版本`v4.17.15` `unpkg.com`链接](https://unpkg.com/lodash@4.17.15/lodash.js)
