# vuex

## Vue.use

[文档 Vue.use](https://cn.vuejs.org/v2/api/#Vue-use)
Vue.use(Vuex)

>参数：
{Object | Function} plugin
>用法：<br/>
>安装 Vue.js 插件。如果插件是一个对象，必须提供 `install` 方法。如果插件是一个函数，它会被作为 install 方法。`install` 方法调用时，会将 Vue 作为参数传入。<br/>
>该方法需要在调用 `new Vue()` 之前被调用。<br/>
当 install 方法被同一个插件多次调用，插件将只会被安装一次。<br/>

```js
function initUse (Vue) {
  Vue.use = function (plugin) {
    var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this
  };
}
```

```js
export function install (_Vue) {
  if (Vue && _Vue === Vue) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      )
    }
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}
```

```js
export default function (Vue) {
  const version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    const _init = Vue.prototype._init
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    const options = this.$options
    // store injection
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
}
```


## 细节点

### isReserved proxy

```js
/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}
```

```js
if (!isReserved(key)) {
	proxy(vm, "_data", key);
}
```

```js
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

## chrome 浏览器调试方法

[在 VS Code 中调试Vue](https://cn.vuejs.org/v2/cookbook/debugging-in-vscode.html)

## 推荐阅读

[知乎黄轶：Vuex 2.0 源码分析](https://zhuanlan.zhihu.com/p/23921964)
[yck：Vuex 源码深度解析](https://yuchengkai.cn/blog/2018-07-31.html)
[美团明裔：Vuex框架原理与源码分析](https://tech.meituan.com/2017/04/27/vuex-code-analysis.html)
[vuex github 仓库](https://github.com/vuejs/vuex)
[vuex 官方文档](https://vuex.vuejs.org/zh/)
[网易考拉前端团队：Vuex 源码分析](https://juejin.im/post/59b88e2e6fb9a00a4f1b0a0b#heading-8)
[小虫巨蟹：Vuex 源码解析（如何阅读源代码实践篇）](https://juejin.im/post/5962c13c6fb9a06b9e11a6a9)
[染陌：Vuex 源码解析](https://juejin.im/post/59f66bd7f265da432d275d30)
[小生方勤：【前端词典】从源码解读 Vuex 注入 Vue 生命周期的过程](https://juejin.im/post/5cb30243e51d456e431ada29)
