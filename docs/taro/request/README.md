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

关于克隆项目、环境准备、如何调试代码等，参考[第一篇文章-准备工作、调试](https://juejin.cn/post/7378363694939783178#heading-1)。后续文章基本不再过多赘述。

学完本文，你将学到：

```bash
1.
等等
```

## 2. Taro 文档 - API 说明

平常业务开发

```ts
import Taro from '@tarojs/taro'

Taro.request(url).then(function (res) {
  console.log(res)
})
```

![添加拦截器](./images/addInterceptor.png)

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

![清除所有拦截器](./images/clearInterceptor.png)

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

## equipCommonApis

```ts
// packages/shared/src/native-apis.ts
/**
 * 挂载常用 API
 * @param taro Taro 对象
 * @param global 小程序全局对象，如微信的 wx，支付宝的 my
 */
function equipCommonApis (taro, global, apis: Record<string, any> = {}) {
  // 省略若干代码
  // 添加request 和 拦截器
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

### getNormalRequest

```ts
// packages/shared/src/native-apis.ts
function getNormalRequest (global) {
  return function request (options) {
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

      requestTask = global.request(options)
    })

    equipTaskMethodsIntoPromise(requestTask, p)

    p.abort = (cb) => {
      cb && cb()
      if (requestTask) {
        requestTask.abort()
      }
      return p
    }
    return p
  }
}
```

## `@tarojs/api`

暴露给 @tarojs/taro 的所有端的公有 API。`@tarojs/api` 会跨 node/浏览器/小程序/React Native 使用，不得使用/包含平台特有特性。

![@tarojs/api 目录](./images/dir.png)

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

## Link

### src/interceptor/index.ts

```ts
// packages/taro-api/src/interceptor/index.ts
import Chain from './chain'

import type { IRequestParams, TInterceptor } from './chain'

export default class Link {
  taroInterceptor: TInterceptor
  chain: Chain

  constructor (interceptor: TInterceptor) {
    this.taroInterceptor = interceptor
    this.chain = new Chain()
  }

  request (requestParams: IRequestParams) {
    const chain = this.chain
    const taroInterceptor = this.taroInterceptor

    chain.interceptors = chain.interceptors
      .filter(interceptor => interceptor !== taroInterceptor)
      .concat(taroInterceptor)

    return chain.proceed({ ...requestParams })
  }

  addInterceptor (interceptor: TInterceptor) {
    this.chain.interceptors.push(interceptor)
  }

  cleanInterceptors () {
    this.chain = new Chain()
  }
}

export function interceptorify (promiseifyApi) {
  return new Link(function (chain) {
    return promiseifyApi(chain.requestParams)
  })
}

```

### src/interceptor/chain.ts

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
    this.index = index || 0
    this.requestParams = requestParams || {}
    this.interceptors = interceptors || []
  }

  proceed (requestParams: IRequestParams = {}) {
    this.requestParams = requestParams
    if (this.index >= this.interceptors.length) {
      throw new Error('chain 参数错误, 请勿直接修改 request.chain')
    }
    const nextInterceptor = this._getNextInterceptor()
    const nextChain = this._getNextChain()
    const p = nextInterceptor(nextChain)
    const res = p.catch(err => Promise.reject(err))
    Object.keys(p).forEach(k => isFunction(p[k]) && (res[k] = p[k]))
    return res
  }

  _getNextInterceptor () {
    return this.interceptors[this.index]
  }

  _getNextChain () {
    return new Chain(this.requestParams, this.interceptors, this.index + 1)
  }
}

```

内置了两个拦截器

### src/interceptor/interceptors.ts

#### timeoutInterceptor 超时拦截器

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

#### logInterceptor 日志拦截器

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

----

**如果看完有收获，欢迎点赞、评论、分享、收藏支持。你的支持和肯定，是我写作的动力。也欢迎提建议和交流讨论**。

作者：常以**若川**为名混迹于江湖。所知甚少，唯善学。[若川的博客](https://ruochuan12.github.io)，[github blog](https://github.com/ruochuan12/blog)，可以点个 `star` 鼓励下持续创作。

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。
