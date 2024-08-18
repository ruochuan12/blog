---
highlight: darcula
theme: smartblue
---

# Taro 4.0 已发布 - 5.高手都在用的发布订阅机制 Events 在 Taro 中是如何实现的？

## 1. 前言

大家好，我是[若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

截至目前（`2024-08-18`），[`taro 4.0` 正式版已经发布](https://github.com/NervJS/taro/releases/tag/v4.0.3)，目前最新是 `4.0.4`，官方`4.0`正式版本的介绍文章暂未发布。官方之前发过[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。

计划写一个 `taro` 源码揭秘系列，欢迎持续关注。

-   [x] [Taro 源码揭秘 - 1. 揭开整个架构的入口 CLI => taro init 初始化项目的秘密](https://juejin.cn/post/7378363694939783178)
-   [x] [Taro 源码揭秘 - 2. 揭开整个架构的插件系统的秘密](https://juejin.cn/spost/7380195796208205824)
-   [x] [Taro 源码揭秘 - 3. 每次创建新的 taro 项目（taro init）的背后原理是什么](https://juejin.cn/post/7390335741586931738)
-   [x] [Taro 4.0 已正式发布 - 4. 每次 npm run dev:weapp 开发小程序，build 编译打包是如何实现的？](https://juejin.cn/post/7403193330271682612)
-   [ ] 等等

前面 4 篇文章都是讲述编译相关的，CLI、插件机制、初始化项目、编译构建流程。第 5 篇我们来讲些相对简单的，Taro 是如何实现发布订阅机制 Events 的。

学完本文，你将学到：

```bash
1. Taro 源码中发布订阅机制 Events 是如何实现的
等等
```

## 2. Taro 消息机制

[Taro 消息机制](https://taro-docs.jd.com/docs/next/apis/about/events)文档上，`Taro` 提供了消息机制 `Events`，用来实现组件间通信。我们来学习下如何实现的。

`Taro` 提供了 `Taro.Events` 来实现消息机制，使用时需要实例化它，如下

```ts
import Taro, { Events } from '@tarojs/taro'

const events = new Events()

// 监听一个事件，接受参数
events.on('eventName', (arg) => {
  // doSth
})

// 监听同个事件，同时绑定多个 handler
events.on('eventName', handler1)
events.on('eventName', handler2)
events.on('eventName', handler3)

// 触发一个事件，传参
events.trigger('eventName', arg)

// 触发事件，传入多个参数
events.trigger('eventName', arg1, arg2, ...)

// 取消监听一个事件
events.off('eventName')

// 取消监听一个事件某个 handler
events.off('eventName', handler1)

// 取消监听所有事件
events.off()
```

同时 `Taro` 还提供了一个全局消息中心 `Taro.eventCenter` 以供使用，它是 `Taro.Events` 的实例

```ts
import Taro from '@tarojs/taro'

Taro.eventCenter.on
Taro.eventCenter.trigger
Taro.eventCenter.off
```

`Vue2` 中也有类似的事件 `events api` `$on`、`$off`、`$once`、`$emit`，不过 `Vue3` 移除了。
[vue2 events](https://github.com/vuejs/vue/blob/main/src/core/instance/events.ts)

也有一些 `npm` 包，如：[mitt](https://github.com/developit/mitt/blob/main/src/index.ts)、[tiny-emitter](https://github.com/scottcorgan/tiny-emitter/blob/master/index.js)

源码共读也有一期[第8期 | mitt、tiny-emitter 发布订阅](https://juejin.cn/post/7084984303943155719)

## 3. 根据文档使用实现 Events

文档中，有如下几个需求：

- 监听同个事件，同时绑定多个 handler
- 触发事件，传入多个参数
- 取消监听一个事件某个 handler
- 取消监听所有事件

### 3.1 初步实现 Events

```js
class Events {
	constructor(){
        this.callbacks = [];
    }
	on(eventName, callback){
        this.push({
            eventName,
            callback,
        });
    }
	off(){}
	trigger(){}
}
```

我们用 `callbacks` 数组来存储事件，`push` 方法用来添加事件，支持多个同名的 `eventName`。

### 3.2 off 方法实现

```js
off(eventName, callback){
	this.callbacks = this.callbacks.filter((item) => {
		if(typeof eventName === 'string'){
			if(typeof callback === 'function'){
				return !(item.eventName === eventName && item.callback === callback);
			}
			return item.eventName !== eventName;
		}
		return false;
	});
}
```

`off` 方法用来取消监听事件，如果传入 `eventName` 参数，则取消监听该事件，如果还传入了特定的 `handler`，则只取消监听这个 `handler`。否则取消所有事件。

### 3.3 trigger 方法实现

```js
trigger(eventName, ...args){
	this.callbacks.forEach((item) => {
		if(item.eventName === eventName){
			item.callback(...args);
		}
	});
}
```

`trigger` 传入 `eventName` 和参数，遍历所有事件，如果 `eventName` 匹配，则执行 `handler`。

[Taro events 自行实现所有代码，可打开调试运行](https://code.juejin.cn/pen/7404393720948195354)

## 4. 在茫茫源码中寻找 class Events 实现

文档示例：

```ts
import Taro, { Events } from '@tarojs/taro'

const events = new Events()

Taro.eventCenter.on
Taro.eventCenter.trigger
Taro.eventCenter.off
```

`@tarojs/taro` 对应的源码路径是 `taro/packages/taro`

### 4.1 @tarojs/taro 暴露者开发者的 Taro 核心 API

>暴露给应用开发者的 Taro 核心 API。包含以下小程序端入口文件 `index.js` 等。

```js
const { hooks } = require('@tarojs/runtime')
const taro = require('@tarojs/api').default

if (hooks.isExist('initNativeApi')) {
  hooks.call('initNativeApi', taro)
}

module.exports = taro
module.exports.default = module.exports
```

`@tarojs/api` 对应的源码路径是 `taro/packages/taro-api`

### 4.2 @tarojs/api 所有端的公有 API

>暴露给 @tarojs/taro 的所有端的公有 API。`@tarojs/api` 会跨 node/浏览器/小程序/React Native 使用，不得使用/包含平台特有特性。

```js
// packages/taro-api/src/index.ts
/* eslint-disable camelcase */
import {
  Current,
  eventCenter,
  Events,
  getCurrentInstance,
  nextTick,
  options
} from '@tarojs/runtime'

import { ENV_TYPE, getEnv } from './env'
import Link, { interceptorify } from './interceptor'
import * as interceptors from './interceptor/interceptors'
import {
  Behavior,
  getInitPxTransform,
  getPreload,
  getPxTransform,
} from './tools'

const Taro: Record<string, unknown> = {
  Behavior,
  getEnv,
  ENV_TYPE,
  Link,
  interceptors,
  Current,
  getCurrentInstance,
  options,
  nextTick,
  eventCenter,
  Events,
  getInitPxTransform,
  interceptorify
}

Taro.initPxTransform = getInitPxTransform(Taro)
Taro.preload = getPreload(Current)
Taro.pxTransform = getPxTransform(Taro)

export default Taro
```

这个文件代码不多，就不省略了。`eventCenter,Events`是从 `@tarojs/runtime` 引入的。

`@tarojs/runtime` 对应的源码路径是 `taro/packages/taro-runtime`

### 4.3 @tarojs/runtime Taro 运行时

>Taro 运行时。在小程序端连接框架（DSL）渲染机制到小程序渲染机制，连接小程序路由和生命周期到框架对应的生命周期。在 H5/RN 端连接小程序生命周期**规范**到框架生命周期。

>Events [Taro 消息机制](https://nervjs.github.io/taro/docs/apis/about/events.html#docsNav)。

```ts
// packages/taro-runtime/src/index.ts
export * from './emitter/emitter'
```

```ts
// packages/taro-runtime/src/emitter/emitter.ts
import { Events, hooks } from '@tarojs/shared'

const eventCenter = hooks.call('getEventCenter', Events)!

export type EventsType = typeof Events
export { eventCenter, Events }
```

`@tarojs/shared` 对应的源码路径是 `taro/packages/shared`

### 4.4 @tarojs/shared 内部使用的 utils

>Taro 内部使用的 utils。包含了常用的类型判断、错误断言、组件类型/声明/参数等。`@tarojs/shared` 会跨 node/浏览器/小程序/React Native 使用，不得使用平台特有特性。

>引入此包的必须采用 ES6 引用单个模块语法，且打包配置 external 不得包括此包。

```js
// packages/shared/src/index.ts
// Events 导出的位置
export * from './event-emitter'
// hooks 导出的位置
export * from './runtime-hooks'
```

## 5. class Events 的具体实现

终于在 `packages/shared/src/event-emitter.ts` 找到了 `class Events` 的实现代码。

```ts
// packages/shared/src/event-emitter.ts
type EventName = string | symbol
type EventCallbacks = Record<EventName, Record<'next' | 'tail', unknown>>

export class Events {
  protected callbacks?: EventCallbacks
  static eventSplitter = ',' // Note: Harmony ACE API 8 开发板不支持使用正则 split 字符串 /\s+/

  constructor (opts?) {
    this.callbacks = opts?.callbacks ?? {}
  }
  // 省略这几个方法具体实现，拆分到下方讲述
  on(){}
  once(){}
  off(){}
  trigger(){}
}
```

### 5.1 on 事件监听

```js
on (eventName: EventName, callback: (...args: any[]) => void, context?: any): this {
	let event: EventName | undefined, tail, _eventName: EventName[]
	if (!callback) {
		return this
	}
	if (typeof eventName === 'symbol') {
		_eventName = [eventName]
	} else {
		_eventName = eventName.split(Events.eventSplitter)
	}
	this.callbacks ||= {}
	const calls = this.callbacks
	while ((event = _eventName.shift())) {
		const list = calls[event]
		const node: any = list ? list.tail : {}
		node.next = tail = {}
		node.context = context
		node.callback = callback
		calls[event] = {
			tail,
			next: list ? list.next : node
		}
	}
	return this
}
```

### 5.2 once 事件监听只执行一次

```ts
once (events: EventName, callback: (...r: any[]) => void, context?: any): this {
	const wrapper = (...args: any[]) => {
		callback.apply(this, args)
		this.off(events, wrapper, context)
	}

	this.on(events, wrapper, context)

	return this
}
```

### 5.3 off 事件移除

```ts
off (events?: EventName, callback?: (...args: any[]) => void, context?: any) {
	let event: EventName | undefined, calls: EventCallbacks | undefined, _events: EventName[]
	if (!(calls = this.callbacks)) {
		return this
	}
	if (!(events || callback || context)) {
		delete this.callbacks
		return this
	}
	if (typeof events === 'symbol') {
		_events = [events]
	} else {
		_events = events ? events.split(Events.eventSplitter) : Object.keys(calls)
	}
	while ((event = _events.shift())) {
		let node: any = calls[event]
		delete calls[event]
		if (!node || !(callback || context)) {
			continue
		}
		const tail = node.tail
		while ((node = node.next) !== tail) {
		const cb = node.callback
		const ctx = node.context
		if ((callback && cb !== callback) || (context && ctx !== context)) {
			this.on(event, cb, ctx)
		}
		}
	}
	return this
}
```

### 5.4 trigger 事件触发

```ts
trigger (events: EventName, ...args: any[]) {
	let event: EventName | undefined, node, calls: EventCallbacks | undefined, _events: EventName[]
	if (!(calls = this.callbacks)) {
		return this
	}
	if (typeof events === 'symbol') {
		_events = [events]
	} else {
		_events = events.split(Events.eventSplitter)
	}
	while ((event = _events.shift())) {
		if ((node = calls[event])) {
			const tail = node.tail
			while ((node = node.next) !== tail) {
				node.callback.apply(node.context || this, args)
			}
		}
	}
	return this
}
```

## 6. eventCenter 全局消息中心

```ts
// packages/taro-runtime/src/emitter/emitter.ts
import { Events, hooks } from '@tarojs/shared'
const eventCenter = hooks.call('getEventCenter', Events)!
```

## 7. hooks

runtime-hooks

```ts
// packages/shared/src/runtime-hooks.ts
type ITaroHooks = {
  /** 小程序端 App、Page 构造对象的生命周期方法名称 */
  getMiniLifecycle: (defaultConfig: MiniLifecycle) => MiniLifecycle
  // 省略若干代码
  /** 解决支付宝小程序分包时全局作用域不一致的问题 */
  getEventCenter: (EventsClass: typeof Events) => Events
  // 省略若干代码
  initNativeApi: (taro: Record<string, any>) => void
}

export const hooks = new TaroHooks<ITaroHooks>({
  getMiniLifecycle: TaroHook(HOOK_TYPE.SINGLE, defaultConfig => defaultConfig),
  // 省略若干代码
  getEventCenter: TaroHook(HOOK_TYPE.SINGLE, Events => new Events()),
  // 省略若干代码
  initNativeApi: TaroHook(HOOK_TYPE.MULTI),
})
```

我们来看 `TaroHooks` 的具体实现

## 8. class TaroHooks 的具体实现

```js
// packages/shared/src/runtime-hooks.ts
import { Events } from './event-emitter'
import { isFunction } from './is'

import type { Shortcuts } from './template'

// Note: @tarojs/runtime 不依赖 @tarojs/taro, 所以不能改为从 @tarojs/taro 引入 (可能导致循环依赖)
type TFunc = (...args: any[]) => any

export enum HOOK_TYPE {
  SINGLE,
  MULTI,
  WATERFALL
}

interface Hook {
  type: HOOK_TYPE
  initial?: TFunc | null
}

interface Node {
  next: Node
  context?: any
  callback?: TFunc
}

export function TaroHook (type: HOOK_TYPE, initial?: TFunc): Hook {
  return {
    type,
    initial: initial || null
  }
}

```

```ts
// packages/shared/src/runtime-hooks.ts
export class TaroHooks<T extends Record<string, TFunc> = any> extends Events {
  hooks: Record<keyof T, Hook>

  constructor (hooks: Record<keyof T, Hook>, opts?) {
    super(opts)
    this.hooks = hooks
    for (const hookName in hooks) {
      const { initial } = hooks[hookName]
      if (isFunction(initial)) {
        this.on(hookName, initial)
      }
    }
  }

  private tapOneOrMany<K extends Extract<keyof T, string>> (hookName: K, callback: T[K] | T[K][]) {
    const list = isFunction(callback) ? [callback] : callback
    list.forEach(cb => this.on(hookName, cb))
  }
  //   省略tap、call方法，拆开到下方讲述
  isExist (hookName: string) {
    return Boolean(this.callbacks?.[hookName])
  }
}
```

### 8.1 tap 实现

```ts
tap<K extends Extract<keyof T, string>> (hookName: K, callback: T[K] | T[K][]) {
    const hooks = this.hooks
    const { type, initial } = hooks[hookName]
    if (type === HOOK_TYPE.SINGLE) {
      this.off(hookName)
      this.on(hookName, isFunction(callback) ? callback : callback[callback.length - 1])
    } else {
      initial && this.off(hookName, initial)
      this.tapOneOrMany(hookName, callback)
    }
  }
```

### 8.2 call 实现

```ts
call<K extends Extract<keyof T, string>> (hookName: K, ...rest: Parameters<T[K]>): ReturnType<T[K]> | undefined {
    const hook = this.hooks[hookName]
    if (!hook) return

    const { type } = hook

    const calls = this.callbacks
    if (!calls) return

    const list = calls[hookName] as { tail: Node, next: Node }

    if (list) {
      const tail = list.tail
      let node: Node = list.next
      let args = rest
      let res

      while (node !== tail) {
        res = node.callback?.apply(node.context || this, args)
        if (type === HOOK_TYPE.WATERFALL) {
          const params: any = [res]
          args = params
        }
        node = node.next
      }
      return res
    }
  }
```

## 总结


----

**如果看完有收获，欢迎点赞、评论、分享、收藏支持。你的支持和肯定，是我写作的动力。也欢迎提建议和交流讨论**。

作者：常以**若川**为名混迹于江湖。所知甚少，唯善学。[若川的博客](https://ruochuan12.github.io)

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。
