---
highlight: darcula
theme: smartblue
---

# Taro 4.0 已正式发布 - 7. Taro.request 和请求响应拦截器是如何实现的

## 1. 前言

大家好，我是[若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

截至目前（`2024-09-18`），[`taro 4.0` 正式版已经发布](https://github.com/NervJS/taro/releases/tag/v4.0.3)，目前最新是 `4.0.5`，官方`4.0`正式版本的介绍文章暂未发布。官方之前发过[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。

计划写一个 `taro` 源码揭秘系列，欢迎持续关注。

-   [x] [1. 揭开整个架构的入口 CLI => taro init 初始化项目的秘密](https://juejin.cn/post/7378363694939783178)
-   [x] [2. 揭开整个架构的插件系统的秘密](https://juejin.cn/post/7380195796208205824)
-   [x] [3. 每次创建新的 taro 项目（taro init）的背后原理是什么](https://juejin.cn/post/7390335741586931738)
-   [x] [4. 每次 npm run dev:weapp 开发小程序，build 编译打包是如何实现的？](https://juejin.cn/post/7403193330271682612)
-   [x] [5. 高手都在用的发布订阅机制 Events 在 Taro 中是如何实现的？](https://juejin.cn/post/7403915119448915977)
-   [x] [6. 为什么通过 Taro.xxx 能调用各个小程序平台的 API，如何设计实现的?](https://juejin.cn/post/7407648740926291968)
-   [ ] 等等

前面 4 篇文章都是讲述编译相关的，CLI、插件机制、初始化项目、编译构建流程。第 7 篇我们来讲些相对简单的，Taro.request 和请求响应拦截器是如何实现的？文章以微信小程序为例。

>关于请求响应拦截器，我曾在 2019年 写过 [axios 源码文章](https://juejin.cn/post/6844904019987529735#heading-21)（575赞、761收藏、2.5w阅读），还画了 `axios` 拦截器的图。虽然之前文章写的版本是`v0.19.x` ，但是相比现在的源码整体结构基本没有太大变化，感兴趣的可以看看。

关于克隆项目、环境准备、如何调试代码等，参考[第一篇文章-准备工作、调试](https://juejin.cn/post/7378363694939783178#heading-1)。后续文章基本不再过多赘述。

学完本文，你将学到：

```bash
1. Taro.request 的实现
2. Taro.addInterceptor 请求和响应拦截器的使用和具体实现
等等
```

我们先来看文档，熟悉 `Taro.request` 的使用。

## 2. Taro request 相关文档

平常业务开发

```ts
import Taro from '@tarojs/taro'

Taro.request(url).then(function (res) {
  console.log(res)
})
```

我们来看下 `Taro` 拦截器相关的文档：

![添加拦截器.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/f15e1eb7732f424b9e9db10bd6ee2236~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg6Iul5bed:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1726756556&x-orig-sign=PgKPoXcDFV6xwWxW0WIeFqdOpd0%3D)

`Taro.addInterceptor` 示例代码1

```ts
const interceptor = function (chain) {
  const requestParams = chain.requestParams
  const { method, data, url } = requestParams

  console.log(`http ${method || 'GET'} --> ${url} data: `, data)

  return chain.proceed(requestParams)
    .then(res => {
      console.log(`http <-- ${url} result:`, res)
      return res
    })
  }
Taro.addInterceptor(interceptor)
Taro.request({ url })
```

[`Taro.addInterceptor`文档](https://taro-docs.jd.com/docs/next/apis/network/request/addInterceptor) 示例代码2

```ts
Taro.addInterceptor(Taro.interceptors.logInterceptor)
Taro.addInterceptor(Taro.interceptors.timeoutInterceptor)
Taro.request({ url })
```

![清除所有拦截器.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/5ef663a84f94483fbebfdafbcff1e4ab~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg6Iul5bed:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1726756581&x-orig-sign=5O%2BNq2ZTrUtiwOfFaUtoTjjnlZk%3D)

`Taro.cleanInterceptors` 清除所有拦截器

```ts
Taro.cleanInterceptors()
```

`@tarojs/taro` 对应的源码。

```ts
// packages/taro/index.js
const { hooks } = require('@tarojs/runtime')
const taro = require('@tarojs/api').default

if (hooks.isExist('initNativeApi')) {
  hooks.call('initNativeApi', taro)
}

module.exports = taro
module.exports.default = module.exports
```

`@tarojs/api` 源码暂时先不讲述。

我们来回顾下上篇文章中 [Taro 源码揭秘 - 6. 为什么通过 Taro.xxx 能调用各个小程序平台的 API，如何设计实现的?](https://juejin.cn/post/7407648740926291968#heading-11)

在端平台插件运行时 `runtime` 中，`mergeReconciler(hostConfig)` `hooks.tap` 注册事件 `initNativeApi`。
`hostConfig` 对象中有 `initNativeApi` 函数
`initNativeApi` 函数中调用了 `processApis` 函数。
`processApis` 中调用了 `equipCommonApis` 这个函数挂载常用的apis。

## 3. equipCommonApis 挂载公共 apis

```ts
// packages/shared/src/native-apis.ts
/**
 * 挂载常用 API
 * @param taro Taro 对象
 * @param global 小程序全局对象，如微信的 wx，支付宝的 my
 */
function equipCommonApis (taro, global, apis: Record<string, any> = {}) {
  // 省略若干代码
  // 添加 request 和拦截器
  // request & interceptors
  const request = apis.request || getNormalRequest(global)
  function taroInterceptor (chain) {
    return request(chain.requestParams)
  }
  const link = new taro.Link(taroInterceptor)
  taro.request = link.request.bind(link)
  taro.addInterceptor = link.addInterceptor.bind(link)
  taro.cleanInterceptors = link.cleanInterceptors.bind(link)
  //   省略若干代码
}
```

你可能会问：

我们接着来看 `getNormalRequest` 是怎么实现的？

`taro.Link` 哪来的，为什么把  `taroInterceptor` 函数传递给它。
`link` 是 `Link` 的实例对象。
`taro.request` 是 `link.request`
`taro.addInterceptor` 是 `link.addInterceptor`
`taro.cleanInterceptors` 是 `link.cleanInterceptors`。

我们接着先来看 `getNormalRequest` 的代码实现，再看 `Link` 的代码实现。寻找问题的答案。

### 3.1 getNormalRequest 获取标准的 request

`getNormalRequest` 返回一个 `request` 函数，`request` 函数返回的是 `promise`。

```ts
// packages/shared/src/native-apis.ts
function getNormalRequest (global) {
  return function request (options) {
	// 第一步：先是处理下 options，有值，如果是字符串传入url，不是就直接返回 options
	// 没有值赋值空对象
    options = options
      ? (
        isString(options)
          ? { url: options }
          : options
      )
      : {}

    const originSuccess = options.success
    const originFail = options.fail
    const originComplete = options.complete

	// 第二步：声明 requestTask 和 promise
    let requestTask
    const p: any = new Promise((resolve, reject) => {
      options.success = res => {
        originSuccess && originSuccess(res)
        resolve(res)
      }
      options.fail = res => {
        originFail && originFail(res)
        reject(res)
      }

      options.complete = res => {
        originComplete && originComplete(res)
      }

	  // 参数传入 global.request ，global 是 wx、my 等
      requestTask = global.request(options)
    })

	// 第三步：将Task对象中的方法挂载到 promise 对象中，适配小程序 api 原生返回结果
    equipTaskMethodsIntoPromise(requestTask, p)

	// 第四步：取消，调用 task 的取消
    p.abort = (cb) => {
      cb && cb()
      if (requestTask) {
        requestTask.abort()
      }
      return p
    }
	// 最后返回 promise，也就是为什么可以调用 Taro.request then、catch 方法
    return p
  }
}
```

`getNormalRequest` 的实现步骤：

- 第一步：先是处理下 options，有值，如果是字符串传入url，不是就直接返回 options
- 第二步：声明 requestTask 和 promise
- 第三步：将 Task 对象中的方法挂载到 promise 对象中，适配小程序 api 原生返回结果
- 第四步：取消，调用 task 的取消
- 最后返回 promise，也就是为什么可以调用 Taro.request then、catch 方法

其中调用了 `equipTaskMethodsIntoPromise` 方法，我们简单看下这个方法的实现：

### 3.2 equipTaskMethodsIntoPromise 适配小程序 api 原生返回结果

`equipTaskMethodsIntoPromise` 方法的实现如下：

```ts
// packages/shared/src/native-apis.ts
/**
 * 将Task对象中的方法挂载到promise对象中，适配小程序api原生返回结果
 * @param task Task对象 {RequestTask | DownloadTask | UploadTask}
 * @param promise Promise
 */
function equipTaskMethodsIntoPromise (task, promise) {
  if (!task || !promise) return
  const taskMethods = ['abort', 'onHeadersReceived', 'offHeadersReceived', 'onProgressUpdate', 'offProgressUpdate', 'onChunkReceived', 'offChunkReceived']
  task && taskMethods.forEach(method => {
    if (method in task) {
      promise[method] = task[method].bind(task)
    }
  })
}
```

[文档 - wx.uploadFile](https://developers.weixin.qq.com/miniprogram/dev/api/network/upload/wx.uploadFile.html) |
[文档 - 返回值 UploadTask](https://developers.weixin.qq.com/miniprogram/dev/api/network/upload/UploadTask.html) |
[文档 - wx.downloadFile](https://developers.weixin.qq.com/miniprogram/dev/api/network/download/wx.downloadFile.html) |
[文档 - 返回值 DownloadTask](https://developers.weixin.qq.com/miniprogram/dev/api/network/download/DownloadTask.html) |

看完了 `getNormalRequest` 的实现，我们接着来看 `Link` 的具体实现，我们可以知道 `new taro.Link` 必定是在 `@tarojs/taro` 实现的。 文章开头没有展开讲述的 `@tarojs/api`。

## 4. @tarojs/api 所有端的公共 API

>暴露给 @tarojs/taro 的所有端的公有 API。`@tarojs/api` 会跨 node/浏览器/小程序/React Native 使用，不得使用/包含平台特有特性。

我们来看下 `@tarojs/api` 目录，如下图所示：

![@tarojs/api 目录.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/345bf88840b9494d9cd6de5edf53f3de~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg6Iul5bed:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1726756614&x-orig-sign=lNy06QdolNrlwy1fzJGh%2BxeE%2FOw%3D)

入口文件 `packages/taro-api/src/index.ts`。

再就是拦截器实现的文件夹 `packages/taro-api/src/interceptor/`。

- packages/taro-api/src/interceptor/index.ts 入口
- packages/taro-api/src/interceptor/interceptor/chain.ts 链
- packages/taro-api/src/interceptor/interceptor/interceptors.ts 内置的拦截器

我们先来看 `@tarojs/api` 的入口文件。

```ts
// packages/taro-api/src/index.ts

/* eslint-disable camelcase */
// 省略若干代码
import Link, { interceptorify } from './interceptor'
import * as interceptors from './interceptor/interceptors'

const Taro: Record<string, unknown> = {
  Link,
  interceptors,
  interceptorify,
}

export default Taro
```

从 `interceptor` 导出 `Link、interceptorify`、`interceptor/interceptors` 导出所有内置拦截器，赋值到 `Taro` 上。

## 5. Link 构造函数

### 5.1 拦截器入口文件 src/interceptor/index.ts

```ts
// packages/taro-api/src/interceptor/index.ts
import Chain from './chain'

import type { IRequestParams, TInterceptor } from './chain'

export default class Link {
  taroInterceptor: TInterceptor
  chain: Chain

  constructor (interceptor: TInterceptor) {
	// 传入的拦截器是返回一个 promise 的函数
    this.taroInterceptor = interceptor
	// 初始化 Chain 实例对象
    this.chain = new Chain()
  }

  request (requestParams: IRequestParams) {
    // 省略，拆开下方讲述
  }

  // 添加拦截器
  addInterceptor (interceptor: TInterceptor) {
    this.chain.interceptors.push(interceptor)
  }

  // 清空拦截器
  cleanInterceptors () {
    this.chain = new Chain()
  }
}

// 转换成 Taro 拦截器
export function interceptorify (promiseifyApi) {
  return new Link(function (chain) {
    return promiseifyApi(chain.requestParams)
  })
}

```

我们来看下 `link.request` 的实现：

```ts
export default class Link {
  request (requestParams: IRequestParams) {
    const chain = this.chain
    const taroInterceptor = this.taroInterceptor

    chain.interceptors = chain.interceptors
      .filter(interceptor => interceptor !== taroInterceptor)
      .concat(taroInterceptor)

    return chain.proceed({ ...requestParams })
  }
}
```

`Link` 实例对象的 `request` 方法代码也不多，把传入的拦截器，放到最后。
最后调用链的 `proceed` 方法 `chain.proceed`。

你可能会问，`chain` 是如何实现的呢。

那么我们来看 `chain` 的具体实现：

### 5.2 链 src/interceptor/chain.ts

>Taro文档：在调用 `Taro.request` 发起请求之前，调用 `Taro.addInterceptor` 方法为请求添加拦截器，拦截器的调用顺序遵循洋葱模型。 拦截器是一个函数，接受 `chain` 对象作为参数。`chain` 对象中含有 `requestParmas` 属性，代表请求参数。拦截器内最后需要调用 `chain.proceed(requestParams)` 以调用下一个拦截器或发起请求。

```ts
// packages/taro-api/src/interceptor/chain.ts

import { isFunction } from '@tarojs/shared'

export type TInterceptor = (c: Chain) => Promise<void>

export interface IRequestParams {
  timeout?: number
  method?: string
  url?: string
  data?: unknown
}

export default class Chain {
  index: number
  requestParams: IRequestParams
  interceptors: TInterceptor[]

  constructor (requestParams?: IRequestParams, interceptors?: TInterceptor[], index?: number) {
	// 初始化三个参数，索引值，请求参数和存放拦截器的数组
    this.index = index || 0
    this.requestParams = requestParams || {}
    this.interceptors = interceptors || []
  }

  proceed (requestParams: IRequestParams = {}) {
	// 省略，拆开放到下方单独讲述
  }

  // 内部方法，取下一个拦截器
  _getNextInterceptor () {
    return this.interceptors[this.index]
  }

  // 内部方法，取下一个链
  _getNextChain () {
    return new Chain(this.requestParams, this.interceptors, this.index + 1)
  }
}

```

我们来看 `chain.proceed` 方法的实现：

```ts
export default class Chain {
  proceed (requestParams: IRequestParams = {}) {
	// 第一步：调用这个方法的参数赋值为请求参数
    this.requestParams = requestParams
	// 第二步：拦截器数量不对抛出错误
    if (this.index >= this.interceptors.length) {
      throw new Error('chain 参数错误, 请勿直接修改 request.chain')
    }
	// 第三步：取出下一个拦截器
    const nextInterceptor = this._getNextInterceptor()
	// 第四步：取出下一个链
    const nextChain = this._getNextChain()
	// 第六步：把下一个链作为参数传入到下一个拦截器调用，返回 promise
    const p = nextInterceptor(nextChain)
	// 第六步：捕获错误
    const res = p.catch(err => Promise.reject(err))
	// 第七步：遍历实例对象 promise，如果是函数就赋值到 res[k] = p[k];
    Object.keys(p).forEach(k => isFunction(p[k]) && (res[k] = p[k]))
	// 第八步：返回 res promise
    return res
  }
}
```

## 6. 内置的两个拦截器

内置的拦截器，Taro 文档中有说明。

>`Taro` 提供了两个内置拦截器 `logInterceptor` 与 `timeoutInterceptor`，分别用于打印请求的相关信息和在请求超时时抛出错误。

[`Taro.addInterceptor`文档](https://taro-docs.jd.com/docs/next/apis/network/request/addInterceptor) 示例代码2

```ts
Taro.addInterceptor(Taro.interceptors.logInterceptor)
Taro.addInterceptor(Taro.interceptors.timeoutInterceptor)
Taro.request({ url })
```

`import * as interceptors from './interceptor/interceptors'`

`@tarojs/api` 入口文件也有导出内置的拦截器挂载到 `Taro` 上。

我们接着来学习它们的实现。

### 6.1 timeoutInterceptor 超时拦截器

```ts
// packages/taro-api/src/interceptor/interceptors.ts
import { isFunction, isUndefined } from '@tarojs/shared'

import type Chain from './chain'

export function timeoutInterceptor (chain: Chain) {
  const requestParams = chain.requestParams
  let p: Promise<void>
  const res = new Promise<void>((resolve, reject) => {
    const timeout: ReturnType<typeof setTimeout> = setTimeout(() => {
      clearTimeout(timeout)
      reject(new Error('网络链接超时,请稍后再试！'))
    }, (requestParams && requestParams.timeout) || 60000)

    p = chain.proceed(requestParams)
    p
      .then(res => {
        if (!timeout) return
        clearTimeout(timeout)
        resolve(res)
      })
      .catch(err => {
        timeout && clearTimeout(timeout)
        reject(err)
      })
  })
  // @ts-ignore
  if (!isUndefined(p) && isFunction(p.abort)) res.abort = p.abort

  return res
}
```

### 6.2 logInterceptor 日志拦截器

```ts
// packages/taro-api/src/interceptor/interceptors.ts
export function logInterceptor (chain: Chain) {
  const requestParams = chain.requestParams
  const { method, data, url } = requestParams

  // eslint-disable-next-line no-console
  console.log(`http ${method || 'GET'} --> ${url} data: `, data)

  const p = chain.proceed(requestParams)
  const res = p
    .then(res => {
      // eslint-disable-next-line no-console
      console.log(`http <-- ${url} result:`, res)
      return res
    })
  // @ts-ignore
  if (isFunction(p.abort)) res.abort = p.abort

  return res
}

```

## 7. 总结

我们从文档出发`Taro.request` 的使用和文档中拦截器的使用，分析了 `Taro.request` 的具体实现和 `Taro` 的 `request` 请求和响应拦截器实现。
端平台插件运行时（runtime）挂载 `global.request`。
`@tarojs/taro`、`@tarojs/api` 中实现的 `Chain` 链和 `Link` `request` 构造函数。

----

**如果看完有收获，欢迎点赞、评论、分享、收藏支持。你的支持和肯定，是我写作的动力。也欢迎提建议和交流讨论**。

作者：常以**若川**为名混迹于江湖。所知甚少，唯善学。[若川的博客](https://ruochuan12.github.io)，[github blog](https://github.com/ruochuan12/blog)，可以点个 `star` 鼓励下持续创作。

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。
