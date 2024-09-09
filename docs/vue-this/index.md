# 为什么 Vue2 this 能够直接获取到 data 和 methods

## 1. 前言

>大家好，我是[若川](https://ruochuan12.github.io)。欢迎关注我的[公众号若川视野](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/12/13/16efe57ddc7c9eb3~tplv-t2oaga2asx-image.image "https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/12/13/16efe57ddc7c9eb3~tplv-t2oaga2asx-image.image")，最近组织了[**源码共读活动**](https://juejin.cn/pin/7005372623400435725)，感兴趣的可以加我微信 [ruochuan12](https://juejin.cn/pin/7005372623400435725) 参与，大家一起交流学习，共同进步。

之前写的[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093) 包含`jQuery`、`underscore`、`lodash`、`vuex`、`sentry`、`axios`、`redux`、`koa`、`vue-devtools`、`vuex4`十余篇源码文章。其中最新的三篇是：

[50行代码串行Promise，koa洋葱模型原来是这么实现？](https://juejin.cn/post/7005375860509245471)

[Vue 3.2 发布了，那尤雨溪是怎么发布 Vue.js 的？](https://juejin.cn/post/6997943192851054606)

[初学者也能看懂的 Vue3 源码中那些实用的基础工具函数](https://juejin.cn/post/6994976281053888519)

>写相对很难的源码，耗费了自己的时间和精力，也没收获多少阅读点赞，其实是一件挺受打击的事情。从阅读量和读者受益方面来看，不能促进作者持续输出文章。
>所以转变思路，写一些相对通俗易懂的文章。**其实源码也不是想象的那么难，至少有很多看得懂**。歌德曾说：读一本好书，就是在和高尚的人谈话。
>同理可得：读源码，也算是和作者的一种学习交流的方式。

本文源于一次[源码共读](https://juejin.cn/pin/7005372623400435725)群里群友的提问，请问@若川，“**为什么 data 中的数据可以用 this 直接获取到啊**”，当时我翻阅源码做出了解答。想着如果下次有人再次问到，我还需要回答一次。当时打算有空写篇文章告诉读者自己探究原理，于是就有了这篇文章。

阅读本文，你将学到：

```js
1. 如何学习调试 vue2 源码
2. data 中的数据为什么可以用 this 直接获取到
3. methods 中的方法为什么可以用 this 直接获取到
4. 学习源码中优秀代码和思想，投入到自己的项目中
```

本文不难，用过 `Vue` 的都看得懂，希望大家动手调试和学会看源码。

看源码可以大胆猜测，最后小心求证。

## 2. 示例：this 能够直接获取到 data 和 methods

众所周知，这样是可以输出`我是若川`的。好奇的人就会思考为啥 `this` 就能直接访问到呢。

```js
const vm = new Vue({
    data: {
        name: '我是若川',
    },
    methods: {
        sayName(){
            console.log(this.name);
        }
    },
});
console.log(vm.name); // 我是若川
console.log(vm.sayName()); // 我是若川
```

那么为什么 `this.xxx` 能获取到`data`里的数据，能获取到 `methods` 方法。

我们自己构造写的函数，如何做到类似`Vue`的效果呢。

```js
function Person(options){

}

const p = new Person({
    data: {
        name: '若川'
    },
    methods: {
        sayName(){
            console.log(this.name);
        }
    }
});

console.log(p.name);
// undefined
console.log(p.sayName());
// Uncaught TypeError: p.sayName is not a function
```

如果是你，你会怎么去实现呢。带着问题，我们来调试 `Vue2`源码学习。

## 3. 准备环境调试源码一探究竟

可以在本地新建一个文件夹`examples`，新建文件`index.html`文件。
在`<body></body>`中加上如下`js`。

```js
<script src="https://unpkg.com/vue@2.6.14/dist/vue.js"></script>
<script>
    const vm = new Vue({
        data: {
            name: '我是若川',
        },
        methods: {
            sayName(){
                console.log(this.name);
            }
        },
    });
    console.log(vm.name);
    console.log(vm.sayName());
</script>
```

再全局安装`npm i -g http-server`启动服务。

```js
npm i -g http-server
cd examples
http-server .
// 如果碰到端口被占用，也可以指定端口
http-server -p 8081 .
```

这样就能在`http://localhost:8080/`打开刚写的`index.html`页面了。

对于调试还不是很熟悉的读者，可以看这篇文章[《前端容易忽略的 debugger 调试技巧》](https://mp.weixin.qq.com/s/VOoDHqIo4gh3scHVNxk3lA)，截图标注的很详细。

>调试：在 `F12` 打开调试，`source` 面板，在例子中`const vm = new Vue({`打上断点。

![如下图所示](./images/debugger.png)

刷新页面后按`F11`进入函数，这时断点就走进了 Vue 构造函数。

### 3.1 Vue 构造函数

```js
function Vue (options) {
    if (!(this instanceof Vue)
    ) {
        warn('Vue is a constructor and should be called with the `new` keyword');
    }
    this._init(options);
}
// 初始化
initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
```

值得一提的是：`if (!(this instanceof Vue)){}` 判断是不是用了 `new` 关键词调用构造函数。
一般而言，我们平时应该不会考虑写这个。

当然看源码库也可以自己函数内部调用 `new` 。但 `vue` 一般一个项目只需要 `new Vue()` 一次，所以没必要。

而 `jQuery` 源码的就是内部 `new` ，对于使用者来说就是无`new`构造。

```js
jQuery = function( selector, context ) {
  // 返回new之后的对象
  return new jQuery.fn.init( selector, context );
};
```

因为使用 `jQuery` 经常要调用。
其实 `jQuery` 也是可以 `new` 的。和不用 `new` 是一个效果。

如果不明白 `new` 操作符的用处，可以看我之前的文章。[面试官问：能否模拟实现JS的new操作符](https://juejin.cn/post/6844903704663949325)

>调试：继续在`this._init(options);`处打上断点，按`F11`进入函数。

### 3.2 _init 初始化函数

进入 `_init` 函数后，这个函数比较长，做了挺多事情，我们猜测跟`data`和`methods`相关的实现在`initState(vm)`函数里。

```js
// 代码有删减
function initMixin (Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // a uid
      vm._uid = uid$3++;

      // a flag to avoid this being observed
      vm._isVue = true;
      // merge options
      if (options && options._isComponent) {
        // optimize internal component instantiation
        // since dynamic options merging is pretty slow, and none of the
        // internal component options needs special treatment.
        initInternalComponent(vm, options);
      } else {
        vm.$options = mergeOptions(
          resolveConstructorOptions(vm.constructor),
          options || {},
          vm
        );
      }

      // expose real self
      vm._self = vm;
      initLifecycle(vm);
      initEvents(vm);
      initRender(vm);
      callHook(vm, 'beforeCreate');
      initInjections(vm); // resolve injections before data/props
      //  初始化状态
      initState(vm);
      initProvide(vm); // resolve provide after data/props
      callHook(vm, 'created');
    };
}
```

>调试：接着我们在`initState(vm)`函数这里打算断点，按`F8`可以直接跳转到这个断点，然后按`F11`接着进入`initState`函数。

### 3.3 initState 初始化状态

从函数名来看，这个函数主要实现功能是：

```bash
初始化 props
初始化 methods
监测数据
初始化 computed
初始化 watch
```

```js
function initState (vm) {
    vm._watchers = [];
    var opts = vm.$options;
    if (opts.props) { initProps(vm, opts.props); }
    // 有传入 methods，初始化方法
    if (opts.methods) { initMethods(vm, opts.methods); }
    // 有传入 data，初始化 data
    if (opts.data) {
      initData(vm);
    } else {
      observe(vm._data = {}, true /* asRootData */);
    }
    if (opts.computed) { initComputed(vm, opts.computed); }
    if (opts.watch && opts.watch !== nativeWatch) {
      initWatch(vm, opts.watch);
    }
}
```

>我们重点来看初始化 `methods`，之后再看初始化 `data`。

>调试：在 `initMethods` 这句打上断点，同时在`initData(vm)`处打上断点，看完`initMethods`函数后，可以直接按`F8`回到`initData(vm)`函数。
>继续按`F11`，先进入`initMethods`函数。

### 3.4 initMethods 初始化方法

```js
function initMethods (vm, methods) {
    var props = vm.$options.props;
    for (var key in methods) {
      {
        if (typeof methods[key] !== 'function') {
          warn(
            "Method \"" + key + "\" has type \"" + (typeof methods[key]) + "\" in the component definition. " +
            "Did you reference the function correctly?",
            vm
          );
        }
        if (props && hasOwn(props, key)) {
          warn(
            ("Method \"" + key + "\" has already been defined as a prop."),
            vm
          );
        }
        if ((key in vm) && isReserved(key)) {
          warn(
            "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
            "Avoid defining component methods that start with _ or $."
          );
        }
      }
      vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
    }
}
```

`initMethods`函数，主要有一些判断。

```js
判断 methods 中的每一项是不是函数，如果不是警告。
判断 methods 中的每一项是不是和 props 冲突了，如果是，警告。
判断 methods 中的每一项是不是已经在 new Vue实例 vm 上存在，而且是方法名是保留的 _ $ （在JS中一般指内部变量标识）开头，如果是警告。
```

除去这些判断，我们可以看出`initMethods`函数其实就是遍历传入的`methods`对象，并且使用`bind`绑定函数的this指向为`vm`，也就是`new Vue`的实例对象。

**这就是为什么我们可以通过`this`直接访问到`methods`里面的函数的原因**。

我们可以把鼠标移上 `bind` 变量，按`alt`键，可以看到函数定义的地方，这里是`218行`，点击跳转到这里看 `bind` 的实现。

#### 3.4.1 bind 返回一个函数，修改 this 指向

```js
function polyfillBind (fn, ctx) {
    function boundFn (a) {
      var l = arguments.length;
      return l
        ? l > 1
          ? fn.apply(ctx, arguments)
          : fn.call(ctx, a)
        : fn.call(ctx)
    }

    boundFn._length = fn.length;
    return boundFn
}

function nativeBind (fn, ctx) {
  return fn.bind(ctx)
}

var bind = Function.prototype.bind
  ? nativeBind
  : polyfillBind;
```

简单来说就是兼容了老版本不支持 原生的bind函数。同时兼容写法，对参数多少做出了判断，使用`call`和`apply`实现，据说是因为性能问题。

如果对于`call、apply、bind`的用法和实现不熟悉，可以查看我在[面试官问系列](https://juejin.cn/column/6962099958979756062)中写的[面试官问：能否模拟实现JS的call和apply方法](https://juejin.cn/post/6844903728147857415)
[面试官问：能否模拟实现JS的bind方法](https://juejin.cn/post/6844903718089916429)

>调试：看完了`initMethods`函数，按`F8`回到上文提到的`initData(vm)`函数断点处。

### 3.5 initData 初始化 data

`initData` 函数也是一些判断。主要做了如下事情：

```bash
先给 _data 赋值，以备后用。
最终获取到的 data 不是对象给出警告。
遍历 data ，其中每一项：
如果和 methods 冲突了，报警告。
如果和 props 冲突了，报警告。
不是内部私有的保留属性，做一层代理，代理到 _data 上。
最后监测 data，使之成为响应式的数据。
```

```js
function initData (vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function'
      ? getData(data, vm)
      : data || {};
    if (!isPlainObject(data)) {
      data = {};
      warn(
        'data functions should return an object:\n' +
        'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      );
    }
    // proxy data on instance
    var keys = Object.keys(data);
    var props = vm.$options.props;
    var methods = vm.$options.methods;
    var i = keys.length;
    while (i--) {
      var key = keys[i];
      {
        if (methods && hasOwn(methods, key)) {
          warn(
            ("Method \"" + key + "\" has already been defined as a data property."),
            vm
          );
        }
      }
      if (props && hasOwn(props, key)) {
        warn(
          "The data property \"" + key + "\" is already declared as a prop. " +
          "Use prop default value instead.",
          vm
        );
      } else if (!isReserved(key)) {
        proxy(vm, "_data", key);
      }
    }
    // observe data
    observe(data, true /* asRootData */);
}
```

#### 3.5.1 getData 获取数据

是函数时调用函数，执行获取到对象。

```js
function getData (data, vm) {
    // #7573 disable dep collection when invoking data getters
    pushTarget();
    try {
      return data.call(vm, vm)
    } catch (e) {
      handleError(e, vm, "data()");
      return {}
    } finally {
      popTarget();
    }
}
```

#### 3.5.2 proxy 代理

其实就是用 `Object.defineProperty` 定义对象

这里用处是：`this.xxx` 则是访问的 `this._data.xxx`。

```js
/**
   * Perform no operation.
   * Stubbing args to make Flow happy without leaving useless transpiled code
   * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
   */
function noop (a, b, c) {}
var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
};

function proxy (target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter () {
      return this[sourceKey][key]
    };
    sharedPropertyDefinition.set = function proxySetter (val) {
      this[sourceKey][key] = val;
    };
    Object.defineProperty(target, key, sharedPropertyDefinition);
}
```

#### 3.5.3 Object.defineProperty 定义对象属性

`Object.defineProperty` 算是一个非常重要的API。还有一个定义多个属性的API：`Object.defineProperties(obj, props) (ES5)`

`Object.defineProperty` 涉及到比较重要的知识点，面试也常考。

```bash
value——当试图获取属性时所返回的值。
writable——该属性是否可写。
enumerable——该属性在for in循环中是否会被枚举。
configurable——该属性是否可被删除。
set()——该属性的更新操作所调用的函数。
get()——获取属性值时所调用的函数。
```

[详细举例见此链接](https://juejin.cn/post/6994976281053888519#heading-34)

### 3.6 文中出现的一些函数，最后统一解释下

#### 3.6.1 hasOwn 是否是对象本身拥有的属性

调试模式下，按`alt`键，把鼠标移到方法名上，可以看到函数定义的地方。点击可以跳转。

```js
/**
   * Check whether an object has the property.
   */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

hasOwn({ a: undefined }, 'a') // true
hasOwn({}, 'a') // false
hasOwn({}, 'hasOwnProperty') // false
hasOwn({}, 'toString') // false
// 是自己的本身拥有的属性，不是通过原型链向上查找的。
```

#### 3.6.2 isReserved 是否是内部私有保留的字符串$  和 _ 开头

```js
/**
   * Check if a string starts with $ or _
   */
function isReserved (str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}
isReserved('_data'); // true
isReserved('$options'); // true
isReserved('data'); // false
isReserved('options'); // false
```

## 4. 最后用60余行代码实现简化版

```js
function noop (a, b, c) {}
var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
};
function proxy (target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter () {
      return this[sourceKey][key]
    };
    sharedPropertyDefinition.set = function proxySetter (val) {
      this[sourceKey][key] = val;
    };
    Object.defineProperty(target, key, sharedPropertyDefinition);
}
function initData(vm){
  const data = vm._data = vm.$options.data;
  const keys = Object.keys(data);
  var i = keys.length;
  while (i--) {
    var key = keys[i];
    proxy(vm, '_data', key);
  }
}
function initMethods(vm, methods){
  for (var key in methods) {
    vm[key] = typeof methods[key] !== 'function' ? noop : methods[key].bind(vm);
  }
}

function Person(options){
  let vm = this;
  vm.$options = options;
  var opts = vm.$options;
  if(opts.data){
    initData(vm);
  }
  if(opts.methods){
    initMethods(vm, opts.methods)
  }
}

const p = new Person({
    data: {
        name: '若川'
    },
    methods: {
        sayName(){
            console.log(this.name);
        }
    }
});

console.log(p.name);
// 未实现前： undefined
// '若川'
console.log(p.sayName());
// 未实现前：Uncaught TypeError: p.sayName is not a function
// '若川'
```

## 5. 总结

本文涉及到的基础知识主要有如下：

```js
构造函数
this 指向
call、bind、apply
Object.defineProperty
等等基础知识。
```

本文源于解答源码共读群友的疑惑，通过详细的描述了如何调试 `Vue` 源码，来探寻答案。

解答文章开头提问：

通过`this`直接访问到`methods`里面的函数的原因是：因为`methods`里的方法通过 `bind` 指定了`this`为 new Vue的实例(`vm`)。

通过 `this` 直接访问到 `data` 里面的数据的原因是：data里的属性最终会存储到`new Vue`的实例（`vm`）上的 `_data`对象中，访问 `this.xxx`，是访问`Object.defineProperty`代理后的 `this._data.xxx`。

`Vue`的这种设计，好处在于便于获取。也有不方便的地方，就是`props`、`methods` 和 `data`三者容易产生冲突。

文章整体难度不大，但非常建议读者朋友们自己动手调试下。调试后，你可能会发现：原来 `Vue` 源码，也没有想象中的那么难，也能看懂一部分。

启发：我们工作使用常用的技术和框架或库时，保持好奇心，多思考内部原理。能够做到知其然，知其所以然。就能远超很多人。

你可能会思考，为什么模板语法中，可以省略`this`关键词写法呢，内部模板编译时其实是用了`with`。有余力的读者可以探究这一原理。

最后欢迎加我微信 [ruochuan12](https://juejin.cn/pin/7005372623400435725) 交流，参与 [源码共读](https://juejin.cn/pin/7005372623400435725) 活动，大家一起学习源码，共同进步。
