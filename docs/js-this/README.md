# 面试官问：JS的this指向

>`写于2018年12月25日`

## 前言

>大家好，我是[若川](https://lxchuan12.gitee.io)。我倾力持续组织了一年[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（4.1k+人）第一的专栏，写有20余篇源码文章。

>这是面试官问系列的第四篇，旨在帮助读者提升`JS`基础知识，包含`new、call、apply、this、继承`相关知识。<br>
`面试官问系列`文章如下：感兴趣的读者可以点击阅读。<br>
>1.[面试官问：能否模拟实现JS的new操作符](https://juejin.im/post/5bde7c926fb9a049f66b8b52)<br>
>2.[面试官问：能否模拟实现JS的bind方法](https://juejin.im/post/5bec4183f265da616b1044d7)<br>
>3.[面试官问：能否模拟实现JS的call和apply方法](https://juejin.im/post/5bf6c79bf265da6142738b29)<br>
>4.[面试官问：JS的this指向](https://juejin.im/post/5c0c87b35188252e8966c78a)<br>
>5.[面试官问：JS的继承](https://juejin.im/post/5c433e216fb9a049c15f841b)<br>


面试官出很多考题，基本都会变着方式来考察`this`指向，看候选人对`JS`基础知识是否扎实。
读者可以先拉到底部看总结，再谷歌（或各技术平台）搜索几篇类似文章，看笔者写的文章和别人有什么不同（欢迎在评论区评论不同之处），对比来看，验证与自己现有知识是否有盲点，多看几篇，自然就会完善自身知识。
>附上之前写文章写过的一段话：已经有很多关于`this`的文章，为什么自己还要写一遍呢。学习就好比是座大山，人们沿着不同的路登山，分享着自己看到的风景。你不一定能看到别人看到的风景，体会到别人的心情。只有自己去登山，才能看到不一样的风景，体会才更加深刻。<br>

函数的`this`在调用时绑定的，完全取决于函数的调用位置（也就是函数的调用方法）。为了搞清楚`this`的指向是什么，必须知道相关函数是如何调用的。

## 全局上下文

非严格模式和严格模式中this都是指向顶层对象（浏览器中是`window`）。
```js
this === window // true
'use strict'
this === window;
this.name = '若川';
console.log(this.name); // 若川
```

## 函数上下文

### 普通函数调用模式

```js
// 非严格模式
var name = 'window';
var doSth = function(){
    console.log(this.name);
}
doSth(); // 'window'
```
你可能会误以为`window.doSth()`是调用的，所以是指向`window`。虽然本例中`window.doSth`确实等于`doSth`。`name`等于`window.name`。上面代码中这是因为在`ES5`中，全局变量是挂载在顶层对象（浏览器是`window`）中。
事实上，并不是如此。
```js
// 非严格模式
let name2 = 'window2';
let doSth2 = function(){
    console.log(this === window);
    console.log(this.name2);
}
doSth2() // true, undefined
```
这个例子中`let`没有给顶层对象中（浏览器是window）添加属性，`window.name2和window.doSth`都是`undefined`。

严格模式中，普通函数中的`this`则表现不同，表现为`undefined`。
```js
// 严格模式
'use strict'
var name = 'window';
var doSth = function(){
    console.log(typeof this === 'undefined');
    console.log(this.name);
}
doSth(); // true，// 报错，因为this是undefined
```
看过的《你不知道的`JavaScript`》上卷的读者，应该知道书上将这种叫做默认绑定。
对`call`，`apply`熟悉的读者会类比为：
```js
doSth.call(undefined);
doSth.apply(undefined);
```
效果是一样的，`call`，`apply`作用之一就是用来修改函数中的`this`指向为第一个参数的。
第一个参数是`undefined`或者`null`，非严格模式下，是指向`window`。严格模式下，就是指向第一个参数。后文详细解释。<br>
经常有这类代码（回调函数），其实也是普通函数调用模式。
```js
var name = '若川';
setTimeout(function(){
    console.log(this.name);
}, 0);
// 语法
setTimeout(fn | code, 0, arg1, arg2, ...)
// 也可以是一串代码。也可以传递其他函数
// 类比 setTimeout函数内部调用fn或者执行代码`code`。
fn.call(undefined, arg1, arg2, ...);
```

### 对象中的函数（方法）调用模式

```js
var name = 'window';
var doSth = function(){
    console.log(this.name);
}
var student = {
    name: '若川',
    doSth: doSth,
    other: {
        name: 'other',
        doSth: doSth,
    }
}
student.doSth(); // '若川'
student.other.doSth(); // 'other'
// 用call类比则为：
student.doSth.call(student);
// 用call类比则为：
student.other.doSth.call(student.other);
```
但往往会有以下场景，把对象中的函数赋值成一个变量了。
这样其实又变成普通函数了，所以使用普通函数的规则（默认绑定）。
```js
var studentDoSth = student.doSth;
studentDoSth(); // 'window'
// 用call类比则为：
studentDoSth.call(undefined);
```

### `call、apply、bind` 调用模式

上文提到`call`、`apply`，这里详细解读一下。先通过`MDN`认识下`call`和`apply`
[MDN 文档：Function.prototype.call()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call)<br>
**语法**<br>
```js
fun.call(thisArg, arg1, arg2, ...)
```
**thisArg**<br>
在`fun`函数运行时指定的`this`值。需要注意的是，指定的`this`值并不一定是该函数执行时真正的`this`值，如果这个函数处于**非严格模式**下，则指定为`null`和`undefined`的`this`值会自动指向全局对象(浏览器中就是`window`对象)，同时值为原始值(数字，字符串，布尔值)的`this`会指向该原始值的自动包装对象。<br>
**arg1, arg2, ...**<br>
指定的参数列表<br>
**返回值**<br>
返回值是你调用的方法的返回值，若该方法没有返回值，则返回`undefined`。<br>
`apply`和`call`类似。只是参数不一样。它的参数是数组（或者类数组）。

根据参数`thisArg`的描述，可以知道，`call`就是改变函数中的`this`指向为`thisArg`，并且执行这个函数，这也就使`JS`灵活很多。严格模式下，`thisArg`是原始值是值类型，也就是原始值。不会被包装成对象。举个例子：
```js
var doSth = function(name){
    console.log(this);
    console.log(name);
}
doSth.call(2, '若川'); // Number{2}, '若川'
var doSth2 = function(name){
    'use strict';
    console.log(this);
    console.log(name);
}
doSth2.call(2, '若川'); // 2, '若川'
```
虽然一般不会把`thisArg`参数写成值类型。但还是需要知道这个知识。
之前写过一篇文章：[面试官问：能否模拟实现`JS`的`call`和`apply`方法](https://juejin.im/post/5bf6c79bf265da6142738b29)
就是利用对象上的函数`this`指向这个对象，来模拟实现`call`和`apply`的。感兴趣的读者思考如何实现，再去看看笔者的实现。

`bind`和`call`和`apply`类似，第一个参数也是修改`this`指向，只不过返回值是新函数，新函数也能当做构造函数（`new`）调用。
[MDN Function.prototype.bind](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
>`bind()`方法创建一个新的函数， 当这个新函数被调用时`this`键值为其提供的值，其参数列表前几项值为创建时指定的参数序列。<br>
**语法：**
fun.bind(thisArg[, arg1[, arg2[, ...]]])<br>
**参数：**
**thisArg**
调用绑定函数时作为this参数传递给目标函数的值。 如果使用`new`运算符构造绑定函数，则忽略该值。当使用`bind`在`setTimeout`中创建一个函数（作为回调提供）时，作为`thisArg`传递的任何原始值都将转换为`object`。如果没有提供绑定的参数，则执行作用域的`this`被视为新函数的`thisArg`。
**arg1, arg2, ...**
当绑定函数被调用时，这些参数将置于实参之前传递给被绑定的方法。
**返回值**
返回由指定的`this`值和初始化参数改造的原函数拷贝。

之前也写过一篇文章：[面试官问：能否模拟实现`JS`的`bind`方法](https://juejin.im/post/5bec4183f265da616b1044d7)
就是利用`call`和`apply`指向这个`thisArg`参数，来模拟实现`bind`的。感兴趣的读者思考如何实现，再去看看笔者的实现。

### 构造函数调用模式

```js
function Student(name){
    this.name = name;
    console.log(this); // {name: '若川'}
    // 相当于返回了
    // return this;
}
var result = new Student('若川');
```
使用`new`操作符调用函数，会自动执行以下步骤。
>
>1. 创建了一个全新的对象。
>2. 这个对象会被执行`[[Prototype]]`（也就是`__proto__`）链接。
>3. 生成的新对象会绑定到函数调用的`this`。
>4. 通过`new`创建的每个对象将最终被`[[Prototype]]`链接到这个函数的`prototype`对象上。
>5. 如果函数没有返回对象类型`Object`(包含`Functoin`, `Array`, `Date`, `RegExg`, `Error`)，那么`new`表达式中的函数调用会自动返回这个新的对象。

由此可以知道：`new`操作符调用时，`this`指向生成的新对象。
**特别提醒一下，`new`调用时的返回值，如果没有显式返回对象或者函数，才是返回生成的新对象**。
```js
function Student(name){
    this.name = name;
    // return function f(){};
    // return {};
}
var result = new Student('若川');
console.log(result); {name: '若川'}
// 如果返回函数f，则result是函数f，如果是对象{}，则result是对象{}
```
很多人或者文章都忽略了这一点，直接简单用`typeof`判断对象。虽然实际使用时不会显示返回，但面试官会问到。

之前也写了一篇文章[面试官问：能否模拟实现`JS`的`new`操作符](https://juejin.im/post/5bde7c926fb9a049f66b8b52)，是使用apply来把this指向到生成的新生成的对象上。感兴趣的读者思考如何实现，再去看看笔者的实现。

### 原型链中的调用模式

```js
function Student(name){
    this.name = name;
}
var s1 = new Student('若川');
Student.prototype.doSth = function(){
    console.log(this.name);
}
s1.doSth(); // '若川'
```
会发现这个似曾相识。这就是对象上的方法调用模式。自然是指向生成的新对象。
如果该对象继承自其它对象。同样会通过原型链查找。
上面代码使用
`ES6`中`class`写法则是：
```js
class Student{
    constructor(name){
        this.name = name;
    }
    doSth(){
        console.log(this.name);
    }
}
let s1 = new Student('若川');
s1.doSth();
```
`babel` `es6`转换成`es5`的结果，可以去[`babeljs网站转换测试`](https://babeljs.io/)自行试试。
```js
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Student = function () {
    function Student(name) {
        _classCallCheck(this, Student);

        this.name = name;
    }

    _createClass(Student, [{
        key: 'doSth',
        value: function doSth() {
            console.log(this.name);
        }
    }]);

    return Student;
}();

var s1 = new Student('若川');
s1.doSth();
```
由此看出，`ES6`的`class`也是通过构造函数模拟实现的，是一种语法糖。

### 箭头函数调用模式

先看箭头函数和普通函数的重要区别：
>1、没有自己的`this`、`super`、`arguments`和`new.target`绑定。
2、不能使用`new`来调用。
3、没有原型对象。
4、不可以改变`this`的绑定。
5、形参名称不能重复。

箭头函数中没有`this`绑定，必须通过查找作用域链来决定其值。
如果箭头函数被非箭头函数包含，则`this`绑定的是最近一层非箭头函数的`this`，否则`this`的值则被设置为全局对象。
比如：
```js
var name = 'window';
var student = {
    name: '若川',
    doSth: function(){
        // var self = this;
        var arrowDoSth = () => {
            // console.log(self.name);
            console.log(this.name);
        }
        arrowDoSth();
    },
    arrowDoSth2: () => {
        console.log(this.name);
    }
}
student.doSth(); // '若川'
student.arrowDoSth2(); // 'window'
```
其实就是相当于箭头函数外的`this`是缓存的该箭头函数上层的普通函数的`this`。如果没有普通函数，则是全局对象（浏览器中则是`window`）。
也就是说无法通过`call`、`apply`、`bind`绑定箭头函数的`this`(它自身没有`this`)。而`call`、`apply`、`bind`可以绑定缓存箭头函数上层的普通函数的`this`。
比如：
```js
var student = {
    name: '若川',
    doSth: function(){
        console.log(this.name);
        return () => {
            console.log('arrowFn:', this.name);
        }
    }
}
var person = {
    name: 'person',
}
student.doSth().call(person); // '若川'  'arrowFn:' '若川'
student.doSth.call(person)(); // 'person' 'arrowFn:' 'person'
```

### `DOM`事件处理函数调用

#### addEventerListener、attachEvent、onclick

```js
<button class="button">onclick</button>
<ul class="list">
    <li>1</li>
    <li>2</li>
    <li>3</li>
</ul>
<script>
    var button = document.querySelector('button');
    button.onclick = function(ev){
        console.log(this);
        console.log(this === ev.currentTarget); // true
    }
    var list = document.querySelector('.list');
    list.addEventListener('click', function(ev){
        console.log(this === list); // true
        console.log(this === ev.currentTarget); // true
        console.log(this);
        console.log(ev.target);
    }, false);
</script>
```
`onclick`和`addEventerListener`是指向绑定事件的元素。
一些浏览器，比如`IE6~IE8`下使用`attachEvent`，`this`指向是`window`。
顺便提下：面试官也经常考察`ev.currentTarget`和`ev.target`的区别。
`ev.currentTarget`是绑定事件的元素，而`ev.target`是当前触发事件的元素。比如这里的分别是`ul`和`li`。
但也可能点击的是`ul`，这时`ev.currentTarget`和`ev.target`就相等了。

#### 内联事件处理函数调用

```html
<button class="btn1" onclick="console.log(this === document.querySelector('.btn1'))">点我呀</button>
<button onclick="console.log((function(){return this})());">再点我呀</button>
```
第一个是`button`本身，所以是`true`，第二个是`window`。这里跟严格模式没有关系。
当然我们现在不会这样用了，但有时不小心写成了这样，也需要了解。

其实`this`的使用场景还有挺多，比如对象`object`中的`getter`、`setter`的`this`，`new Function()`、`eval`。
但掌握以上几种，去分析其他的，就自然迎刃而解了。
使用比较多的还是普通函数调用、对象的函数调用、`new`调用、`call、apply、bind`调用、箭头函数调用。
那么他们的优先级是怎样的呢。

### 优先级

而箭头函数的`this`是上层普通函数的`this`或者是全局对象（浏览器中是`window`），所以排除，不算优先级。

```js
var name = 'window';
var person = {
    name: 'person',
}
var doSth = function(){
    console.log(this.name);
    return function(){
        console.log('return:', this.name);
    }
}
var Student = {
    name: '若川',
    doSth: doSth,
}
// 普通函数调用
doSth(); // window
// 对象上的函数调用
Student.doSth(); // '若川'
// call、apply 调用
Student.doSth.call(person); // 'person'
new Student.doSth.call(person);
```
试想一下，如果是`Student.doSth.call(person)`先执行的情况下，那`new`执行一个函数。是没有问题的。
然而事实上，这代码是报错的。[运算符优先级](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)是`new`比点号低，所以是执行`new (Student.doSth.call)(person)`
而`Function.prototype.call`，虽然是一个函数（`apply`、`bind`也是函数），跟箭头函数一样，不能用`new`调用。所以报错了。
```js
Uncaught TypeError: Student.doSth.call is not a constructor
```
这是因为函数内部有两个不同的方法：`[[Call]]`和`[[Constructor]]`。
当使用普通函数调用时，`[[Call]]`会被执行。当使用构造函数调用时，`[[Constructor]]`会被执行。`call`、`apply`、`bind`和箭头函数内部没有`[[Constructor]]`方法。

从上面的例子可以看出普通函数调用优先级最低，其次是对象上的函数。
`call（apply、bind）`调用方式和`new`调用方式的优先级，在《你不知道的JavaScript》是对比`bind`和`new`，引用了`mdn`的`bind`的`ployfill`实现，`new`调用时bind之后的函数，会忽略`bind`绑定的第一个参数，(`mdn`的实现其实还有一些问题，感兴趣的读者，可以看我之前的文章：[面试官问：能否模拟实现`JS`的`bind`方法](https://juejin.im/post/5bec4183f265da616b1044d7))，说明`new`的调用的优先级最高。
所以它们的优先级是`new` 调用 > `call、apply、bind` 调用 > 对象上的函数调用 > 普通函数调用。

## 总结

如果要判断一个运行中函数的 `this` 绑定， 就需要找到这个函数的直接调用位置。 找到之后
就可以顺序应用下面这四条规则来判断 `this` 的绑定对象。<br>
1. `new` 调用：绑定到新创建的对象，注意：显示`return`函数或对象，返回值不是新创建的对象，而是显式返回的函数或对象。<br>
2. `call` 或者 `apply`（ 或者 `bind`） 调用：严格模式下，绑定到指定的第一个参数。非严格模式下，`null`和`undefined`，指向全局对象（浏览器中是`window`），其余值指向被`new Object()`包装的对象。<br>
3. 对象上的函数调用：绑定到那个对象。<br>
4. 普通函数调用： 在严格模式下绑定到 `undefined`，否则绑定到全局对象。<br>

`ES6` 中的箭头函数：不会使用上文的四条标准的绑定规则， 而是根据当前的词法作用域来决定`this`， 具体来说， 箭头函数会继承外层函数，调用的 this 绑定（ 无论 this 绑定到什么），没有外层函数，则是绑定到全局对象（浏览器中是`window`）。 这其实和 `ES6` 之前代码中的 `self = this` 机制一样。

`DOM`事件函数：一般指向绑定事件的`DOM`元素，但有些情况绑定到全局对象（比如`IE6~IE8`的`attachEvent`）。

一定要注意，有些调用可能在无意中使用普通函数绑定规则。 如果想“ 更安全” 地忽略 `this` 绑
定， 你可以使用一个对象， 比如` ø = Object.create(null)`， 以保护全局对象。

面试官考察`this`指向就可以考察`new、call、apply、bind`，箭头函数等用法。从而扩展到作用域、闭包、原型链、继承、严格模式等。这就是面试官乐此不疲的原因。

读者发现有不妥或可改善之处，欢迎指出。另外觉得写得不错，可以点个赞，也是对笔者的一种支持。

## 考题

`this`指向考题经常结合一些运算符等来考察。看完本文，不妨通过以下两篇面试题测试一下。<br>
[小小沧海：一道常被人轻视的前端JS面试题](https://www.cnblogs.com/xxcanghai/p/5189353.html)<br>
[从这两套题，重新认识JS的this、作用域、闭包、对象](https://segmentfault.com/a/1190000010981003)

## 扩展阅读

[你不知道的JavaScript 上卷](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch2.md)<br>
[冴羽：JavaScript深入之从ECMAScript规范解读this](https://github.com/mqyqingfeng/Blog/issues/7)<br>
[这波能反杀：前端基础进阶（五）：全方位解读this](https://www.jianshu.com/p/d647aa6d1ae6)<br>

## 关于

作者：常以**若川**为名混迹于江湖。前端路上 | PPT爱好者 | 所知甚少，唯善学。<br>
[个人博客](https://lxchuan12.github.io/)<br>
[掘金专栏](https://juejin.im/user/1415826704971918/posts)，欢迎关注~<br>
[`segmentfault`前端视野专栏](https://segmentfault.com/blog/lxchuan12)，开通了**前端视野**专栏，欢迎关注~<br>
[知乎前端视野专栏](https://zhuanlan.zhihu.com/lxchuan12)，开通了**前端视野**专栏，欢迎关注~<br>
[github blog](https://github.com/ruochuan12/blog)，相关源码和资源都放在这里，求个`star`^_^~

## 微信公众号  若川视野

可能比较有趣的微信公众号，长按扫码关注。也可以加微信 `ruochuan12`，注明来源，拉您进【前端视野交流群】。

![若川视野](../about/wechat-official-accounts-mini.png)
