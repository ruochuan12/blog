---
highlight: darcula
theme: smartblue
---

# Taro 源码揭秘：10. taro taroMiniPlugin 插件

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
-   [x] [9. Taro 是如何生成 webpack 配置进行构建小程序的？](https://juejin.cn/post/7439743635161710604)
-   [ ] 等等

前面 4 篇文章都是讲述编译相关的，CLI、插件机制、初始化项目、编译构建流程。
第 5-7 篇讲述的是运行时相关的 Events、API、request 等。
第 9 篇接着继续追随第4篇和第8篇的脚步，继续分析 [`@tarojs/webpack5-runner`](https://github.com/NervJS/taro/tree/main/packages/taro-webpack5-runner)，Taro 是如何生成 webpack 配置进行构建小程序的？

关于克隆项目、环境准备、如何调试代码等，参考[第一篇文章-准备工作、调试](https://juejin.cn/post/7378363694939783178#heading-1)。后续文章基本不再过多赘述。

学完本文，你将学到：

```bash
1. Taro
等等
```

[webpack 自定义插件](https://webpack.docschina.org/contribute/writing-a-plugin/)
[compiler 钩子](https://webpack.docschina.org/api/compiler-hooks/)

```ts
export default class TaroMiniPlugin {
	constructor (options: ITaroMiniPluginOptions) {
		this.options = {};
	}
	// 插件入口
	apply (compiler) {
	}
}
```

```ts
// webpack.config.js
export default {
  entry: {},
  output: {},
  plugins: [
    new TaroMiniPlugin({
      // 配置项
	}),
  ],
};
```

![taro-webpack](./images/taro-webpack.png)

## 插件入口 apply 函数

```ts
export default class TaroMiniPlugin {
	// 插件入口
	apply (compiler: Compiler) {
    this.context = compiler.context
    this.appEntry = this.getAppEntry(compiler)

    const {
      commonChunks,
      combination,
      framework,
      isBuildPlugin,
      newBlended,
    } = this.options

    const {
      addChunkPages,
      onCompilerMake,
      modifyBuildAssets,
      onParseCreateElement,
    } = combination.config

    /** build mode */
    compiler.hooks.run.tapAsync()

    /** watch mode */
    compiler.hooks.watchRun.tapAsync()

    /** compilation.addEntry */
    compiler.hooks.make.tapAsync()

    compiler.hooks.compilation.tap()

    compiler.hooks.afterEmit.tapAsync()

    new TaroNormalModulesPlugin(onParseCreateElement).apply(compiler)

    newBlended && this.addLoadChunksPlugin(compiler)
  }
}
```

## compiler.hooks.run.tapAsync

```ts
/** build mode */
compiler.hooks.run.tapAsync(
	PLUGIN_NAME,
	this.tryAsync<Compiler>(async compiler => {
		await this.run(compiler)
		new TaroLoadChunksPlugin({
			commonChunks: commonChunks,
			isBuildPlugin,
			addChunkPages,
			pages: this.pages,
			framework: framework
		}).apply(compiler)
	})
)
```

### run

```ts
/**
 * 分析 app 入口文件，搜集页面、组件信息，
 * 往 this.dependencies 中添加资源模块
 */
async run (compiler: Compiler) {
	if (this.options.isBuildPlugin) {
		this.getPluginFiles()
		this.getConfigFiles(compiler)
	} else {
		this.appConfig = await this.getAppConfig()
		this.getPages()
		this.getPagesConfig()
		this.getDarkMode()
		this.getConfigFiles(compiler)
		this.addEntries()
	}
}
```
