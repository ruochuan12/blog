用过`React`的读者知道，经常用`extends`继承`React.Component`。

```
// 部分源码
function Component(props, context, updater) {
  // ...
}
Component.prototype.setState = function(partialState, callback){
    // ...
}
const React = {
    Component,
    // ...
}
// 使用
class index extends React.Component{
    // ...
}
```
[点击这里查看 React github源码](https://github.com/facebook/react/blob/master/packages/react/src/ReactBaseClasses.js)

面试官可以顺着这个问`JS`继承的相关问题，比如：**`ES6`的`class`继承用ES5如何实现**。据说很多人答得不好。<br/>
## 构造函数、原型对象和实例之间的关系

要弄懂extends继承之前，先来复习一下构造函数、原型对象和实例之间的关系。
代码表示：
```
function F(){}
var f = new F();
// 构造器
F.prototype.constructor === F; // true
F.__proto__ === Function.prototype; // true
Function.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null; // true

// 实例
f.__proto__ === F.prototype; // true
F.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null; // true
```
笔者画了一张图表示：
![构造函数-原型对象-实例关系图By@若川](https://user-gold-cdn.xitu.io/2019/2/18/169014cf74620047?w=1060&h=596&f=png&s=60144)
## `ES6 extends` 继承做了什么操作
我们先看看这段包含静态方法的`ES6`继承代码：
```
// ES6
class Parent{
    constructor(name){
        this.name = name;
    }
    static sayHello(){
        console.log('hello');
    }
    sayName(){
        console.log('my name is ' + this.name);
        return this.name;
    }
}
class Child extends Parent{
    constructor(name, age){
        super(name);
        this.age = age;
    }
    sayAge(){
        console.log('my age is ' + this.age);
        return this.age;
    }
}
let parent = new Parent('Parent');
let child = new Child('Child', 18);
console.log('parent: ', parent); // parent:  Parent {name: "Parent"}
Parent.sayHello(); // hello
parent.sayName(); // my name is Parent
console.log('child: ', child); // child:  Child {name: "Child", age: 18}
Child.sayHello(); // hello
child.sayName(); // my name is Child
child.sayAge(); // my age is 18
```
其中这段代码里有两条原型链，不信看具体代码。
```
// 1、构造器原型链
Child.__proto__ === Parent; // true
Parent.__proto__ === Function.prototype; // true
Function.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null; // true
// 2、实例原型链
child.__proto__ === Child.prototype; // true
Child.prototype.__proto__ === Parent.prototype; // true
Parent.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null; // true
```
一图胜千言，笔者也画了一张图表示，如图所示：

![ES6继承(extends)关系图By@若川](https://user-gold-cdn.xitu.io/2019/2/17/168fb9a3828f9cb4?w=1188&h=1007&f=png&s=107996)
结合代码和图可以知道。
`ES6 extends` 继承，主要就是：
- 1. 把子类构造函数(`Child`)的原型(`__proto__`)指向了父类构造函数(`Parent`)，
- 2. 把子类实例`child`的原型对象(`Child.prototype`) 的原型(`__proto__`)指向了父类`parent`的原型对象(`Parent.prototype`)。

这两点也就是图中用不同颜色标记的两条线。
- 3. 子类构造函数`Child`继承了父类构造函数`Preant`的里的属性。使用`super`调用的(`ES5`则用`call`或者`apply`调用传参)。
也就是图中用不同颜色标记的两条线。

看过《JavaScript高级程序设计-第3版》 章节`6.3继承`的读者应该知道，这`2和3小点`，正是**寄生组合式继承**，书中例子没有`第1小点`。
`1和2小点`都是相对于设置了`__proto__`链接。那问题来了，什么可以设置了`__proto__`链接呢。

## `new`、`Object.create`和`Object.setPrototypeOf`可以设置`__proto__`
说明一下，`__proto__`这种写法是浏览器厂商自己的实现。
再结合一下图和代码看一下的`new`，`new`出来的实例的__proto__指向构造函数的`prototype`，这就是`new`做的事情。
摘抄一下之前写过文章的一段。[面试官问：能否模拟实现JS的new操作符](https://juejin.im/post/5bde7c926fb9a049f66b8b52)，有兴趣的读者可以点击查看。

### **`new`做了什么：**
>1. 创建了一个全新的对象。
>2. 这个对象会被执行`[[Prototype]]`（也就是`__proto__`）链接。
>3. 生成的新对象会绑定到函数调用的`this`。
>4. 通过`new`创建的每个对象将最终被`[[Prototype]]`链接到这个函数的`prototype`对象上。
>5. 如果函数没有返回对象类型`Object`(包含`Functoin`, `Array`, `Date`, `RegExg`, `Error`)，那么`new`表达式中的函数调用会自动返回这个新的对象。

### `Object.create` `ES5提供的`
`Object.create(proto, [propertiesObject])`
方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__。 
它接收两个参数，不过第二个可选参数是属性描述符（不常用，默认是`undefined`）。对于不支持`ES5`的浏览器，`MDN`上提供了`ployfill`方案。
[MDN Object.create()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)

```
// 简版：也正是应用了new会设置__proto__链接的原理。
if(typeof Object.create !== 'function'){
    Object.create = function(proto){
        function F() {}
        F.prototype = proto;
        return new F();
    }
}
```

### `Object.setPrototypeOf` `ES6提供的`
[`Object.setPrototypeOf` `MDN`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf)

`Object.setPrototypeOf()` 方法设置一个指定的对象的原型 ( 即, 内部`[[Prototype]]`属性）到另一个对象或  `null`。
`Object.setPrototypeOf(obj, prototype)`

```
`ployfill`
// 仅适用于Chrome和FireFox，在IE中不工作：
Object.setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
  obj.__proto__ = proto;
  return obj; 
}
```
`nodejs`源码就是利用这个实现继承的工具函数的。
[nodejs utils inherits](https://github.com/nodejs/node/blob/master/lib/util.js#L295-L313)
```
function inherits(ctor, superCtor) {
  if (ctor === undefined || ctor === null)
    throw new ERR_INVALID_ARG_TYPE('ctor', 'Function', ctor);

  if (superCtor === undefined || superCtor === null)
    throw new ERR_INVALID_ARG_TYPE('superCtor', 'Function', superCtor);

  if (superCtor.prototype === undefined) {
    throw new ERR_INVALID_ARG_TYPE('superCtor.prototype',
                                   'Object', superCtor.prototype);
  }
  Object.defineProperty(ctor, 'super_', {
    value: superCtor,
    writable: true,
    configurable: true
  });
  Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
}
```
## `ES6`的`extends`的`ES5`版本实现
知道了`ES6 extends`继承做了什么操作和设置`__proto__`的知识点后，把上面`ES6`例子的用`ES5`就比较容易实现了，也就是说**实现寄生组合式继承**，简版代码就是：
```
// ES5 实现ES6 extends的例子
function Parent(name){
    this.name = name;
}
Parent.sayHello = function(){
    console.log('hello');
}
Parent.prototype.sayName = function(){
    console.log('my name is ' + this.name);
    return this.name;
}

function Child(name, age){
    // 相当于super
    Parent.call(this, name);
    this.age = age;
}
// new
function object(){
    function F() {}
    F.prototype = proto;
    return new F();
}
function _inherits(Child, Parent){
    // Object.create
    Child.prototype = Object.create(Parent.prototype);
    // __proto__
    // Child.prototype.__proto__ = Parent.prototype;
    Child.prototype.constructor = Child;
    // ES6
    // Object.setPrototypeOf(Child, Parent);
    // __proto__
    Child.__proto__ = Parent;
}
_inherits(Child,  Parent);
Child.prototype.sayAge = function(){
    console.log('my age is ' + this.age);
    return this.age;
}
var parent = new Parent('Parent');
var child = new Child('Child', 18);
console.log('parent: ', parent); // parent:  Parent {name: "Parent"}
Parent.sayHello(); // hello
parent.sayName(); // my name is Parent
console.log('child: ', child); // child:  Child {name: "Child", age: 18}
Child.sayHello(); // hello
child.sayName(); // my name is Child
child.sayAge(); // my age is 18
```
我们完全可以把上述`ES6的例子`通过[`babeljs`](https://babeljs.io/repl)转码成`ES5`来查看，更严谨的实现。

```
// 对转换后的代码进行了简要的注释
"use strict";
// 主要是对当前环境支持Symbol和不支持Symbol的typeof处理
function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof(obj) {
            return typeof obj;
        };
    } else {
        _typeof = function _typeof(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
    }
    return _typeof(obj);
}
// _possibleConstructorReturn 判断Parent。call(this, name)函数返回值 是否为null或者函数或者对象。
function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
        return call;
    }
    return _assertThisInitialized(self);
}
// 如何 self 是void 0 （undefined） 则报错
function _assertThisInitialized(self) {
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}
// 获取__proto__
function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
}
// 寄生组合式继承的核心
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    // Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__。 
    // 也就是说执行后 subClass.prototype.__proto__ === superClass.prototype; 这条语句为true
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
}
// 设置__proto__
function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _setPrototypeOf(o, p);
}
// instanceof操作符包含对Symbol的处理
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}

function _classCallCheck(instance, Constructor) {
    if (!_instanceof(instance, Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
// 按照它们的属性描述符 把方法和静态属性赋值到构造函数的prototype和构造器函数上
function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
// 把方法和静态属性赋值到构造函数的prototype和构造器函数上
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}

// ES6
var Parent = function () {
    function Parent(name) {
        _classCallCheck(this, Parent);
        this.name = name;
    }
    _createClass(Parent, [{
        key: "sayName",
        value: function sayName() {
            console.log('my name is ' + this.name);
            return this.name;
        }
    }], [{
        key: "sayHello",
        value: function sayHello() {
            console.log('hello');
        }
    }]);
    return Parent;
}();

var Child = function (_Parent) {
    _inherits(Child, _Parent);
    function Child(name, age) {
        var _this;
        _classCallCheck(this, Child);
        // Child.__proto__ => Parent
        // 所以也就是相当于Parent.call(this, name); 是super(name)的一种转换
        // _possibleConstructorReturn 判断Parent.call(this, name)函数返回值 是否为null或者函数或者对象。
        _this = _possibleConstructorReturn(this, _getPrototypeOf(Child).call(this, name));
        _this.age = age;
        return _this;
    }
    _createClass(Child, [{
        key: "sayAge",
        value: function sayAge() {
            console.log('my age is ' + this.age);
            return this.age;
        }
    }]);
    return Child;
}(Parent);

var parent = new Parent('Parent');
var child = new Child('Child', 18);
console.log('parent: ', parent); // parent:  Parent {name: "Parent"}
Parent.sayHello(); // hello
parent.sayName(); // my name is Parent
console.log('child: ', child); // child:  Child {name: "Child", age: 18}
Child.sayHello(); // hello
child.sayName(); // my name is Child
child.sayAge(); // my age is 18
```
如果对JS继承相关还是不太明白的读者，推荐阅读以下书籍的相关章节，可以自行找到相应的`pdf`版本。
## 推荐阅读JS继承相关的书籍章节
《JavaScript高级程序设计第3版》-第6章 面向对象的程序设计，6种继承的方案，分别是原型链继承、借用构造函数继承、组合继承、原型式继承、寄生式继承、寄生组合式继承。[图灵社区本书地址](http://www.ituring.com.cn/book/946)，后文放出`github`链接，里面包含这几种继承的代码`demo`。

《JavaScript面向对象编程第2版》-第6章 继承，12种继承的方案。1.原型链法（仿传统）、2.仅从原型继承法、3.临时构造器法、4.原型属性拷贝法、5.全属性拷贝法（即浅拷贝法）、6.深拷贝法、7.原型继承法、8.扩展与增强模式、9.多重继承法、10.寄生继承法、11.构造器借用法、12.构造器借用与属性拷贝法。

[ES6标准入门-第21章class的继承](http://es6.ruanyifeng.com/#docs/class-extends)

[《深入理解`ES6`》-第9章](https://oshotokill.gitbooks.io/understandinges6-simplified-chinese/content/chapter_9.html) `JavaScript`中的类

《你不知道的`JavaScript`-上卷》第6章 行为委托和附录A `ES6中的class`

## 总结
继承对于JS来说就是父类拥有的方法和属性、静态方法等，子类也要拥有。子类中可以利用原型链查找，也可以在子类调用父类，或者从父类拷贝一份到子类等方案。
继承方法可以有很多，重点在于必须理解并熟
悉这些对象、原型以及构造器的工作方式，剩下的就简单了。**寄生组合式继承**是开发者使用比较多的。
回顾寄生组合式继承。主要就是三点：
- 1. 子类构造函数的`__proto__`指向父类构造器，继承父类的静态方法
- 2. 子类构造函数的`prototype`的`__proto__`指向父类构造器的`prototype`，继承父类的方法。
- 3. 子类构造器里调用父类构造器，继承父类的属性。
行文到此，文章就基本写完了。文章代码和图片等资源放在这里[github inhert](https://github.com/lxchuan12/html5/tree/gh-pages/JS%E7%9B%B8%E5%85%B3/oop/inherit)和[`demo`展示`es6-extends`](http://lxchuan12.github.io/html5/JS%E7%9B%B8%E5%85%B3/oop/inherit/7.es6-extends.html)，结合`console、source`面板查看更佳。

读者发现有不妥或可改善之处，欢迎评论指出。另外觉得写得不错，可以点赞、评论、转发，也是对笔者的一种支持。

## 关于
作者：常以**若川**为名混迹于江湖。前端路上 | PPT爱好者 | 所知甚少，唯善学。<br>
[个人博客](https://lxchuan12.github.io/)<br>
[`segmentfault`前端视野专栏](https://segmentfault.com/blog/lxchuan12)，开通了**前端视野**专栏，欢迎关注<br>
[掘金专栏](https://juejin.im/user/57974dc55bbb500063f522fd/posts)，欢迎关注<br>
[知乎前端视野专栏](https://zhuanlan.zhihu.com/lxchuan12)，开通了**前端视野**专栏，欢迎关注<br>
[github](https://github.com/lxchuan12)，欢迎`follow`~
