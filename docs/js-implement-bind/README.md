# 面试官问：能否模拟实现JS的bind方法

>`写于2018年11月21日`

## 前言

>这是面试官问系列的第二篇，旨在帮助读者提升`JS`基础知识，包含`new、call、apply、this、继承`相关知识。<br>
`面试官问系列`文章如下：感兴趣的读者可以点击阅读。<br>
>1.[面试官问：能否模拟实现JS的new操作符](https://juejin.im/post/5bde7c926fb9a049f66b8b52)<br>
>2.[面试官问：能否模拟实现JS的bind方法](https://juejin.im/post/5bec4183f265da616b1044d7)<br>
>3.[面试官问：能否模拟实现JS的call和apply方法](https://juejin.im/post/5bf6c79bf265da6142738b29)<br>
>4.[面试官问：JS的this指向](https://juejin.im/post/5c0c87b35188252e8966c78a)<br>
>5.[面试官问：JS的继承](https://juejin.im/post/5c433e216fb9a049c15f841b)<br>

用过`React`的同学都知道，经常会使用`bind`来绑定`this`。
```js
import React, { Component } from 'react';
class TodoItem extends Component{
    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(){
        console.log('handleClick');
    }
    render(){
        return  (
            <div onClick={this.handleClick}>点击</div>
        );
    };
}
export default TodoItem;
```
**那么面试官可能会问是否想过`bind`到底做了什么，怎么模拟实现呢。**
>附上之前写文章写过的一段话：已经有很多模拟实现`bind`的文章，为什么自己还要写一遍呢。学习就好比是座大山，人们沿着不同的路登山，分享着自己看到的风景。你不一定能看到别人看到的风景，体会到别人的心情。只有自己去登山，才能看到不一样的风景，体会才更加深刻。

先看一下`bind`是什么。从上面的`React`代码中，可以看出`bind`执行后是函数，并且每个函数都可以执行调用它。
眼见为实，耳听为虚。读者可以在控制台一步步点开**例子1**中的`obj`:
```js
var obj = {};
console.log(obj);
console.log(typeof Function.prototype.bind); // function
console.log(typeof Function.prototype.bind());  // function
console.log(Function.prototype.bind.name);  // bind
console.log(Function.prototype.bind().name);  // bound
```

![`Function.prototype.bind`](https://user-gold-cdn.xitu.io/2018/11/18/16726f4175f9c34d?w=1109&h=518&f=png&s=67135)

### 因此可以得出结论1：

1、`bind`是`Functoin`原型链中`Function.prototype`的一个属性，每个函数都可以调用它。<br/>
2、`bind`本身是一个函数名为`bind`的函数，返回值也是函数，函数名是`bound `。（打出来就是`bound加上一个空格`）。
知道了`bind`是函数，就可以传参，而且返回值`'bound '`也是函数，也可以传参，就很容易写出**例子2**：<br>
后文统一 `bound` 指原函数`original` `bind`之后返回的函数，便于说明。
```js
var obj = {
    name: '若川',
};
function original(a, b){
    console.log(this.name);
    console.log([a, b]);
    return false;
}
var bound = original.bind(obj, 1);
var boundResult = bound(2); // '若川', [1, 2]
console.log(boundResult); // false
console.log(original.bind.name); // 'bind'
console.log(original.bind.length); // 1
console.log(original.bind().length); // 2 返回original函数的形参个数
console.log(bound.name); // 'bound original'
console.log((function(){}).bind().name); // 'bound '
console.log((function(){}).bind().length); // 0
```

### 由此可以得出结论2：

1、调用`bind`的函数中的`this`指向`bind()`函数的第一个参数。

2、传给`bind()`的其他参数接收处理了，`bind()`之后返回的函数的参数也接收处理了，也就是说合并处理了。

3、并且`bind()`后的`name`为`bound + 空格 + 调用bind的函数名`。如果是匿名函数则是`bound + 空格`。

4、`bind`后的返回值函数，执行后返回值是原函数（`original`）的返回值。

5、`bind`函数形参（即函数的`length`）是`1`。`bind`后返回的`bound`函数形参不定，根据绑定的函数原函数（`original`）形参个数确定。

根据结论2：我们就可以简单模拟实现一个简版`bindFn`
```js
// 第一版 修改this指向，合并参数
Function.prototype.bindFn = function bind(thisArg){
    if(typeof this !== 'function'){
        throw new TypeError(this + 'must be a function');
    }
    // 存储函数本身
    var self = this;
    // 去除thisArg的其他参数 转成数组
    var args = [].slice.call(arguments, 1);
    var bound = function(){
        // bind返回的函数 的参数转成数组
        var boundArgs = [].slice.call(arguments);
        // apply修改this指向，把两个函数的参数合并传给self函数，并执行self函数，返回执行结果
        return self.apply(thisArg, args.concat(boundArgs));
    }
    return bound;
}
// 测试
var obj = {
    name: '若川',
};
function original(a, b){
    console.log(this.name);
    console.log([a, b]);
}
var bound = original.bindFn(obj, 1);
bound(2); // '若川', [1, 2]
```
如果面试官看到你答到这里，估计对你的印象60、70分应该是会有的。
但我们知道函数是可以用`new`来实例化的。那么`bind()`返回值函数会是什么表现呢。<br>
接下来看**例子3**：
```js
var obj = {
    name: '若川',
};
function original(a, b){
    console.log('this', this); // original {}
    console.log('typeof this', typeof this); // object
    this.name = b;
    console.log('name', this.name); // 2
    console.log('this', this);  // original {name: 2}
    console.log([a, b]); // 1, 2
}
var bound = original.bind(obj, 1);
var newBoundResult = new bound(2);
console.log(newBoundResult, 'newBoundResult'); // original {name: 2}
```
从**例子3**种可以看出`this`指向了`new bound()`生成的新对象。

### 可以分析得出结论3：

1、`bind`原先指向`obj`的失效了，其他参数有效。

2、`new bound`的返回值是以`original`原函数构造器生成的新对象。`original`原函数的`this`指向的就是这个新对象。
另外前不久写过一篇文章：[面试官问：能否模拟实现JS的new操作符](https://juejin.im/post/5bde7c926fb9a049f66b8b52)。简单摘要：
**new做了什么：**
>1.创建了一个全新的对象。<br/>
>2.这个对象会被执行`[[Prototype]]`（也就是`__proto__`）链接。<br/>
>3.生成的新对象会绑定到函数调用的this。<br/>
>4.通过`new`创建的每个对象将最终被`[[Prototype]]`链接到这个函数的`prototype`对象上。<br/>
>5.如果函数没有返回对象类型`Object`(包含`Functoin`, `Array`, `Date`, `RegExg`, `Error`)，那么`new`表达式中的函数调用会自动返回这个新的对象。

所以相当于`new`调用时，`bind`的返回值函数`bound`内部要模拟实现`new`实现的操作。
话不多说，直接上代码。
```js
// 第三版 实现new调用
Function.prototype.bindFn = function bind(thisArg){
    if(typeof this !== 'function'){
        throw new TypeError(this + ' must be a function');
    }
    // 存储调用bind的函数本身
    var self = this;
    // 去除thisArg的其他参数 转成数组
    var args = [].slice.call(arguments, 1);
    var bound = function(){
        // bind返回的函数 的参数转成数组
        var boundArgs = [].slice.call(arguments);
        var finalArgs = args.concat(boundArgs);
        // new 调用时，其实this instanceof bound判断也不是很准确。es6 new.target就是解决这一问题的。
        if(this instanceof bound){
            // 这里是实现上文描述的 new 的第 1, 2, 4 步
            // 1.创建一个全新的对象
            // 2.并且执行[[Prototype]]链接
            // 4.通过`new`创建的每个对象将最终被`[[Prototype]]`链接到这个函数的`prototype`对象上。
            // self可能是ES6的箭头函数，没有prototype，所以就没必要再指向做prototype操作。
            if(self.prototype){
                // ES5 提供的方案 Object.create()
                // bound.prototype = Object.create(self.prototype);
                // 但 既然是模拟ES5的bind，那浏览器也基本没有实现Object.create()
                // 所以采用 MDN ployfill方案 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create
                function Empty(){}
                Empty.prototype = self.prototype;
                bound.prototype = new Empty();
            }
            // 这里是实现上文描述的 new 的第 3 步
            // 3.生成的新对象会绑定到函数调用的`this`。
            var result = self.apply(this, finalArgs);
            // 这里是实现上文描述的 new 的第 5 步
            // 5.如果函数没有返回对象类型`Object`(包含`Functoin`, `Array`, `Date`, `RegExg`, `Error`)，
            // 那么`new`表达式中的函数调用会自动返回这个新的对象。
            var isObject = typeof result === 'object' && result !== null;
            var isFunction = typeof result === 'function';
            if(isObject || isFunction){
                return result;
            }
            return this;
        }
        else{
            // apply修改this指向，把两个函数的参数合并传给self函数，并执行self函数，返回执行结果
            return self.apply(thisArg, finalArgs);
        }
    };
    return bound;
}
```
面试官看到这样的实现代码，基本就是满分了，心里独白：这小伙子/小姑娘不错啊。不过可能还会问`this instanceof bound`不准确问题。
上文注释中提到`this instanceof bound`也不是很准确，`ES6 new.target`很好的解决这一问题，我们举个**例子4**:

### `instanceof` 不准确，`ES6 new.target`很好的解决这一问题

```js
function Student(name){
    if(this instanceof Student){
        this.name = name;
        console.log('name', name);
    }
    else{
        throw new Error('必须通过new关键字来调用Student。');
    }
}
var student = new Student('若');
var notAStudent = Student.call(student, '川'); // 不抛出错误，且执行了。
console.log(student, 'student', notAStudent, 'notAStudent');

function Student2(name){
    if(typeof new.target !== 'undefined'){
        this.name = name;
        console.log('name', name);
    }
    else{
        throw new Error('必须通过new关键字来调用Student2。');
    }
}
var student2 = new Student2('若');
var notAStudent2 = Student2.call(student2, '川');
console.log(student2, 'student2', notAStudent2, 'notAStudent2'); // 抛出错误
```
细心的同学可能会发现了这版本的代码没有实现`bind`后的`bound`函数的`name`[MDN Function.name](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/name)和`length`[MDN Function.length](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/length)。面试官可能也发现了这一点继续追问，如何实现，或者问是否看过[`es5-shim`的源码实现`L201-L335`](https://github.com/es-shims/es5-shim/blob/master/es5-shim.js#L201-L335)。如果不限`ES`版本。其实可以用`ES5`的`Object.defineProperties`来实现。
```js
Object.defineProperties(bound, {
    'length': {
        value: self.length,
    },
    'name': {
        value: 'bound ' + self.name,
    }
});
```

### `es5-shim`的源码实现`bind`

直接附上源码（有删减注释和部分修改等）
```js
var $Array = Array;
var ArrayPrototype = $Array.prototype;
var $Object = Object;
var array_push = ArrayPrototype.push;
var array_slice = ArrayPrototype.slice;
var array_join = ArrayPrototype.join;
var array_concat = ArrayPrototype.concat;
var $Function = Function;
var FunctionPrototype = $Function.prototype;
var apply = FunctionPrototype.apply;
var max = Math.max;
// 简版 源码更复杂些。
var isCallable = function isCallable(value){
    if(typeof value !== 'function'){
        return false;
    }
    return true;
};
var Empty = function Empty() {};
// 源码是 defineProperties
// 源码是bind笔者改成bindFn便于测试
FunctionPrototype.bindFn = function bind(that) {
    var target = this;
    if (!isCallable(target)) {
        throw new TypeError('Function.prototype.bind called on incompatible ' + target);
    }
    var args = array_slice.call(arguments, 1);
    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = apply.call(
                target,
                this,
                array_concat.call(args, array_slice.call(arguments))
            );
            if ($Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return apply.call(
                target,
                that,
                array_concat.call(args, array_slice.call(arguments))
            );
        }
    };
    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        array_push.call(boundArgs, '$' + i);
    }
    // 这里是Function构造方式生成形参length $1, $2, $3...
    bound = $Function('binder', 'return function (' + array_join.call(boundArgs, ',') + '){ return binder.apply(this, arguments); }')(binder);

    if (target.prototype) {
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }
    return bound;
};
```
你说出`es5-shim`源码`bind`实现，感慨这代码真是高效、严谨。面试官心里独白可能是：你就是我要找的人，薪酬福利你可以和`HR`去谈下。

## 最后总结一下

1、`bind`是`Function`原型链中的`Function.prototype`的一个属性，它是一个函数，修改`this`指向，合并参数传递给原函数，返回值是一个新的函数。<br>
2、`bind`返回的函数可以通过`new`调用，这时提供的`this`的参数被忽略，指向了`new`生成的全新对象。内部模拟实现了`new`操作符。<br>
3、`es5-shim`源码模拟实现`bind`时用`Function`实现了`length`。<br>
事实上，平时其实很少需要使用自己实现的投入到生成环境中。但面试官通过这个面试题能考察很多知识。比如`this`指向，原型链，闭包，函数等知识，可以扩展很多。<br>
读者发现有不妥或可改善之处，欢迎指出。另外觉得写得不错，可以点个赞，也是对笔者的一种支持。

文章中的例子和测试代码放在`github`中[bind模拟实现 github](https://github.com/lxchuan12/html5/tree/gh-pages/JS%E7%9B%B8%E5%85%B3/%E5%87%BD%E6%95%B0/bind%E6%A8%A1%E6%8B%9F%E5%AE%9E%E7%8E%B0)。[bind模拟实现 预览地址](http://lxchuan12.github.io/html5/JS%E7%9B%B8%E5%85%B3/%E5%87%BD%E6%95%B0/bind%E6%A8%A1%E6%8B%9F%E5%AE%9E%E7%8E%B0/bind-0.html) `F12`看控制台输出，结合`source`面板查看效果更佳。
```js
// 最终版 删除注释 详细注释版请看上文
Function.prototype.bind = Function.prototype.bind || function bind(thisArg){
    if(typeof this !== 'function'){
        throw new TypeError(this + ' must be a function');
    }
    var self = this;
    var args = [].slice.call(arguments, 1);
    var bound = function(){
        var boundArgs = [].slice.call(arguments);
        var finalArgs = args.concat(boundArgs);
        if(this instanceof bound){
            if(self.prototype){
                function Empty(){}
                Empty.prototype = self.prototype;
                bound.prototype = new Empty();
            }
            var result = self.apply(this, finalArgs);
            var isObject = typeof result === 'object' && result !== null;
            var isFunction = typeof result === 'function';
            if(isObject || isFunction){
                return result;
            }
            return this;
        }
        else{
            return self.apply(thisArg, finalArgs);
        }
    };
    return bound;
}
```

## 参考

[OshotOkill翻译的 深入理解`ES6` 简体中文版 - 第三章 函数](https://oshotokill.gitbooks.io/understandinges6-simplified-chinese/content/chapter_3.html)（虽然笔者是看的纸质书籍，但推荐下这本在线的书）<br/>
[MDN Function.prototype.bind](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)<br/>
[冴羽: JavaScript深入之bind的模拟实现](https://juejin.im/post/59093b1fa0bb9f006517b906)<br/>
[《react状态管理与同构实战》侯策：从一道面试题，到“我可能看了假源码”](https://www.jianshu.com/p/6958f99db769)

## 关于

作者：常以**若川**为名混迹于江湖。前端路上 | PPT爱好者 | 所知甚少，唯善学。<br>
[个人博客](https://lxchuan12.github.io/)<br>
[掘金专栏](https://juejin.im/user/57974dc55bbb500063f522fd/posts)，欢迎关注~<br>
[`segmentfault`前端视野专栏](https://segmentfault.com/blog/lxchuan12)，开通了**前端视野**专栏，欢迎关注~<br>
[知乎前端视野专栏](https://zhuanlan.zhihu.com/lxchuan12)，开通了**前端视野**专栏，欢迎关注~<br>
[github blog](https://github.com/lxchuan12/blog)，相关源码和资源都放在这里，求个`star`^_^~

## 微信公众号  若川视野

可能比较有趣的微信公众号，长按扫码关注。也可以加微信 `ruochuan12`，注明来源，拉您进【前端视野交流群】。

![若川视野](../about/wechat-official-accounts-mini.jpg)
