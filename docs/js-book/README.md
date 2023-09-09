# 《JavaScript语言精粹 修订版》 读书笔记

>`写于2017年07月23日`

>大家好，我是[若川](https://lxchuan12.gitee.io)。我倾力持续组织了一年[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（4.1k+人）第一的专栏，写有20余篇源码文章。

> 之前看到这篇文章，[前端网老姚浅谈：怎么学JavaScript？](https://zhuanlan.zhihu.com/p/23265155?refer=dreawer)，说到怎么学习JavaScript，那就是**看书、分析源码。**
>**10本书读2遍的好处，应该大于一本书读20遍。**
>**看书主动学习，看视频是被动学习。**
>**看书和分析源码的时机**。但已经工作一年半载时，正是提高的好时候，此时可以去看书了。全面系统的梳理知识点，扫清自己的盲区。如果只是靠项目经验是不够的，通过项目来学习，那>肯定是必须的，工作本身就是一个学习的过程。
>**怎么把一本书看完呢？**很简单，敲。文字加代码都敲。
>比较认同老姚的说法。去年毕业到现在，我也算是工作一年了，是时候看书查缺补漏了。

于是我就先把这本薄的经典书《JavaScript语言精粹 修订版》[豆瓣读书本书简介](https://book.douban.com/subject/11874748/)（总共10章，除去附录，才100页），读完并记录了一些笔记。基本算是摘抄书本的，自己联想到了一些知识和资料也扩展了一下。总体写下来近一万字。读书笔记还可以分享给别人看。回顾时，书不在身边还可以看看自己的笔记。想想这类经典书记一遍动手敲一遍也是很值得的。不过这读书笔记中可能会有一些错别字，阅读时如果发现欢迎指正。

## 第1章 精华

大多数语言都有精华和糟粕。`JavaScript`令人诡异的事情是，在对这门语言没有的太多了解，甚至对编程都没有太多了解的情况下，你也能用它来完成工作。
看到这里不禁想起：
>张鑫旭大牛在[《我对知乎前端相关问题的十问十答》](http://www.zhangxinxu.com/wordpress/2017/06/ten-question-about-frontend-zhihu/)
非计算机专业背景学习JS要点有这一条：
>所有继承和原型相关内容跳过，注意，是跳过，不要看！没有这些JS一样可以活得很好，你的日常工作一样玩得飞起，当然，你没忍住看了相关知识也没关系，因为你会发现自己看不懂的；

`JavaScript`的函数是（主要）基于**词法作用域**的顶级对象。
>译注：`JavaScript`中的函数是根据词法来划分作用域的，而不是动态划分作用域的。具体内容参见《`JavaScript`权威指南》中译第5版相关章节“8.8.1 词法作用域”。
JavaScript有非常强大的对象字面量表示法。这种表示法是JSON的灵感来源。
原型继承是JavaScript中一个有争议的特性。

《`ECMAScript`编程语言》第3版定义了`JavaScript`的标准。
[ES3标准](http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf)
**扩展：**[颜海镜大牛整理的ES3中文版](http://yanhaijing.com/es5/ECMAScript%E8%A7%84%E8%8C%83-%E7%AC%AC%E4%B8%89%E7%89%88_%E4%B8%AD%E6%96%87%E7%89%88.pdf)
[颜海镜大牛整理的ES5中文版](http://yanhaijing.com/es5/#about)
[W3c ES5中文版](https://www.w3.org/html/ig/zh/wiki/ES5#.E7.A8.8B.E5.BA.8F)
[阮一峰大牛的书籍《ES6标准入门2》](http://es6.ruanyifeng.com/)
更多内容可参见这篇文章：[ECMAScript 2018 标准导读](https://zhuanlan.zhihu.com/p/27537439)

一个简单的例子：
```js
Function.prototype.method = function(name, func) {
  this.prototype[name] = func;
  return this;
}
```
书中贯彻始终都会用到这个`method`方案，作者将会在第4章解释它。

## 第2章 语法

本章主要用铁路图（语法图）表示语法。
主要有：空白、标识符、数字、字符串、语句、表达式、字面量、函数。
`typeof` 运算符产生的值有`'number'`, `'string'`,`'boolean'`,`'undefined'`,`'function'`,`'object'`。如果运算数是一个数组或者是`null`,那么结果是`'object'`,这其实是不对的。

## 第3章 对象

`JavaScript`简单数据类型包括数字、字符串、布尔值，`null`值和`undefined`值。其他所有值都是对象。
数组、字符串和布尔值“貌似”对象，因为它们拥有方法（包装对象），但它们是不可变的。
对象是属性的容器，其中每个属性都拥有名字和值。属性名可以是包括空字符串在内的所有字符串，属性值可以是除了`undefined`值之外的任何值。

`JavaScript`包含一种原型链的特性，允许对象继承到另一个对象的属性。正确地使用它能减少对象初始化时的消耗的时间和内存。
**检索**
`.`,`[]`两种检索方式，推荐点`.`表示法。
尝试重`undefined`的成员属性中取值将会导致`TypeError`异常，这时可以通过`&&`来避免错误。
**更新**
如果属性名已经存在对象里。那么属性的值会被替换。如果之前没有拥有那个属性名，那么该属性将被扩充到对象中。
**引用**
对象通过引用来传递。它们永远不会被复制。
**原型**
所有通过对象字面量创建的对象都链接到`Object.prototype`。
创建新对象时，可以选择某个对象作为它的原型。
```js
if (typeof Object.create !== 'function') {
  Object.create = function(o) {
    var F = function () {};
    F.prototype = o;
    return new F();
  };
}
```
原型连接只有在检索值的时候才被用到。如果尝试去获取对象的某个属性值，但对象没有此属性名，那么`JavaScript`会试着从原型对象中获取属性值。如果那个原型对象也没有该属性，那么再从它的原型中寻找，依此类推，直到该过程最后达到终点`Object.prototype`。如果想要的属性完全不存在原型链中，那么结果就是 `undefined`值。这个过程称为**委托**。
原型关系是一种动态的关系。
**反射**
原型链上的所有属性都会产生值。有两种方案可以处理掉对象上不需要的属性。
①程序检查时丢弃值为函数的属性。但有可能有些值确实是函数，所以该方法不可靠。
②使用`hasOwnProperty`方法，如果是对象拥有独有的属性，则返回`true`。该方法不会检查原型链。
**枚举**
① `for in`可以遍历一个对象中所有的属性名。但包含函数和一些不关心的原型中属性。而且顺序不确定，可以用 `hasOwnProperty`方法和`typeof`排除函数。
②`for` 循环不会出现`for in`那些情况。
**删除**
delete运算符可以用来删除对象的属性。
**减少全局变量的污染**
可以把全局性的资源纳入一个名称空间之下。这样做能减少冲突。

## 第4章 函数

函数用于①代码复用②信息隐藏③组合调用。一般来说，所谓编程，就是将一组需求分节成一组函数与数据结构的技能。
`JavaScript`的函数就是对象。
函数对象连接到`Function.prototype`(该原型对象本身连接到`Object.prototype`)。
每个函数在创建时会附加两个隐藏属性，函数的上下文和实现函数行为的代码。
每个函数对象在创建时也随配有一个`prototype`属性。它的值是一个拥有`constructor`属性且值为该函数的对象。
**函数字面量**
函数字面量包括4个部分。①保留字`function`②函数名，可以省略，③一组参数④一组语句。
函数字面量可以出现在任何允许表达式出现的地方。一个内部函数除了可以访问自己的参数和变量，同时也可以自由访问把它嵌套在其中的父函数的参数和变量。通过函数字面量创建的函数对象包含一个连接到外部上下文的连接。这被称为**闭包**。
**调用**
除了声明时定义的形式参数，每一个函数还接收两个附加的参数：`this`和`argument`。在`JavaScript`中一共有四种调用模式。①方法调用模式，②函数调用模式③构造器调用模式④`apply`调用模式。

（`this`指向问题一直困扰很多人。我一般是这样记的，谁调用`this`就指向谁。）

**方法调用模式**
对象的方法执行,`this`指向该对象。比如：
```js
var myObj = {
  value: 0,
  showValue: function() {
    console.log('value:', this.value);
  }
}
myObj.showValue();  // value: 0
```
**函数调用模式**
```js
var add = function(a,b) {
    return a + b;
}
add(3,4);  //7
window.add(3,4);  //7
// 这种this被绑定到全局对象（window）。
// 可以理解是window.add(3,4);
```
有种简单的办法就是`var that = this;`把`this`存储下。
例：
```js
var myObj = {
  value: 0,
  age: 20,
  showValue: function() {
    console.log('value:',this.value);
    var  that = this;
    var showAge = function() {
        // window上没有age，所以是undefined
        console.log('这里的this是window ---age:', this.age);  // undefined
        console.log('age:', that.age);  // 20
     }
     showAge();
  }
}
myObj.showValue();  // 0， undefined，
```

**构造器调用模式**
`JavaScript`是一门基于原型继承的语言。
如果在一个函数前面带上`new` 来调用。那么背地利将会创建一个连接到该函数的`prototype`成员的新对象，同时this会被绑定到那个新对象上。
`new` 前缀也会改变`return` 语句的行为。
例：
```js
var Quo = function (string) {
  this.status = string;
}
Quo.prototype.get_status = function () {
  return this.status;
}
var myQuo = new Quo('confused'); // 'confused'
```
一个函数，如果创建的目的就是希望结合`new` 前缀来调用。那么它就被称为构造器函数。按照约定，它们保存在以大写函数命名的变量里。如果调用构造器函数时没有在前面加上`new`,可能会发生非常糟糕的事情，既没有编译时的警告，也没有运行时广告，所以大写约定非常重要。
作者不推荐这种形式的构造器函数。有更好的替代方式。
**Apply调用模式**
`JavaScript`是一门函数式的面向对象编程语言，所以对象可以拥有方法。
`apply`方法让我们构建一个参数数组传递给调用函数，它也允许我们选择`this`的值。
**参数**
`arguments`，虽然拥有`length`属性，但不是真正的数组。而是类似数组（`array-like`）的对象。
**返回**
`return` 可用来是函数提前返回。当`return` 被执行时，函数立即返回而不再执行余下的语句。
一个函数总会返回一个值，如果没指定，那就是返回`undefined`值。
如果函数调用时在前面加上了`new` 前缀，且返回值不是一个对象，则返回`this`（该新对象）。
**异常**
`JavaScript`提供了一套异常处理机制。
`throw`语句和`try catch`,`try catch`中`finally`是可选的。
**扩展类型的功能**
`JavaScript`允许给语言的基本类型扩充功能。在第3章中我们已经看到，可以通过`Object.prototype`添加方法，可以让该方法对所有对象都可用。这样的方式对函数、数组、字符串、数字、正则表达式和布尔值同样适用。

例如：
```js
Function.prototype.method = function () {
  this.prototype[name]  = func;
  return this;
}
```
基本类型的原型是公用结构，所以在类库混用时务必小心。一个保险的做法就是只在确认没有该方法时才添加它。
```js
Function.prototype.methods = function(name, func) {
  if (!this.prototype[name]) {
      this.prototype[name] = func;
  }
  return this;
}
```
**递归**
递归函数就是会直接或间接地调用自身的一种函数。递归是一种强大的编程技术，递归是用一般的方式去解决每一个子问题。书中举了一个**汉诺塔**的例子，是程序设计中经典递归问题。详细说明可以参见 [百度百科“汉诺塔”词条](http://baike.baidu.com/view/191666.htm)。
一些语言提供了尾递归优化。尾递归是一种在函数的最后执行调用语句的特殊形式的递归。参见[Tail call](https://en.wikipedia.org/wiki/Tail_call)。 ES6版本扩展了尾递归。参见阮一峰老师的《ES6标准入门》中的[尾调用优化](http://es6.ruanyifeng.com/#docs/function#尾调用优化)
**作用域**
在编程语言中，作用域控制着变量与参数的可见性和声明周期。
书中指出当前`JavaScript`没有块级作用域。因为没有块级作用域，所以最好的做法是在函数体的顶部声明函数中可能用到的所有变量。不过`ES6`扩展了有块级作用域。
**闭包**
作用域的好处是内部函数可以访问定义它们的外部函数的参数和变量（除了`this`和`arguments`）。
例子：
```html
<ul class="list">
    <li>0</li>
    <li>1</li>
    <li>2</li>
    <li>3</li>
</ul>
```
```js
// 点击相应节点时，显示对应的序号。可以使用闭包来解决。
var add_the_handlers = function() {
    var helper = function(i) {
        return function(e) {
            alert(i);
        }
    }
    var i;
    for (i = 0; i < nodes.length; i += 1) {
        nodes[i].onclick = helper(i);
    }
}
// 扩展 另外可以用let i = 0，或者把nodes类数组转成数组等方案实现。
// 闭包特性：1、函数内再嵌套函数，2、内部函数可以调用外层的参数和变量，3、参数和变量不会被垃圾回收机制回收。
// 闭包优点 灵活和方便，便于封装。缺点：空间浪费、内存泄露、性能消耗。
```
**回调**
发起异步请求，提供一个当服务器响应到达时随即出发的回调函数。异步函数立即返回，这样客户端就不会被阻塞。
**模块**
我们可以使用函数和闭包来构造模块。模块是一个提供接口却隐藏状态与实现的函数或对象。
举例：给`String`添加一个`deentityify`方法。它的任务是寻找字符串中的`HTML`字符实体并把它们替换成对应的字符。
```js
String.method('deentityify', function () {
    // 字符实体表。它映射字符实体的名字到对应的字符。
    var entity = {
        quot: '"',
        lt: '<',
        gt: '>'
    };
    // 返回 deentityify方法
    return function () {
        return this.replace(/&([^&;]+);)/g,
        function (a,b) {
            var r = entity[b];
            return typeof r === 'string'? r : a;
        }
    };
}());
```
模块模式利用了函数作用域和闭包来创建被绑定对象与私有成员的关联，在上面例子中，只有`deentityify`方法有权访问字符实体表这个数据对象。
模块模式的一般形式是：一个定义了私有变量和函数的函数；利用闭包创建可以访问私有变量和函数的特权函数；最后返回这个特权函数，或者把它们保存到一个可以访问的地方。
使用模块模式就可以摒弃全局变量的使用。它促进了信息隐藏和其他优秀的设计实践。对于应用程序的封装，或者构造其他单例对象，模块模式非常有效。
>单例译注
>模块模式通常结合单例模式使用。`JavaScript`的单例就是用对象字面量表示法创建的对象，对象的属性值可以是数值或函数，并且属性值在该对象的生命周期中不会发生变化。更多内容参见：[单例模式](https://en.wikipedia.org/wiki/%E5%8D%95%E4%BE%8B%E6%A8%A1%E5%BC%8F)

**级联**
有一些方法没有返回值。如果我们让这些方法返回`this`而不是`undefined`，就可以启用级联。
在一个级联中，我们可以在单独一条语句中依次调用同一个对象的很多方法。比如`jQuery`获取元素、操作样式、添加事件、添加动画等。
**柯里化**
柯里化，是把多参数函数转换为一系列单参数函数并进行调用的技术。更多详情可参见：[柯里化](https://en.wikipedia.org/wiki/%E6%9F%AF%E9%87%8C%E5%8C%96)
函数也是值。柯里化允许我们把函数与传递给它的参数相结合，产生一个新的函数。
```js
var add1 = add.curry(1);
document.writeln(add1(6));
```
JavaScript并没有curry方法，但可以扩展该功能。
arguments不是真正的数组，所以使用了Array.prototype.slice方法。
```js
Function.method('curry',function(){
    var slice = Array.prototype.slice,
    args = slice.apply(arguments),
    that = this;
    return function() {
        return that.apply(null, args.concat(slice.apply(arguments)));
    }
});
```
**记忆**
函数可以将先前操作的结果记录在某个对象里，从而避免无谓的重复运算。这种优化称作记忆。
比如说，我们想要一个递归函数来计算`Fibonacci`(斐波那契)数列，它的特点是，前面相邻两项之和等于后一项的值。更多参考：[斐波那契](https://en.wikipedia.org/wiki/%E6%96%90%E6%B3%A2%E9%82%A3%E5%A5%91)。最前面两个数字是0和1。
```js
var fibonacci = function() {
    return n < 2? n : fibonacci(n-1) + fibonacci(n-2);
}
```
这样虽然能完成工作，但它做了很多无谓的工作。
构造一个带有记忆功能的函数：
```js
var memoizer = function(mome, formula) {
    var recur = function(n) {
        var result = meno[n];
        if (typeof result !== 'number') {
            result = formula(recur, n);
            meno[n] = result;
        }
        return result;
    };
    return recur;
}
```
再用这个`memoizer`函数来定义`fibonacci`函数，提供其初始的`memo`数组和`formula`函数。
```js
var fibonacci = memoizer([0,1],function(recur, n){
    return recur(n-1) + recur (n-2);
})
```
极大的减少了我们的工作量。例如要产生一个记忆的阶乘函数，只需要提供基本的阶乘公式即可：
```js
var factorial = meoizer([1,1], function(recur, n){
    return n * recur(n-1);
});
```

## 第5章 继承

**伪类**
`JavaScript`的原型存在诸多矛盾。它不直接让对象从其他对象继承，反而插入了一个多余的间接层：通过构造器函数产生对象。
`Function`构造器产生的函数对象会运行类似这样的一些代码：
```js
this.prototype =  {constructor:this}
```
新函数对象被赋予一个`prototype`属性，这个`prototype`对象是存放继承特征的地方。

当采用构造器调用模式，即用`new`前缀去调用一个函数时，函数执行的方式会被修改。如果`new `运算符是一个方法而不是一个运算符，它可能像这样执行：

```js
Function.method('new',function(){
    // 创建一个新对象，它继承自构造器函数的原型对象。
    var that = Object.create(this.prototype);
    // 调用构造器函数，绑定 -this- 到新对象上。
    var other = this.apply(that,arguments);
    // 如果它的返回值不是一个对象，就返回该新对象。
    return (typeof other === 'object' && other) || that;
});

```
所有构造器函数都约定命名成大写字母。一种更好的备选方案就是根本不使用`new`。
**对象说明符**
就是指传多个参数时，可以直接传递一个对象。
**原型**
可以用`Object.create`方法构造出更多实例来。
**函数化**
迄今为止，我们所看到的继承模式的一个弱点就是没法保护隐私。对象的所有属性都是可见的。我们无法得到私有变量和私有函数。
幸运的是，我们有一个更好的选择，那就是**应用模块模式**。
我们从构造一个生成对象的函数开始。我们以小写字母开头来命名。
该函数包括以下四个步骤
1、创建一个新对象。
2、有选择地私有实例变量和方法。
3、给这个新对象扩充方法。
4、返回那个新对象。
以下是一个函数化构造器的伪代码模板
```js
var constructor = function (spec, my) {
    var that, 其他的私有实例变量；
    my = my || {};
    把共享的变量和函数添加到my中
    that = 一个新对象
    添加给 that 的特权方法
    return that;
}
```
函数化模式有很大的灵活性。它相比伪类模式不仅带来的工作更少，还让我们更好的封装和信息隐藏，以及访问父类方法的能力。
**部件**
我们可以从一套部件中把对象组装出来。

## 第6章 数组

数组是一段线性分配的内存，它通过整数计算偏移并访问其中的元素。
数组是一种性能出色的数据结构。不幸的是，`JavaScript`没有像此类数组一样的数据结构。
**数组字面量**
对象字面量
数组继承了`Array.prototype`大量有用的方法。而对象字面量是继承自`Object.prototype`。
数组有`length`属性，而对象没有。
**长度**
每个数组都有一个`length`属性。
可以直接设置`length`的值。设置更大的length不会给数组分配更多的空间，而设小导致所有下标大于等于新length的属性被删除。
```js
var arr = [1,2,3];
arr.length = 1;
console.log(arr) // [1]
```
也可以通过`length`来通过添加值
```js
var arr = [1,2,3];
arr[arr.length] = 4;
console.log(arr) // [1,2,3,4]
```
有时用`push`方法更方便。
**删除**
由于`JavaScript`的数组也是对象，所以`delete`运算符可以用来从数组中移出元素。移除后，长度不变，原位置上变成了`undefined`。
可以使用`Array.prototype.splice`方法删除数组。
**枚举**
JS数组就是对象，所以`for in`语句可以用来遍历数据的所有属性。
**不过**，`for in`无法保证属性顺序。并且可能从原型链中得到意外的属性。
`for`循环可以避免以上问题。
**容易混淆的地方**
```js
typeof [] === "object"; // true
typeof {} === "object"; // true
```
识别是否是数组。
```js
// 方法一、
var is_array = function (value) {
  return value && typeof value === 'object' && value.constructor === Array;
};
```
但它在识别从不同窗口（window）或帧（frame）里的构造的数组时会失败。
有一个更好的方式：
```js
// 方法二、
var is_array = function (value) {
  return Object.prototype.toString.apply(value) === '[object Array]';
}
```
**扩展**：
ES5 提供了Array.isArray()的方法。不过兼容性是IE9+。
要做到兼容，可以用如下方法。MDN上提供的。[MDN Array.isArray](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
```js
// 方法三、
if (!Array.isArray){
  Array.isArray = function(arg){
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}
```
 ```js
var arr = [];
// 方法四
arr instanceof Array;
// 方法五
Array.prototype.isPrototypeOf(arr);
// 方法六
Object.getPrototypeOf(arr) === Array.prototype;
```
方法四、[**instanceof** 运算符用来测试一个对象在其原型链中是否存在一个构造函数的 prototype 属性。](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/instanceof)
方法五、[**isPrototypeOf()** 方法用于测试一个对象是否存在于另一个对象的原型链上。](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/isPrototypeOf)
方法六、[**Object.getPrototypeOf()** 方法返回指定对象的原型（即, 内部[[Prototype]]属性的值）。](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/GetPrototypeOf)
小结：除了方法二、三外，面对复杂的环境，其他的都不能准确的判断是否是数组。
**方法**
`JavaScript`提供了一套数组可用的方法，这些方法是被存储在Array.prototype中的函数。
`Object.prototype`是可以扩充的。
`Array.prototype`也是可以扩充的。
`ES5`中提供的`Object.create`方法。这方法用在数组是没有意义的，因为它产生的是一个对象，而不是一个数组，产生的对象将继承这个数组的值和方法，但它没有`length`特殊属性。
**指定初始值**
`JavaScript`的数组通常不会预设值。书中写了一个循环来扩展，生成初始值。
**扩展：**`ES6`中提供了`fill`来填充。比如：
```js
['a','b','c'].fill(0);   // [0,0,0]
new Array(3).fill(0);   // [0,0,0]

// fill方法还可以接受第二、第三个参数，用于指定填充的起始位置和结束位置（不包含）。
new Array(3).fill(0,1,2); // [ ,0, ,]  空位不是undefined。空位没有任何值。ES6则是明确将空位转为undefined。
```

## 第7章 正则表达式

正则表达式对字符串中的信息实现查找、替换和提取操作。
可处理正则表达式的方法有`regexp.exec`、`regexp.test`、`string.match`、`string.search`和`string.split`。通常来说，正则相较于等效的字符串处理有着显著的性能优势。

**一个例子**
```js
// 正则表达式必须写在一行中
var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
var url = "http://www.ora.com:80/goodparts?q#fragment";
var result = parse_url.exec(url);
// ……
```
依次匹配到的是：
```js
url: 'http://www.ora.com:80/goodparts?q#fragment',
scheme: 'http',
slash: '//'
host: 'www.ora.com'
port:'80'
path:'goodparts'
query: 'q'
hash: 'fragment'
```

个人扩展：这里推荐 [在线测试正则表达式的网站regex101](https://regex101.com/)，默认是PHP语言，选择JavaScript语言。
[在线图形化RegExp工具](https://regexper.com/#%5Cd%2B)
[MDN RegExp.prototype.exec()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec)
大概解释下这个正则，
这里的`^` 起始位置，`$`结束位置
`()` 分组捕获 `?:`不捕获
`.`表示除换行以外的任意单个字符，对于码点大于`0xFFFF`的`Unicode`字符，点(`.`)不能识别（`ES6`中加`u`修饰符才可识别），`+`表示一个或多个，`*`表示零个或多个，`?`表示`0`个或一个。[]表示或者，里面符合一个即可。
`\d`表示数字`0-9`。
不严谨的正则表达式是一个常见的安全漏洞的发源地。在执行某些匹配时，嵌套的正则表达式也能导致极其恶劣的性能问题。因此简单是最好的策略。

再看一个 **匹配数字**的例子。
```js
var parse_number = /^-?\d+(?:\.\d*)?(?:e[+\-]?\d+)?$/i;
parse_number.test('1'); // true
parse_number.test('number'); // false
parse_number.test('98.6'); // true
parse_number.test('132.21.86.100'); // false
parse_number.test('123.45E-67'); // true
parse_number.test('123.45D-67'); // false
```
**结构**
有两个方法来创建一个`RegExp`对象。优先考虑的是正则表达式字面量，还有一种方式是`new RegExp('','g')`。
正则表达式标识：`g`全局(匹配多次，不同的方法对`g`标识的处理防范各不相同)，`i`忽略大小写。`m`多行
**元素**
**正则表达式分支**
`|`表示或，也表示分支 比如：
```js
'info'.match(/in|int/)  // 匹配成功，["in", index: 0, input: "info"]
```
**正则表达式序列**
一个正则表达式序列饱和一个或多个正则表达式因子。每一个因子能选择是否跟随一个量词，这个量词决定着这个因子被允许出现的次数，若没指定，这个因子则只匹配一次。
**正则表达式因子**
```js
\ / [ ] () { } ? + * | . ^ $
```
**正则表达式转义**
`\` 表转义 `\f` 分页 `\n` 换行 `\r`回车 `\t` 制表
`\u` 允许制定一个 Unicode 字符来表示一个十六进制的常量。
`\d` 等同于[0-9] \D 取反等同于 `[^0-9]`
`\s` `Unicode` 空白符一个不完全子集。 \S 与\s相反
`\w` `[0-9A-Z_a-z]` \W 与其相反 `[^0-9A-Z_a-z]`
`\b` 表示 字边界
`\1` 表示 分组1所捕获的文本的一个引用，所以它能被再次匹配。
`\2` 表示 指向分组2的引用，`\3` 是表示分组3的引用，以此类推。
**正则表达式分组**
捕获型 ()
非捕获型`?:`
向前正向匹配`?=`
有一个`(?=`前缀。它类似于非捕获类型分组，但在这个组匹配后，文本会倒回到它它开始的地方，实际上并不匹配任何东西。也可以理解为匹配位置。
向后负向匹配
有一个`(?!`前缀。它类似于向前正向匹配分组，但只有当它匹配失败时它才继续向前进行匹配。这不是一个好的特性。
**正则表达式字符集**
正则表达式字符集是一种指定一组字符的便利方式。例如，要匹配一个元音字母，`(?:a|e|i|o|u)`,可以方便的写成`[aeiou]`。
类提供另外两个便利：①指定字符范围
所以，一组由`32`个`ASCII`的特殊组合，可以写成`[!-\/:-@\[-`{-~]`
②类的取反
取反
```js
[^!-\/:-@\[-`{-~]
```
**正则表达式字符转义**
字符类内部的转义规则和正则表达式因子的相比稍有不同。下面是在字符类中需要被转义的特殊字符。
```js
- / [ \ ]
```
**正则表达式量词**
量词后缀决定正则表达式因子应该被匹配的次数。
`{3}`三次
`{3,6}` 3、4、5、6次
`{3,}`3次或更多次
`?`等同于`{0,1}`，`*`等同于`{0,}`，`+`等同于`{1,}`。

## 第8章 方法

### Array

**array.concat(item...)**
`concat` 方法产生一个新数组，它包含一份`array`的浅复制并把一个或多个参数`item`附加在其后。如果`item`是数组，那么每个元素分别被添加。后面有和它功能类似的`array.push(item...)`方法。
```js
var a = ['a','b','c'];
var b = ['x','y','z'];
var c = a.concat(b, true);
// c => ['a','b','c','x','y','z',true]
```
**扩展：** `ES6` 有更便捷的扩展运算符`...`
```js
var a = ['a','b','c'];
var b = ['x','y','z'];
var c = [...a,true,...b];   // ["a", "b", "c", true, "x", "y", "z"]
```
**array.join(separator)**
`join`方法把一个`array`构造成一个字符串。
`separator` 默认值就是逗号`','`。
如果你想把大量的字符串片段组装成一个字符串，把这些片段放在一个数组中，并用`join`方法连接起来通常比用`+`元素运算符连接起来要快。
>译注：对于`IE6/7`，使用join连接大量字符串效率确实优于加号运算符。但目前主流浏览器，包括`IE8`以后的版本，都对`+`元素运算符连接字符串做了优化，性能已经显著高于`Array.join()`。所以目前大多数情况下，建议首选使用+ 连接字符串。更多参看《高性能网站建设进阶指南》中字符串优化相关章节。

**array.pop()**
`pop`方法移除`array`中的最后一个元素，并返回这个元素。如果`array`为空，则返回`undefined`。
```js
var a = ['a','b','c'];
var c = a.pop(); // a 是 ['a','b']  c是 'c'
// pop 可以像这样实现。
// 这里的 Array.method()在第一章例子中已经定义了，并且贯穿全书。其实就是相当于Array.prototype
Array.method('pop', function () {
    return this.splice(this.length-1,1)[0];
});
```
**array.push(item...)**
与`concat`不同的是，它会修改array，如果参数`item`是数组，它会把参数数组作为单个元素整个添加到数组中。并返回这个`array`的新长度值。
```js
var a = [1,2,3];
var b = [4,5,6];
var c = a.push(b,true);
// a 是 [1,2,3,[4,5,6],true]
// c 是 5
```
`push`可以像这样实现：
```js
Array.method('push', function () {
  this.splice.apply(
  this,
  [this.length,0].
  concat(Array.prototype.slice.apply(arguments)));
  return this.length;
});
```
**array.reverse()**
`reverse`反转`array`元素顺序，并返回`array`本身。
```js
var a = [1,2,3];
var b = a.reverse();
// a 和 b都是 [3,2,1]
```
**array.shift()**
`shift`移除`array`的第一个元素并返回这个元素。如果`array`为空，则返回`undefined`。`shift`通常比`pop`慢的多。
```js
var a = [1,2,3];
var c = a.shift(); // a 是[2,3] , c 是1
```
`shift`可以这样实现：
```js
Array.method('shift', function(){
    return this.splice(0,1)[0];
});
```
**array.slice(start[, end])**
`slice`是对`array`中的一段做浅复制。`end`是可选的。默认是`array.length`,如果两个参数任何一个是负数，`array.length`会和相加。如果`start`大于`array.length`,获得一个`[]`,字符串也有`Sting.slice`这个同名方法。

**array.sort**
默认不能给一组数字排序。默认把要被排序的元素都视为字符串。
幸运的是，可以使用自己的比较函数替换默认的比较函数。
比较函数应该接受两个参数，并且如果这两个参数相等则返回0，如果第1个参数应该排列在前面，则返回一个负数，如果第二个参数应该排列在前面，则返回一个正数。
`sort`方法是不稳定的。`JavaScript`的`sort`方法的稳定性根据不同浏览器的实现而不一致。
可参见[MDN sort](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)

**array.splice(start, deleteCount,item...)**
`splice`方法从array中移除一个或多个元素，并用新的`item`替换它们。
```js
// splice 可以像这样实现
Array.method('splice',function (start, deleteCount) {
    var max = Math.max,
        min = Math.min,
        delta,
        element,
        insertCount = max(arguments.length - 2, 0),
        k = 0,
        len = this.length,
        new_len,
        result = [],
        shift_count;
    start = start || 0;
    if (start < 0) {
        start += len;
    }
    start = max(min(start, len), 0);
    deleteCount = max(min(typeof deleteCount === 'number' ? deleteCount : len, len - start), 0);
    delta = insertCount - deleteCount;
    new_len = len + delta;
    while (k < deleteCount) {
        element = this[start + k];
        if (element !== undefined) {
            result[k] = element;
        }
        k += 1;
    }
    shift_count = len - start - deleteCount;
    if (delta < 0) {
        k = start + insertCount;
        while (shift_count) {
            this[k] = this[k - delta];
            k += 1;
            shift_count -= 1;
        }
        this.length = new_len;
    } else if (delta > 0) {
        k = 1;
        while (shift_count) {
            this[new_len - k] = this[len - k];
            k += 1;
            shift_count -= 1;
        }
        this.length = new_len;
    }
    for (k = 0; k < insertCount; k += 1) {
        this[start + k] = arguments[k + 2];
    }
    return result;
});
```
**array.unshift(item...)**
`unshift` 方法像`push`方法一样，不过是用于把元素添加到数组的开始部分，返回新`array`的`length`。
```js
// unshift 可以像这样实现
Array.method('unshift', function(){
    this.splice.apply(this,
    [0,0].concat(Array.prototype.slice.apply(arguments)));
    return this.length;
});
```

### Function

**function.apply(thisArg,argArray)**
`apply`方法调用`function`,传递一个会被绑定到`this`上的对象和一个可选的数组作为参数。

### Number

**number.toExponential(fractionDigits)**
`toExponential`方法 把这个`number`转换成一个指数形式的字符串。可选参数控制其小数点后的数字位数。它的值必须在`0~20`。

**number.toFixed(fractionDigits)**
`toFixed`方法把这个number转换成一个十进制数形式的字符串。可选参数控制其小数点后的数字位数。它的值必须在0~20。

**number.toPrecision(precision)**
`toPrecision`方法把这个`number`转换成一个十进制数形式的字符串。可选参数控制数字的精度。它的值必须在`0~21`。

**number.toString(radix)**
把`number`转换成字符串。可选参数控制基数。它的值必须是`2~36`。默认的`radix`是以`10`为基数的。`radix`参数最常用的是整数，但是它可以用任意的数字。

### Object

**object.hasOwnProperty(name)**
如果这个`object`包含名为`name`的属性，那么返回`true`。原型链中的同名方法不会被检测。这个方法对`name`就是`“hasOwnProperty”`时不起作用。

### RegExp

**regexp.exec(string)**
`exec`是正则中最强大(和最慢）的方法。
如果成功匹配，它会返回一个数组。下标为0 的元素包含正则匹配的子字符串。下标为1的则是分组1捕获的文本。下标为2的则是分组2捕获的文本。以此类推。如果匹配失败则返回`null`。
**regexp.test(string)**
`test`是最简单(和最快)的方法。匹配成功，返回`true`,否则返回`false`。不要对这个方法使用`g`标识。
比如：
```js
var reg = /\w+/g;
reg.test('ab'); // true
// 再执行一遍就是false了。
reg.test('ab'); // false
// 再执行一遍就是true了。
reg.test('ab'); // true
// 再执行一遍又是false了，如此反复，所以用g标识后，看起来很诡异。因为每次匹配开始位置变了。
reg.test('ab'); // false
```
`test`可以像这样实现：
```js
RegExp.method('test', function(string){
    return this.exec(string) !== null;
});
```

### String

**string.charAt(pos)**
返回在`string`中的`pos`位置处的字符。

**string.charCodeAt(pos)**
与`charAt`一样，不过返回整数形式表示字符码位。

**string.concat(string)**
很少用，用`+`号运算符更方便。

**string.indexOf(searchString,position)**
在`string`中查找第一个参数，如果被找到返回该字符的位置，否则返回`-1`。`position`可设置指定位置开始查找。

**string.lastIndexOf(searchString,position)**
`lastIndexOf` 方法和`indexOf`方法类似，不过它是从末尾开始查找，不是从头开始。

**string.localeCompare(that)**
比较两个字符串。类似于`array.sort`。

**string.match(regexp)**
如果没有`g`标识，那么调用`string.match(regexp)`和调用`regexp.exec(string)`结果相同。如果带有`g`标识，那么它生成一个包含所有匹配（除捕获分组之外）的数组。

**string.replace(searchValue,replaceValue)**
对`string`进行查找和替换操作，并返回一个新的字符串。参数`searchvalue`可以是一个字符串也可以是一个正则表达式对象。参数`replaceValue`可以是一个字符串或一个函数。

**string.search(regexp)**
和`indexOf`类似，不过它接收正则为参数。

**string.slice(start, end)**
`slice`方法复制`string`的一部分来构造一个新的字符串。如果`start`参数是负数，它将与`string.length`相加。`end`参数是可选的。

**string.split(separator,limit)**
把`string`分割成片段来创建一个字符串数组。可选参数`limit`可以限制分割的片段数量。`separator`参数可以是字符串或者正则。

**string.substring(start,end)**
与`slice`方法一样，不过它不能处理负数参数。

**string.toLocaleLowerCase()**
它使用本地化的规则把这个`string`中的字母转换成小写格式。这个方法主要用在土耳其语上。

**string.toLocaleUpperCase()**
它使用本地化的规则把这个`string`中的字母转换成大写格式。这个方法主要用在土耳其语上。

**string.toLowerCase()**
返回新字符串，所有字母转成小写格式。

**string.toUpperCase()**
返回新字符串，所有字母转成大写格式。

**String.fromCharCode(char...)**
根据一串数字编码返回一个字符串。
```js
var a = String.fromCharCode(67,97,116) // a是'Cat'
```

## 第9章 代码风格

这一章中，简短的说了一些代码风格。事实证明代码风格在编程中是很重要的。

## 第10章 优美的特性

精简的`JavaScript`里都是好东西。
包括：1、函数是顶级对象；2、基于原型继承的动态作用域；3、对象字面量和数组字面量。

到此，读书笔记已完结。文章有什么不妥之处，欢迎指出~

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
