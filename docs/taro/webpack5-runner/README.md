---
highlight: darcula
theme: smartblue
---

# Taro 源码揭秘：9. Taro 是如何生成 webpack 配置进行构建小程序的？

## 1. 前言

大家好，我是[若川](https://ruochuan12.github.io)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

截至目前（`2024-11-22`），目前最新是 [`4.0.7`](https://github.com/NervJS/taro/releases/tag/v4.0.7)，官方`4.0`正式版本的介绍文章暂未发布。官方之前发过[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。

计划写一个 Taro 源码揭秘系列，博客地址：[https://ruochuan12.github.io/taro](https://ruochuan12.github.io/taro) 可以加入书签，持续关注[若川](https://juejin.cn/user/1415826704971918)。

-   [x] [1. 揭开整个架构的入口 CLI => taro init 初始化项目的秘密](https://juejin.cn/post/7378363694939783178)
-   [x] [2. 揭开整个架构的插件系统的秘密](https://juejin.cn/post/7380195796208205824)
-   [x] [3. 每次创建新的 taro 项目（taro init）的背后原理是什么](https://juejin.cn/post/7390335741586931738)
-   [x] [4. 每次 npm run dev:weapp 开发小程序，build 编译打包是如何实现的？](https://juejin.cn/post/7403193330271682612)
-   [x] [5. 高手都在用的发布订阅机制 Events 在 Taro 中是如何实现的？](https://juejin.cn/post/7403915119448915977)
-   [x] [6. 为什么通过 Taro.xxx 能调用各个小程序平台的 API，如何设计实现的?](https://juejin.cn/post/7407648740926291968)
-   [x] [7. Taro.request 和请求响应拦截器是如何实现的](https://juejin.cn/post/7415911762128797696)
-   [x] [8. Taro 是如何使用 webpack 打包构建小程序的？](https://juejin.cn/post/7434175547784020031)
-   [ ] 等等

前面 4 篇文章都是讲述编译相关的，CLI、插件机制、初始化项目、编译构建流程。
第 5-7 篇讲述的是运行时相关的 Events、API、request 等。
第 9 篇接着继续追随第4篇和第8篇的脚步，继续分析 [`@tarojs/webpack5-runner`](https://github.com/NervJS/taro/tree/main/packages/taro-webpack5-runner)，Taro 是如何生成 webpack 配置进行构建小程序的？

关于克隆项目、环境准备、如何调试代码等，参考[第一篇文章-准备工作、调试](https://juejin.cn/post/7378363694939783178#heading-1)。后续文章基本不再过多赘述。

学完本文，你将学到：

```bash
1. Taro 是如何生成 webpack 配置进行构建小程序的？
等等
```

## 2. webpack 打包构建

在[第4篇文章](https://juejin.cn/post/7403193330271682612#heading-14)末尾，我们可以回顾下，如何获取 `webpack` 配置和执行 `webpack()` 构建的。还有[第8篇文章](https://juejin.cn/post/7434175547784020031) 把所有 `webpack` 配置输出出来，并解析了一些重要配置。

```js
// webpack 配置
{
  entry: {
    app: [
      '/Users/ruochuan/git-source/github/taro4-debug/src/app.ts'
    ]
  },
  target: ['web', 'es5'],
  // 省略若干配置项...
}
```

我们这篇文章主要来看是如何生成用于构建小程序的 webpack 配置的。

关于打包编译官方有一篇博客[多编译内核生态下的极速研发体验](https://taro-docs.jd.com/blog/2023/03/29/D2_17)，主要讲述思想和流程。

![webpack5 编译内核](./images/webpack-kernal.png)

`Taro RFC` [支持使用 Webpack5 编译小程序和 H5 应用](https://github.com/NervJS/taro/discussions/11533)，讲述了 webpack4 重构为 webpack5 主要的一些修改和优化等。

我们这篇文章主要分析 [`@tarojs/webpack5-runner`](https://github.com/NervJS/taro/tree/main/packages/taro-webpack5-runner) 小程序部分的具体源码实现。

## 3. @tarojs/webpack5-runner

暴露给 `@tarojs/cli` 的小程序/H5 Webpack 启动器。

这个 `npm` 包，主要要解决的问题是：把 `taro` 项目用 `webpack` 编译到小程序、H5、鸿蒙。会涉及到比较多代码是类似或者可以共用的。

`package.json` 入口文件 `"main": "index.js"` 入口文件 `index.js`

```js
// packages/taro-webpack5-runner/index.js
if (process.env.TARO_PLATFORM === 'web') {
  module.exports = require('./dist/index.h5.js').default
} else if (process.env.TARO_PLATFORM === 'harmony' || process.env.TARO_ENV === 'harmony') {
  module.exports = require('./dist/index.harmony.js').default
} else {
  module.exports = require('./dist/index.mini.js').default
}

module.exports.default = module.exports
```

根据不同平台导出不同端的产物。由此可以得出，小程序端的源代码文件是 `packages/taro-webpack5-runner/src/index.mini.ts`。

我们来看 `webpack` 文件夹 `packages/taro-webpack5-runner/src/webpack` 主要文件如下：

基础类 | 小程序 | H5 | 鸿蒙
---|---|---|---
Combination | MiniCombination | H5Combination | HarmonyCombination
BaseConfig | MiniBaseConfig | H5BaseConfig | HarmonyBaseConfig
WebpackPlugin | MiniWebpackPlugin | H5WebpackPlugin| HarmonyWebpackPlugin
WebpackModule | MiniWebpackModule | H5WebpackModule |HarmonyWebpackModule

```ts
// packages/taro-webpack5-runner/src/index.mini.ts

import webpack from 'webpack'
//   省略若干代码
export default async function build (appPath: string, rawConfig: IMiniBuildConfig): Promise<Stats | void> {
  const combination = new MiniCombination(appPath, rawConfig)
  await combination.make()
  //   省略若干代码

  const webpackConfig = combination.chain.toConfig()
  const config = combination.config

  return new Promise<Stats | void>((resolve, reject) => {
    if (config.withoutBuild) return
    const compiler = webpack(webpackConfig)
	// 省略若干代码...
  })
}
```

```js
// 重点就以下这几句
// 生成获取 webpack 配置，执行 webpack(webpackConfig)
const combination = new MiniCombination(appPath, rawConfig)
await combination.make()
const webpackConfig = combination.chain.toConfig()
const compiler = webpack(webpackConfig)
```

调用构造函数 `new MiniCombination(appPath, rawConfig)` 生成 `combination` 对象。
其中 `appPath` 是项目根目录，`rawConfig` 参数，是开发项目中 `config/index` 中的配置和 `ctx.applyPlugins({name: platform, opts: {}})` 注入的各个阶段的钩子函数等。

调用 `make` 方法后，再读取实例对象 `combination.chain.toConfig()` 即可生成 `webpack` 配置了。再调用 `webpack` 函数执行。

## 4. 简易实现

如果不需要考虑小程序端、H5、鸿蒙端等因素。那么可以直接写在一个文件里。

我们可以先实现一个 `Combination` 组合的基础类，其他平台（小程序、H5、鸿蒙）来继承。再来实现一个 `make` 方法。

### 4.1 简易实现 Combination

```ts
class Combination{
	constructor(){
		// 定义一些共用的属性
	}

	async make(){
		// 前置操作
		await this.pre();
		// 主要操作，让子类来实现
		this.process();
		// 后置操作
		await this.post();
	}
	async pre(){},
	process(){},
	async post(){},
}
```

### 4.2 简易实现 MiniCombination

```ts
class MiniCombination extends Combination{
	process(){
		const baseConfig = new MiniBaseConfig();
    	const chain = this.chain = baseConfig.chain;
		this.chain.merge({
			// ...
		});
	}
}
```

我们在这里调用 `new MiniBaseConfig` 类。这个类继承自 `BaseConfig` 基础配置类。`process` 函数执行完成，就可以用 `miniCombination.chain.toConfig()` 获取最终的 `webpack` 配置。

### 4.3 简易实现 MiniBaseConfig

```ts
export class MiniBaseConfig extends BaseConfig {
 constructor() {
    super();
	this.chain.merge({
		// 小程序端的配置
	});
 }
}
```

我们来简易实现这个关键基础配置类。

### 4.4 简易实现 BaseConfig

会有一些基础配置，我们先实现一个 BaseConfig 类。

```ts
import Chain from 'webpack-chain';
export class BaseConfig {
  constructor () {
    const chain = this._chain = new Chain()
    chain.merge({
      target: ['web', 'es5'],
	  //   等基础配置
    })
  }
  get chain(){
	return this._chain;
  }
}
```

这里我们引入 [webpack-chain](https://github.com/neutrinojs/webpack-chain) 这个 npm 包，虽然到现在已经不维护了，但是下载量极大。
>webpack-chain 使用链式 API 生成并简化 webpack 4 配置的修改。


webpack-chain 简易实现。

```ts
// webpack-chain
class Chain{
	constructor(){}
    static toString(){
       console.log('string');
		return JSON.stringify({});
    }
	merge(){
		// 合并配置
	}
    toConfig(){
		// 可以返回所有配置
        console.log('toConfig');
		return {};
    }
}
```

上文的简易实现，基本就是整个源码的组织结构。

我们来看真实的源码实现。

## 5. Combination 组合

```ts
export class MiniCombination extends Combination<IMiniBuildConfig> {
	process (config: Partial<IMiniBuildConfig>) {
		// 省略代码
	}
}
```

```ts
export class Combination<T extends IMiniBuildConfig | IH5BuildConfig | IHarmonyBuildConfig = CommonBuildConfig> {
  appPath: string
  config: T
  chain: Chain
  //   省略若干代码...

  constructor (appPath: string, config: T) {
    this.appPath = appPath
    this.rawConfig = config
    //   省略若干代码...
  }

  async make () {
    await this.pre(this.rawConfig)
    this.process(this.config)
    await this.post(this.config, this.chain)
  }

  process (_config: Partial<T>) {}

  async pre (rawConfig: T) {
    // 拆分放到下方
  }

  async post (config: T, chain: Chain) {
    // 拆分放到下方
  }
}
```

### 5.1 pre 前置处理

```ts
async pre (rawConfig: T) {
    const preMode = rawConfig.mode || process.env.NODE_ENV
    const mode = ['production', 'development', 'none'].find(e => e === preMode) ||
      (!rawConfig.isWatch || process.env.NODE_ENV === 'production' ? 'production' : 'development')
    /** process config.sass options */
    const sassLoaderOption = await getSassLoaderOption(rawConfig)
    this.config = {
      ...rawConfig,
      sassLoaderOption,
      mode,
      frameworkExts: rawConfig.frameworkExts || SCRIPT_EXT
    }
  }
```

### 5.2 post 后置处理

```ts
async post (config: T, chain: Chain) {
    const { modifyWebpackChain, webpackChain, onWebpackChainReady } = config
    const data: IModifyChainData = {
      componentConfig
    }
    if (isFunction(modifyWebpackChain)) {
      await modifyWebpackChain(chain, webpack, data)
    }
    if (isFunction(webpackChain)) {
      webpackChain(chain, webpack, META_TYPE)
    }
    if (isFunction(onWebpackChainReady)) {
      onWebpackChainReady(chain)
    }
  }
```

调用配置中的钩子函数 `modifyWebpackChain`、`webpackChain`、`onWebpackChainReady`。

## 6. MiniCombination 小程序组合类

```ts
export class MiniCombination extends Combination<IMiniBuildConfig> {
  buildNativePlugin: BuildNativePlugin
  fileType: IFileType
  isBuildPlugin = false
  optimizeMainPackage: { enable?: boolean | undefined, exclude?: any[] | undefined } = {
    enable: true
  }

  process (config: Partial<IMiniBuildConfig>) {
    const baseConfig = new MiniBaseConfig(this.appPath, config)
    const chain = this.chain = baseConfig.chain

    // 省略若干代码...拆分到下方在讲述

    chain.merge({
      entry: webpackEntry,
      output: webpackOutput,
      mode,
      devtool: this.getDevtool(sourceMapType),
      resolve: {
        alias: this.getAlias()
      },
      plugin,
      module,
      optimization: this.getOptimization()
    })
  }
}
```

最后 `chain.merge` 入口、出口、插件、模块等，整个过程就结束了，完美撒花~当然，我们肯定不会只限于此。

我们先来看看 `MiniBaseConfig` 的具体实现。

```ts
export class MiniBaseConfig extends BaseConfig {
  defaultTerserOptions = {
	// 省略
  }

  constructor(appPath: string, config: Partial<IMiniBuildConfig>) {
    super(appPath, config)
	// ...
  }
}
```

可以看出继承自 `BaseConfig` 基本配置类。

我们来看看 `BaseConfig` 类的具体实现。

## 7. BaseConfig 基本配置类

```ts
import Chain from 'webpack-chain'
export class BaseConfig {
  private _chain: Chain

  constructor (appPath: string, config: Config) {
    const chain = this._chain = new Chain()
    chain.merge({
      target: ['web', 'es5'],
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.vue'],
        symlinks: true,
        plugin: {
          MultiPlatformPlugin: {
            plugin: MultiPlatformPlugin,
            args: ['described-resolve', 'resolve', { chain }]
          }
        }
      },
	  // 省略若干代码...
    })

    // 持久化缓存
	// 省略若干代码...
  }

  // minimizer 配置
  protected setMinimizer (config: Config, defaultTerserOptions) {
	// 省略若干代码...
	this.chain.merge({
      optimization: {
        minimize,
        minimizer
      }
    })
  }

  get chain () {
    return this._chain
  }
}
```

## 8. MiniBaseConfig 小程序基本配置类

```ts
export class MiniBaseConfig extends BaseConfig {
  defaultTerserOptions = {
    parse: {
      ecma: 8,
    },
    compress: {
      ecma: 5,
      warnings: false,
	  //   省略代码...
    },
    output: {
      ecma: 5,
      comments: false,
      ascii_only: true,
    },
  }

  constructor(appPath: string, config: Partial<IMiniBuildConfig>) {
    super(appPath, config)
    const mainFields = [...defaultMainFields]
    const resolveOptions = {
      basedir: appPath,
      mainFields,
    }
    this.chain.merge({
      resolve: {
        mainFields,
        alias: {
          // 小程序使用 regenerator-runtime@0.11
          'regenerator-runtime': require.resolve('regenerator-runtime'),
          // 开发组件库时 link 到本地调试，runtime 包需要指向本地 node_modules 顶层的 runtime，保证闭包值 Current 一致，shared 也一样
          '@tarojs/runtime': resolveSync('@tarojs/runtime', resolveOptions),
          '@tarojs/shared': resolveSync('@tarojs/shared', resolveOptions),
        },
        // [Webpack 4] config.node: { fs: false, path: false }
        // [Webpack 5] config.resolve.fallback
        fallback: {
          fs: false,
          path: false,
        },
      },
	  // 省略若干代码...
    })

    this.setMinimizer(config, this.defaultTerserOptions)
  }
}

```

## 9. 再探 MiniCombination 实例对象的 process 函数

### 9.1 process 第一部分

```ts
process (config: Partial<IMiniBuildConfig>) {
	const baseConfig = new MiniBaseConfig(this.appPath, config)
    const chain = this.chain = baseConfig.chain

    const {
      entry = {},
      output = {},
      mode = 'production',
      globalObject = 'wx',
      sourceMapType = 'cheap-module-source-map',
      fileType = {
        style: '.wxss',
        config: '.json',
        script: '.js',
        templ: '.wxml'
      },
      /** special mode */
      isBuildPlugin = false,
      /** hooks */
      modifyComponentConfig,
      optimizeMainPackage
    } = config

    this.fileType = fileType

    modifyComponentConfig?.(componentConfig, config)
	// 拆分在下方
}
```

### 9.2 process 第二部分

```ts
process (config: Partial<IMiniBuildConfig>) {
	if (isBuildPlugin) {
      // 编译目标 - 小程序原生插件
      this.isBuildPlugin = true
      this.buildNativePlugin = BuildNativePlugin.getPlugin(this)
      chain.merge({
        context: path.join(process.cwd(), this.sourceRoot, 'plugin')
      })
    }

    if (optimizeMainPackage) {
      this.optimizeMainPackage = optimizeMainPackage
    }
}
```

如果是编译小程序原生插件，webpack 配置项，合入 context 配置。
optimizeMainPackage 顾名知意。优化主包，默认开启。

### 9.3 process 第三部分

```ts
process (config: Partial<IMiniBuildConfig>) {
    const webpackEntry = this.getEntry(entry)
    const webpackOutput = this.getOutput({
      publicPath: '/',
      globalObject,
      isBuildPlugin,
      output
    })
    const webpackPlugin = new MiniWebpackPlugin(this)
    const webpackModule = new MiniWebpackModule(this)

    const module = webpackModule.getModules()
    const [, pxtransformOption] = webpackModule.__postcssOption.find(([name]) => name === 'postcss-pxtransform') || []
    webpackPlugin.pxtransformOption = pxtransformOption as any
    const plugin = webpackPlugin.getPlugins()

	chain.merge({
		// ...
	});
}
```

这部分代码主要获取入口、出口、`modules`、`plugins` 等，合并到之前的 webpack 配置中。

我们接下来，继续分析。
- getEntry
- getOutput
- MiniWebpackPlugin
- MiniWebpackModule

## 10. getEntry 获取入口

```ts
getEntry (entry: IMiniBuildConfig['entry']) {
    return this.isBuildPlugin ? this.buildNativePlugin.entry : entry
}
```

如果是编译插件，用插件的入口，否则是用入口 `{entry: app: [ 'src/app.ts' ]}`

## 11. getOutput 获取出口

```ts
getOutput ({ publicPath, globalObject, isBuildPlugin, output }) {
    return {
      path: this.outputDir,
      publicPath,
      filename: '[name].js',
      chunkFilename: '[name].js',
      globalObject,
      enabledLibraryTypes: isBuildPlugin ? ['commonjs'] : [],
      ...output
    }
  }
```

支持混入开发者传入的 `output`，项目 `config/index.ts` 中的配置。

## 12. MiniWebpackPlugin 提供小程序应用所需插件

```ts
// packages/taro-webpack5-runner/src/webpack/MiniWebpackPlugin.ts
export class MiniWebpackPlugin {
  combination: MiniCombination
  pxtransformOption: IPostcssOption<'mini'>['pxtransform']

  constructor (combination: MiniCombination) {
    this.combination = combination
  }

  getPlugins () {
    const plugins: Record<string, { plugin: any, args: PluginArgs }> = {
      providerPlugin: this.getProviderPlugin(),
      definePlugin: this.getDefinePlugin(),
      miniCssExtractPlugin: this.getMiniCssExtractPlugin()
    }

    // 省略若干代码...

    return plugins
  }
}

```

小程序 webpack 插件设置。可以用 getPlugins 获取 webpack 插件。

## 13. MiniWebpackModule 处理小程序模块加载规则

```ts
// packages/taro-webpack5-runner/src/webpack/MiniWebpackModule.ts
export class MiniWebpackModule {
  combination: MiniCombination
  __postcssOption: [string, any, Func?][]

  constructor (combination: MiniCombination) {
    this.combination = combination
  }

  getModules () {
    const { appPath, config, sourceRoot, fileType } = this.combination

    const rule: Record<string, IRule> = {
      //   省略若干代码...

      media: this.getMediaRule(),

      font: this.getFontRule(),

      image: this.getImageRule()
    }
    return { rule }
  }
}
```

小程序 webpack module 设置。可以用 getModules 获取 webpack modules。

## 14. WebpackPlugin 提供应用所需插件

```ts
// packages/taro-webpack5-runner/src/webpack/WebpackPlugin.ts

export default class WebpackPlugin {
  static getPlugin (plugin, args: PluginArgs) {
    return {
      plugin,
      args
    }
  }

  static getCopyWebpackPlugin (appPath: string, copy: ICopyOptions) {
    /** @doc https://webpack.js.org/plugins/copy-webpack-plugin */
    const CopyWebpackPlugin = require('copy-webpack-plugin')
    // 省略代码...
    return WebpackPlugin.getPlugin(CopyWebpackPlugin, [args])
  }

  // 省略若干代码...
}

```

基础的 webpack plugin 设置。提供给不同的平台（小程序、H5、鸿蒙）调用。

## 15. WebpackModule 处理不同模块加载规则

```ts
// packages/taro-webpack5-runner/src/webpack/WebpackModule.ts

export class WebpackModule {
  static getLoader (loaderName: string, options: Record<string, any> = {}) {
    return {
      loader: require.resolve(loaderName),
      options
    }
  }
  static getCSSLoader (cssLoaderOption) {
    const defaultOptions = {
      importLoaders: 1,
      modules: false
    }
    const options = Object.assign(defaultOptions, cssLoaderOption)
    return WebpackModule.getLoader('css-loader', options)
  }
  // 省略若干代码...
}
```

基础的 webpack module 设置。提供给不同的平台（小程序、H5、鸿蒙）调用。

## 16. 总结

我们来回顾下开头的官方博客的配图。

![webpack5 编译内核](./images/webpack-kernal.png)

还有开头的 `BaseConfig` 简易实现和 `MiniCombination` 简易实现。

```ts
import Chain from 'webpack-chain';
export class BaseConfig {
  constructor () {
    const chain = this._chain = new Chain()
    chain.merge({
      target: ['web', 'es5'],
	  //   等基础配置
    })
  }
  get chain(){
	return this._chain;
  }
}
```

```ts
class MiniCombination extends Combination{
	process(){
		const baseConfig = new MiniBaseConfig();
    	const chain = this.chain = baseConfig.chain;
		this.chain.merge({
			// ...
		});
	}
}
```

我们通过 [webpack-chain](https://github.com/neutrinojs/webpack-chain) 链式 API 来生成 webpack 配置。

我们在这里调用 `new MiniBaseConfig` 类。这个类继承自 `BaseConfig` 基础配置类。`process` 函数执行完成，就可以用 `miniCombination.chain.toConfig()` 获取最终的 `webpack` 配置。

我们主要分析了 [`@tarojs/webpack5-runner`](https://github.com/NervJS/taro/tree/main/packages/taro-webpack5-runner) 的生成小程序部分的 `webpack` 配置的实现。

下一篇应该是分析给 `taro` 写的特定的 webpack 插件 TaroMiniPlugin。

----

**如果看完有收获，欢迎点赞、评论、分享、收藏支持。你的支持和肯定，是我写作的动力。也欢迎提建议和交流讨论**。

作者：常以**若川**为名混迹于江湖。所知甚少，唯善学。[若川的博客](https://ruochuan12.github.io)，[github blog](https://github.com/ruochuan12/blog)，可以点个 `star` 鼓励下持续创作。

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。
