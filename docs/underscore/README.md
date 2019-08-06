学习`underscorejs`整体架构，打造属于自己的函数式编程类库

## 前言

上一篇文章写了`jQuery`，[学习 jQuery 源码整体架构，打造属于自己的 js 类库](https://juejin.im/post/5d39d2cbf265da1bc23fbd42)

虽然看过挺多`underscorejs`分析类的文章，但总感觉少点什么。于是决定自己写一篇学习`underscorejs`的文章。

本文章学习的版本是`v1.9.1`。
虽然很多人都没用过underscorejs，但看下官方文档都应该知道。可以

从一个官方文档`_.chain`简单例子看起：

```
_.chain([1, 2, 3]).reverse().value();
// => [3, 2, 1]
```

看例子中可以看出，这是支持链式调用。

## 链式调用
`_.chain` 函数源码：

```
_.chain = function(obj) {
	var instance = _(obj);
	instance._chain = true;
	return instance;
};
```

这个函数比较简单，就是传递`obj`调用`_()`。但返回值变量竟然是`instance`实例对象。添加属性`_chain`赋值为`true`，并返回`intance`对象。但再看例子，实例对象竟然可以调用`reverse`方法，再调用`value`方法。猜测支持`OOP`（面向对象）调用。

带着问题，笔者看了下定义 `_` 函数对象的代码。

## `_` 函数对象 支持`OOP`

```
var _ = function(obj) {
	if (obj instanceof _) return obj;
	if (!(this instanceof _)) return new _(obj);
	this._wrapped = obj;
};
```

如果参数`obj`已经是`_`的实例了，则返回`obj`。
如果`this`不是`_`的实例，则手动 new _(obj);
再次`new`调用时，把`obj`对象赋值给`_wrapped`这个属性。
也就是说最后得到的实例对象是这样的结构
`{
	_wrapped: '参数obj',
}`
它的原型`_(obj).__proto__` 是 `_.prototype`;

如果对这块不熟悉的读者，可以看下以下这张图。
[构造函数、原型对象和实例关系图](./ctor-prototype-instance@lxchuan12.png)

继续分析官方的`_.chain`例子。这个例子拆开，写成三步。

```
var part1 = _.chain([1, 2, 3]);
var part2 = part1.reverse();
var part3 = part2.value();

// 没有后续part1.reverse()操作的情况下
console.log(part1); // {__wrapped: [1, 2, 3], _chain: true}

console.log(part2); // {__wrapped: [3, 2, 1], _chain: true}

console.log(part3); // [3, 2, 1]
```
思考问题：`reverse`本是`Array.prototype`上的方法呀。为啥支持链式调用呢。
搜索`reverse`，可以看到如下这段代码：

并将例子代入这段代码可得（怎么有种高中做数学题的既视感^_^）：

```
_.chain([1,2,3]).reverse().value()
```

```
	var ArrayProto = Array.prototype;
	// 遍历 数组 Array.prototype 的这些方法，赋值到 _.prototype 上
	_.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	  // 这里的`method`是 reverse 函数
	  var method = ArrayProto[name];
	  _.prototype[name] = function() {
		// 这里的obj 就是数组 [1, 2, 3]
		var obj = this._wrapped;
		// arguments  是参数集合，指定reverse 的this指向为obj，参数为arguments， 并执行这个函数函数。执行后 obj 则是 [3, 2, 1]
		method.apply(obj, arguments);
		if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
		// 重点在于这里 chainResult 函数。
		return chainResult(this, obj);
	  };
	});
```

```
// Helper function to continue chaining intermediate results.
	var chainResult = function(instance, obj) {
	 // 如果实例中有_chain 为 true 这个属性，则返回实例 支持链式调用的实例对象  { _chain: true, this._wrapped: [3, 2, 1] }，否则直接返回这个对象[3, 2, 1]。
	  return instance._chain ? _(obj).chain() : obj;
	};
```

`if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];`
提一下上面源码中的这一句，看到这句是百思不得其解。于是赶紧在`github`中搜索这句加上`""`双引号。表示全部搜索。

搜索到两个在官方库中的`ISSUE`，大概意思就是兼容IE低版本的写法。有兴趣的可以点击去看看。

[I don't understand the meaning of this sentence.](https://github.com/jashkenas/underscore/issues/2016)

[why delete obj[0]](https://github.com/jashkenas/underscore/issues/2773)

## 基于流的编程

至此就分析完了链式调用`_.chain()`和`_` 函数对象。这种把数据存储在实例对象`{_wrapped: '', _chain: true}` 中，`_chain`判断是否支持链式调用，来传递给下一个函数处理。这种做法叫做 **基于流的编程**。

最后数据处理完，要返回这个数据怎么办呢。`underscore`提供了一个`value`的方法。
```
_.prototype.value = function(){
	return this._wrapped;
}
```
顺便提供了几个别名。`toJSON`、`valueOf`。
_.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

还提供了 `toString`的方法。
```
_.prototype.toString = function() {
	return String(this._wrapped);
};
```
这里的`String()` 和`new String()` 效果是一样的。
可以猜测内部实现和 `_`函数对象类似。

```
var String = function(){
	if(!(this instanceOf String)) return new String(obj);
}
```

## `_.mixin` 挂载所有的静态方法到 `_.prototype`， 也可以挂载自定义的方法

`_.mixin` 混入。但侵入性太强，经常容易出现覆盖之类的问题。记得之前`React`有`mixin`功能，Vue也有`mixin`功能。但版本迭代更新后基本都是慢慢的都不推荐或者不支持`mixin`。


```
	_.mixin = function(obj) {
		// 遍历对象上的所有方法
	  _.each(_.functions(obj), function(name) {
		  // 比如 each, obj['each'] 函数，自定义的，则赋值到_[name] 上，func 就是该函数。也就是说自定义的方法，不仅_函数对象上有，而且`_.prototype`上也有
		var func = _[name] = obj[name];
		_.prototype[name] = function() {
			// 处理的数据对象
		  var args = [this._wrapped];
		  // 处理的数据对象 和 arguments 结合
		  push.apply(args, arguments);
		  // 链式调用
		  return chainResult(this, func.apply(_, args));
		};
	  });
	  // 最终返回 _ 函数对象。
	  return _;
	};

	_.mixin(_);
```

挂载自定义方法：
举个例子：
```
_.mixin({
	log: function(){
		console.log('哎呀，我被调用了');
	}
})
_.log() // 哎呀，我被调用了
_().log() // 哎呀，我被调用了
```



```
var staticMethods = [];
for(var name in _.prototype){
	staticMethods.push(name);
}
console.log(staticMethods); // ["after", "all", "allKeys", "any", "assign", ...]
```

```
var prototypeMethods = [];
for(var name in _.prototype){
	prototypeMethods.push(name);
}
console.log(prototypeMethods); // ["after", "all", "allKeys", "any", "assign", ...] 152个
```


### 推荐阅读

[underscorejs.org 官网](https://underscorejs.org/)
[undersercore-analysis](https://yoyoyohamapi.gitbooks.io/undersercore-analysis/content/)
[underscore 系列之如何写自己的 underscore](https://juejin.im/post/5a0bae515188252964213855)
