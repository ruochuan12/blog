# JavaScript 对象所有API解析

>`写于 2017年08月20日`

>之前看到[【深度长文】JavaScript数组所有API全解密](http://louiszhai.github.io/2017/04/28/array/)和[JavaScript字符串所有API全解密](http://louiszhai.github.io/2016/01/12/js.String/)这两篇高质量的文章。发现没写对象API解析（估计是博主觉得简单，就没写）。刚好我看到《JavaScript面向对象编程指南（第2版）》，觉得有必要写（或者说chao）一下，也好熟悉下对象的所有API用法。

创建对象的两种方式：
```
var o = new Object();
var o = {}; // 推荐
```
该构造器可以接受任何类型的参数，并且会自动识别参数的类型，并选择更合适的构造器来完成相关操作。比如：
```
var o = new Object('something');
o.constructor; // ƒ String() { [native code] }
var n = new Object(123);
n.constructor; // ƒ Number() { [native code] }
```

## 一、Object构造器的成员

### Object.prototype

该属性是所有对象的原型（包括 `Object`对象本身），语言中的其他对象正是通过对该属性上添加东西来实现它们之间的继承关系的。所以要小心使用。
比如：
```
var s = new String('xuanyuan');
Object.prototype.custom = 1;
console.log(s.custom); // 1
```

## 二、Object.prototype 的成员

### Object.prototype.constructor

该属性指向用来构造该函数对象的构造器，在这里为`Object()`
```
Object.prototype.constructor === Object; // true
var o = new Object();
o.constructor === Object; // true
```

### Object.prototype.toString(radix)

该方法返回的是一个用于描述目标对象的字符串。特别地，当目标是一个Number对象时，可以传递一个用于进制数的参数`radix`，该参数`radix`，该参数的默认值为10。
```
var o = {prop:1};
o.toString(); // '[object Object]'
var n = new Number(255);
n.toString(); // '255'
n.toString(16); // 'ff'
```

### Object.prototype.toLocaleString()

该方法的作用与`toString()`基本相同，只不过它做一些本地化处理。该方法会根据当前对象的不同而被重写，例如`Date()`,`Number()`,`Array()`,它们的值都会以本地化的形式输出。当然，对于包括`Object()`在内的其他大多数对象来说，该方法与`toString()`是基本相同的。
在浏览器环境下，可以通过`BOM`对象`Navigator`的`language`属性（在`IE`中则是`userLanguage`）来了解当前所使用的语言：
```
navigator.language; //'en-US'
```

### Object.prototype.valueOf()

该方法返回的是用基本类型所表示的`this`值，如果它可以用基本类型表示的话。如果`Number`对象返回的是它的基本数值，而`Date`对象返回的是一个时间戳（`timestamp`）。如果无法用基本数据类型表示，该方法会返回`this`本身。
```
// Object
var o = {};
typeof o.valueOf(); // 'object'
o.valueOf() === o; // true
// Number
var n = new Number(101);
typeof n; // 'object'
typeof n.vauleOf; // 'function'
typeof n.valueOf(); // 'number'
n.valueOf() === n; // false
// Date
var d = new Date();
typeof d.valueOf(); // 'number'
d.valueOf(); // 1503146772355
```

### Object.prototype.hasOwnProperty(prop)

该方法仅在目标属性为对象自身属性时返回`true`,而当该属性是从原型链中继承而来或根本不存在时，返回`false`。
```
var o = {prop:1};
o.hasOwnProperty('prop'); // true
o.hasOwnProperty('toString'); // false
o.hasOwnProperty('formString'); // false
```

### Object.prototype.isPrototypeOf(obj)

如果目标对象是当前对象的原型，该方法就会返回`true`，而且，当前对象所在原型上的所有对象都能通过该测试，并不局限与它的直系关系。
```
var s = new String('');
Object.prototype.isPrototypeOf(s); // true
String.prototype.isPrototypeOf(s); // true
Array.prototype.isPrototypeOf(s); // false
```

### Object.prototype.propertyIsEnumerable(prop)

如果目标属性能在`for in`循环中被显示出来，该方法就返回`true`
```
var a = [1,2,3];
a.propertyIsEnumerable('length'); // false
a.propertyIsEnumerable(0); // true
```

## 三、在`ES5`中附加的`Object`属性

在`ES3`中，除了一些内置属性（如：`Math.PI`），对象的所有的属性在任何时候都可以被修改、插入、删除。在`ES5`中，我们可以设置属性是否可以被改变或是被删除——在这之前，它是内置属性的特权。`ES5`中引入了**属性描述符**的概念，我们可以通过它对所定义的属性有更大的控制权。这些**属性描述符**（特性）包括：
>`value`——当试图获取属性时所返回的值。
>`writable`——该属性是否可写。
>`enumerable`——该属性在`for in`循环中是否会被枚举
>`configurable`——该属性是否可被删除。
>`set()`——该属性的更新操作所调用的函数。
>`get()`——获取属性值时所调用的函数。
另外，**数据描述符**（其中属性为：`enumerable`，`configurable`，`value`，`writable`）与**存取描述符**（其中属性为`enumerable`，`configurable`，`set()`，`get()`）之间是有互斥关系的。在定义了`set()`和`get()`之后，描述符会认为存取操作已被 定义了，其中再定义`value`和`writable`会**引起错误**。
以下是*ES3*风格的属性定义方式：
```
var person = {};
person.legs = 2;
```
以下是等价的ES5通过**数据描述符**定义属性的方式：
```
var person = {};
Object.defineProperty(person, 'legs', {
    value: 2,
    writable: true,
    configurable: true,
    enumerable: true
});
```
其中， 除了value的默认值为`undefined`以外，其他的默认值都为`false`。这就意味着，如果想要通过这一方式定义一个可写的属性，必须显示将它们设为`true`。
或者，我们也可以通过`ES5`的存储描述符来定义：
```
var person = {};
Object.defineProperty(person, 'legs', {
    set:function(v) {
        return this.value = v;
    },
    get: function(v) {
        return this.value;
    },
    configurable: true,
    enumerable: true
});
person.legs = 2;
```
这样一来，多了许多可以用来描述属性的代码，如果想要防止别人篡改我们的属性，就必须要用到它们。此外，也不要忘了浏览器向后兼容`ES3`方面所做的考虑。例如，跟添加`Array.prototype`属性不一样，我们不能再旧版的浏览器中使用`shim`这一特性。
另外，我们还可以（通过定义`nonmalleable`属性），在具体行为中运用这些描述符：
```
var person = {};
Object.defineProperty(person, 'heads', {value: 1});
person.heads = 0; // 0
person.heads; // 1  (改不了)
delete person.heads; // false
person.heads // 1 (删不掉)
```

### Object.defineProperty(obj, prop, descriptor) (ES5)

具体用法可参见上文，或者查看MDN。
[MDN Object.defineProperty(obj, descriptor)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
>Vue.js文档：[**如何追踪变化**](https://cn.vuejs.org/v2/guide/reactivity.html) 把一个普通 JavaScript 对象传给 Vue 实例的 data 选项，Vue 将遍历此对象所有的属性，并使用 Object.defineProperty 把这些属性全部转为 getter/setter。Object.defineProperty 是仅 ES5 支持，且无法 shim 的特性，这也就是为什么 Vue 不支持 IE8 以及更低版本浏览器的原因。

### Object.defineProperties(obj, props) (ES5)

该方法的作用与`defineProperty()`基本相同，只不过它可以用来一次定义多个属性。
比如：
```
var glass = Object.defineProperties({}, {
    'color': {
        value: 'transparent',
        writable: true
    },
    'fullness': {
        value: 'half',
        writable: false
    }
});
glass.fullness; // 'half'
```

### Object.getPrototypeOf(obj) (ES5)

之前在`ES3`中，我们往往需要通过`Object.prototype.isPrototypeOf()`去猜测某个给定的对象的原型是什么，如今在`ES5`中，我们可以直接询问改对象“你的原型是什么？”
```
Object.getPrototypeOf([]) === Array.prototype; // true
Object.getPrototypeOf(Array.prototype) === Object.prototype; // true
Object.getPrototypeOf(Object.prototype) === null; // true
```

### Object.create(obj, descr) (ES5)

该方法主要用于创建一个新对象，并为其设置原型，用（上述）属性描述符来定义对象的原型属性。
```
var parent = {hi: 'Hello'};
var o = Object.create(parent, {
    prop: {
        value: 1
    }
});
o.hi; // 'Hello'
// 获得它的原型
Object.getPrototypeOf(parent) === Object.prototype; // true 说明parent的原型是Object.prototype
Object.getPrototypeOf(o); // {hi: "Hello"} // 说明o的原型是{hi: "Hello"}
o.hasOwnProperty('hi'); // false 说明hi是原型上的
o.hasOwnProperty('prop'); // true 说明prop是原型上的自身上的属性。
```
现在，我们甚至可以用它来创建一个完全空白的对象，这样的事情在`ES3`中可是做不到的。
```
var o = Object.create(null);
typeof o.toString(); // 'undefined'
```

### Object.getOwnPropertyDesciptor(obj, property) (ES5)

该方法可以让我们详细查看一个属性的定义。甚至可以通过它一窥那些内置的，之前不可见的隐藏属性。
```
Object.getOwnPropertyDescriptor(Object.prototype, 'toString');
// {writable: true, enumerable: false, configurable: true, value: ƒ toString()}
```

### Object.getOwnPropertyNames(obj) (ES5)

该方法返回一个数组，其中包含了当前对象所有属性的名称（字符串），不论它们是否可枚举。当然，也可以用`Object.keys()`来单独返回可枚举的属性。
```
Object.getOwnPropertyNames(Object.prototype);
// ["__defineGetter__", "__defineSetter__", "hasOwnProperty", "__lookupGetter__", "__lookupSetter__", "propertyIsEnumerable", "toString", "valueOf", "__proto__", "constructor", "toLocaleString", "isPrototypeOf"]
Object.keys(Object.prototype);
// []
Object.getOwnPropertyNames(Object);
// ["length", "name", "arguments", "caller", "prototype", "assign", "getOwnPropertyDescriptor", "getOwnPropertyDescriptors", "getOwnPropertyNames", "getOwnPropertySymbols", "is", "preventExtensions", "seal", "create", "defineProperties", "defineProperty", "freeze", "getPrototypeOf", "setPrototypeOf", "isExtensible", "isFrozen", "isSealed", "keys", "entries", "values"]
Object.keys(Object);
// []
```

### Object.preventExtensions(obj) (ES5)

### Object.isExtensible(obj) (ES5)

`preventExtensions()`方法用于禁止向某一对象添加更多属性，而`isExtensible()`方法则用于检查某对象是否还可以被添加属性。
```
var deadline = {};
Object.isExtensible(deadline); // true
deadline.date = 'yesterday'; // 'yesterday'
Object.preventExtensions(deadline);
Object.isExtensible(deadline); // false
deadline.date = 'today';
deadline.date; // 'today'
// 尽管向某个不可扩展的对象中添加属性不算是一个错误操作，但它没有任何作用。
deadline.report = true;
deadline.report; // undefined
```

### Object.seal(obj) (ES5)

### Object.isSeal(obj) (ES5)

`seal()`方法可以让一个对象密封，并返回被密封后的对象。
`seal()`方法的作用与`preventExtensions()`基本相同，但除此之外，它还会将现有属性
设置成不可配置。也就是说，在这种情况下，我们只能变更现有属性的值，但不能删除或（用`defineProperty()`）重新配置这些属性，例如不能将一个可枚举的属性改成不可枚举。
```
var person = {legs:2};
// person === Object.seal(person); // true
Object.isSealed(person); // true
Object.getOwnPropertyDescriptor(person, 'legs');
// {value: 2, writable: true, enumerable: true, configurable: false}
delete person.legs; // false (不可删除，不可配置)
Object.defineProperty(person, 'legs',{value:2});
person.legs; // 2
person.legs = 1;
person.legs; // 1 (可写)
Object.defineProperty(person, "legs", { get: function() { return "legs"; } });
// 抛出TypeError异常
```

### Object.freeze(obj) (ES5)

### Object.isFrozen(obj) (ES5)

`freeze()`方法用于执行一切不受`seal()`方法限制的属性值变更。`Object.freeze()` 方法可以冻结一个对象，冻结指的是不能向这个对象添加新的属性，不能修改其已有属性的值，不能删除已有属性，以及不能修改该对象已有属性的可枚举性、可配置性、可写性。也就是说，这个对象永远是不可变的。该方法返回被冻结的对象。
```
var deadline = Object.freeze({date: 'yesterday'});
deadline.date = 'tomorrow';
deadline.excuse = 'lame';
deadline.date; // 'yesterday'
deadline.excuse; // undefined
Object.isSealed(deadline); // true;
Object.isFrozen(deadline); // true
Object.getOwnPropertyDescriptor(deadline, 'date');
// {value: "yesterday", writable: false, enumerable: true, configurable: false} (不可配置，不可写)
Object.keys(deadline); // ['date'] (可枚举)
```

### Object.keys(obj) (ES5)

该方法是一种特殊的`for-in`循环。它只返回当前对象的属性（不像`for-in`），而且这些属性也必须是可枚举的（这点和`Object.getOwnPropertyNames()`不同，不论是否可以枚举）。返回值是一个字符串数组。
```
Object.prototype.customProto = 101;
Object.getOwnPropertyNames(Object.prototype);
// [..., "constructor", "toLocaleString", "isPrototypeOf", "customProto"]
Object.keys(Object.prototype); // ['customProto']
var o = {own: 202};
o.customProto; // 101
Object.keys(o); // ['own']
```

### 四、在`ES6`中附加的`Object`属性

### Object.is(value1, value2) (ES6)

该方法用来比较两个值是否严格相等。它与严格比较运算符（===）的行为基本一致。
不同之处只有两个：一是`+0`不等于`-0`，而是`NaN`等于自身。
```
Object.is('xuanyuan', 'xuanyuan'); // true
Object.is({},{}); // false
Object.is(+0, -0); // false
+0 === -0; // true
Object.is(NaN, NaN); // true
NaN === NaN; // false
```
`ES5`可以通过以下代码部署`Object.is`
```
Object.defineProperty(Object, 'is', {
    value: function() {x, y} {
        if (x === y) {
           // 针对+0不等于-0的情况
           return x !== 0 || 1 / x === 1 / y;
        }
        // 针对 NaN的情况
        return x !== x && y !== y;
    },
    configurable: true,
    enumerable: false,
    writable: true
});
```

### Object.assign(target, ...sources) (ES6)

该方法用来源对象（`source`）的所有可枚举的属性复制到目标对象（`target`）。它至少需要两个对象作为参数，第一个参数是目标对象`target`，后面的参数都是源对象（`source`）。只有一个参数不是对象，就会抛出`TypeError`错误。
```
var target = {a: 1};
var source1 = {b: 2};
var source2 = {c: 3};
obj = Object.assign(target, source1, source2);
target; // {a:1,b:2,c:3}
obj; // {a:1,b:2,c:3}
target === obj; // true
// 如果目标对象与源对象有同名属性，或多个源对象有同名属性，则后面的属性会覆盖前面的属性。
var source3 = {a:2,b:3,c:4};
Object.assign(target, source3);
target; // {a:2,b:3,c:4}
```
`Object.assign`只复制自身属性，不可枚举的属性（`enumerable`为`false`）和继承的属性不会被复制。
```
Object.assign({b: 'c'},
    Object.defineProperty({}, 'invisible', {
        enumerable: false,
        value: 'hello'
    })
);
// {b: 'c'}
```
属性名为`Symbol`值的属性，也会被`Object.assign()`复制。
```
Object.assign({a: 'b'}, {[Symbol('c')]: 'd'});
// {a: 'b', Symbol(c): 'd'}
```
对于嵌套的对象，`Object.assign()`的处理方法是替换，而不是添加。
```
Object.assign({a: {b:'c',d:'e'}}, {a:{b:'hello'}});
// {a: {b:'hello'}}
```
对于数组，`Object.assign()`把数组视为属性名为0、1、2的对象。
```
Object.assign([1,2,3], [4,5]);
// [4,5,3]
```

### Object.getOwnPropertySymbols(obj) (ES6)

该方法会返回一个数组，该数组包含了指定对象自身的（非继承的）所有 `symbol` 属性键。
该方法和 `Object.getOwnPropertyNames()` 类似，但后者返回的结果只会包含字符串类型的属性键，也就是传统的属性名。
```
Object.getOwnPropertySymbols({a: 'b', [Symbol('c')]: 'd'});
// [Symbol(c)]
```

### Object.setPrototypeOf(obj, prototype) (ES6)

该方法设置一个指定的对象的原型 ( 即, 内部`[[Prototype]]`属性）到另一个对象或  `null`。
`__proto__`属性用来读取或设置当前对象的`prototype`对象。目前，所有浏览器（包括`IE11`）都部署了这个属性。
```
// ES6写法
var obj = {
    method: function(){
        // code ...
    }
};
// obj.__proto__ = someOtherObj;
// ES5写法
var obj = Object.create(someOtherObj);
obj.method = function(){
    // code ...
};
```
该属性没有写入`ES6`的正文，而是写入了附录。`__proto__`前后的双下划线说明它本质上是一个内部属性，而不是正式对外的一个API。无论从语义的角度，还是从兼容性的角度，都不要使用这个属性。而是使用`Object.setPrototypeOf()`（写操作），`Object.getPrototypeOf()`（读操作），或`Object.create()`（生成操作）代替。
在实现上，`__proto__`调用的`Object.prototype.__proto__`。
`Object.setPrototypeOf()`方法的作用与`__proto__`作用相同，用于设置一个对象的`prototype`对象。它是`ES6`正式推荐的设置原型对象的方法。

## 五、在`ES8`中附加的`Object`属性

### Object.getOwnPropertyDescriptors(obj) (ES8)

该方法基本与`Object.getOwnPropertyDescriptor(obj, property)`用法一致，只不过它可以用来获取一个对象的所有自身属性的描述符。
```
Object.getOwnPropertyDescriptor(Object.prototype, 'toString');
// {writable: true, enumerable: false, configurable: true, value: ƒ toString()}
Object.getOwnPropertyDescriptors(Object.prototype); // 可以自行在浏览器控制台查看效果。
```

### Object.values(obj) (ES8)

`Object.values()` 方法与`Object.keys`类似。返回一个给定对象自己的所有可枚举属性值的数组，值的顺序与使用`for...in`循环的顺序相同 ( 区别在于`for-in`循环枚举原型链中的属性 )。
```
var obj = {a:1,b:2,c:3};
Object.keys(obj); // ['a','b','c']
Object.values(obj); // [1,2,3]
```

### Object.entries(obj) (ES8)

`Object.entries()` 方法返回一个给定对象自己的可枚举属性`[key，value]`对的数组，数组中键值对的排列顺序和使用 `for...in` 循环遍历该对象时返回的顺序一致（区别在于一个`for-in`循环也枚举原型链中的属性）。
```
var obj = {a:1,b:2,c:3};
Object.keys(obj); // ['a','b','c']
Object.values(obj); // [1,2,3]
Object.entries(obj); // [['a',1],['b',2],['c',3]]
```
## 小结

您可能会发现MDN上还有一些API，本文没有列举到。因为那些是非标准的API。熟悉对象的API对理解原型和原型链相关知识会有一定帮助。常用的API主要有`Object.prototype.toString()`，`Object.prototype.hasOwnProperty()`， `Object.getPrototypeOf(obj)`，`Object.create()`，`Object.defineProperty`，`Object.keys(obj)`，`Object.assign()`。

## 参考资料

[MDN Object API](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object)
[JavaScript面向对象编程指南（第2版）（豆瓣读书链接）](https://book.douban.com/subject/26302623/)
[阮一峰 ES6标准入门2](http://es6.ruanyifeng.com/)

## 关于

作者：常以**若川**为名混迹于江湖。前端路上 | PPT爱好者 | 所知甚少，唯善学。<br>
[个人博客](https://lxchuan12.github.io/)<br>
[掘金专栏](https://juejin.im/user/57974dc55bbb500063f522fd/posts)，欢迎关注~<br>
[`segmentfault`前端视野专栏](https://segmentfault.com/blog/lxchuan12)，开通了**前端视野**专栏，欢迎关注~<br>
[知乎前端视野专栏](https://zhuanlan.zhihu.com/lxchuan12)，开通了**前端视野**专栏，欢迎关注~<br>
[github blog](https://github.com/lxchuan12/blog)，相关源码和资源都放在这里，求个`star`^_^~

## 微信公众号  若川视野

可能比较有趣的微信公众号，长按扫码关注。也可以加微信 `lxchuan12`，注明来源，拉您进【前端视野交流群】。

![若川视野](../about/wechat-official-accounts-mini.jpg)
