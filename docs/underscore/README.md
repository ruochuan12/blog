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

这个函数比较简单，就是传递`obj`调用`_()`。但返回值变量竟然是`instance`实例对象。添加属性`_chain`赋值为`true`，并返回`intance`对象。但再看例子，实例对象竟然可以调用`reverse`方法，再调用`value`方法。猜测支持OOP（面向对象）调用。

带着问题笔者，看了下定义 _ 函数对象的代码。

## `_` 函数对象

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

console.log(part1); // {__wrapped: [1, 2, 3], _chain: true}

console.log(part2); // {__wrapped: [3, 2, 1], _chain: true}

console.log(part3); // [3, 2, 1]
```

```
var staticMethods = [];
for(var name in _.prototype){
	staticMethods.push(name);
}
console.log(staticMethods); // ["after", "all", "allKeys", "any", "assign", "before", "bind", "bindAll", "chain", "chunk", "clone", "collect", "compact", "compose", "constant", "contains", ...]
```

```
var prototypeMethods = [];
for(var name in _.prototype){
	prototypeMethods.push(name);
}
console.log(prototypeMethods); // ["after", "all", "allKeys", "any", "assign", "before", "bind", "bindAll", "chain", "chunk", "clone", "collect", "compact", "compose", "constant", "contains", ...] 152个
```


### 推荐阅读

[underscorejs.org 官网](https://underscorejs.org/)
[undersercore-analysis](https://yoyoyohamapi.gitbooks.io/undersercore-analysis/content/)
[underscore 系列之如何写自己的 underscore](https://juejin.im/post/5a0bae515188252964213855)
