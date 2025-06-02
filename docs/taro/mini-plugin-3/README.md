---
highlight: darcula
theme: smartblue
---

# Taro 源码揭秘：12. Taro 如何编译成小程序文件的

## 1. 前言

大家好，我是[若川](https://ruochuan12.github.io)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。从 2021 年 8 月起，我持续组织了好几年的[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

截至目前（`2025-04-16`），目前最新是 [`4.0.12`](https://github.com/NervJS/taro/releases/tag/v4.0.12)，官方`4.0`正式版本的介绍文章暂未发布。官方之前发过[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。

计划写一个 Taro 源码揭秘系列，博客地址：[https://ruochuan12.github.io/taro](https://ruochuan12.github.io/taro) 可以加入书签，持续关注[若川](https://juejin.cn/user/1415826704971918)。
>时隔3个月才继续写第 11 篇，我会继续持续写下去，争取做全网最新最全的 Taro 源码系列。

-   [x] [1. 揭开整个架构的入口 CLI => taro init 初始化项目的秘密](https://juejin.cn/post/7378363694939783178)
-   [x] [2. 揭开整个架构的插件系统的秘密](https://juejin.cn/post/7380195796208205824)
-   [x] [3. 每次创建新的 taro 项目（taro init）的背后原理是什么](https://juejin.cn/post/7390335741586931738)
-   [x] [4. 每次 npm run dev:weapp 开发小程序，build 编译打包是如何实现的？](https://juejin.cn/post/7403193330271682612)
-   [x] [5. 高手都在用的发布订阅机制 Events 在 Taro 中是如何实现的？](https://juejin.cn/post/7403915119448915977)
-   [x] [6. 为什么通过 Taro.xxx 能调用各个小程序平台的 API，如何设计实现的?](https://juejin.cn/post/7407648740926291968)
-   [x] [7. Taro.request 和请求响应拦截器是如何实现的](https://juejin.cn/post/7415911762128797696)
-   [x] [8. Taro 是如何使用 webpack 打包构建小程序的？](https://juejin.cn/post/7434175547784020031)
-   [x] [9. Taro 是如何生成 webpack 配置进行构建小程序的？](https://juejin.cn/post/7439743635161710604)
-   [x] [10. Taro 到底是怎样转换成小程序文件的？](https://juejin.cn/post/7452329275561279529)
-   [ ] 等等

前面 4 篇文章都是讲述编译相关的，CLI、插件机制、初始化项目、编译构建流程。

第 5-7 篇讲述的是运行时相关的 Events、API、request 等。

第 10 篇接着继续追随第 4 篇和第 8、9 篇的脚步，分析 TaroMiniPlugin webpack 的插件实现（全流程讲述）。

第 11 篇，我们继续分析 TaroMiniPlugin webpack 的插件实现。分析 Taro 是如何解析入口文件和页面的？

关于克隆项目、环境准备、如何调试代码等，参考[第 1 篇文章-准备工作、调试](https://juejin.cn/post/7378363694939783178#heading-1)和[第 4 篇 npm run dev:weapp（本文以这篇文章中的调试为例）](https://juejin.cn/post/7403193330271682612#heading-2)。后续文章基本不再过多赘述。

学完本文，你将学到：

```bash
1. Taro 是如何解析入口文件和页面的？
等等
```

```ts
// packages/taro-webpack5-runner/src/plugins/MiniPlugin.ts
compilation.hooks.processAssets.tapAsync(
  {
    name: PLUGIN_NAME,
    stage: PROCESS_ASSETS_STAGE_ADDITIONAL
  },
  this.tryAsync<any>(async () => {
    // 如果是子编译器，证明是编译独立分包，进行单独的处理
    if ((compilation as any).__tag === CHILD_COMPILER_TAG) {
      await this.generateIndependentMiniFiles(compilation, compiler)
    } else {
      await this.generateMiniFiles(compilation, compiler)
    }
  })
)
```

```ts
// packages/taro-webpack5-runner/src/plugins/MiniPlugin.ts
/** 生成小程序相关文件 */
async generateMiniFiles (compilation: Compilation, compiler: Compiler) {
//  compilation.assets[xxx] = xxx;
}
```

这个函数特别长，简单来说就是以下这几项

- 生成 XS 文件 generateXSFile
- 生成配置文件 generateConfigFile
- 生成模板文件 generateTemplateFile

最终通过 `compilation.assets[xxx] = xxx;` 赋值语句生成文件。

我们来看下具体实现。

## generateMiniFiles 生成小程序文件

是 TaroMiniPlugin 类中用于生成小程序相关产物（如模板、配置、样式、资源等）的核心方法。它的主要职责是根据收集到的页面、组件、配置等信息，生成最终小程序所需的各种文件，并写入到 webpack 的 compilation.assets 中。其主要流程如下：

```ts
// packages/taro-webpack5-runner/src/plugins/MiniPlugin.ts

```

处理样式文件名重复问题
首先遍历所有产物，如果发现样式文件名重复（如 .wxss.wxss），则去重，保证产物中只有一个正确的样式文件名。

自定义配置处理
如果配置中定义了 modifyMiniConfigs 钩子，则调用该钩子允许用户自定义修改所有页面、组件的配置内容。

生成 app 配置文件
在非 blended 模式且不是插件构建时，生成主包的 app 配置文件（如 app.json），内容来自 this.filesConfig。

生成基础组件模板和配置
如果当前模板不支持递归（如微信、QQ 小程序），则生成基础组件（comp）和自定义包装器（custom-wrapper）的模板和配置文件。

生成全局模板和自定义包装器模板
生成全局的 base 模板和 custom-wrapper 模板（如 base.wxml、custom-wrapper.wxml），并根据配置决定是否压缩 XML。

生成全局 XS 脚本
如果平台支持 XS 脚本，则生成 utils 脚本文件。

生成所有组件的配置和模板
遍历所有组件，为每个组件生成配置文件和模板文件（非原生组件才生成模板）。

生成所有页面的配置和模板
遍历所有页面，为每个页面生成配置文件和模板文件（非原生页面才生成模板），并处理分包页面的过滤。

生成 tabbar 图标资源
调用 generateTabBarFiles 方法，将 tabbar 所需的图片资源写入产物。

注入公共样式
调用 injectCommonStyles 方法，将公共样式自动引入到 app 和各页面样式文件中。

生成暗黑模式主题文件
如果配置了暗黑模式主题，则输出对应的主题文件。

插件模式下生成 plugin.json
如果是插件构建，自动生成并写入 plugin.json 文件。

## 总结

`generateMiniFiles` 负责将 Taro 编译期收集到的所有页面、组件、配置、资源等，最终生成小程序平台所需的所有产物文件，并写入 webpack 的产物集合。它是 Taro 小程序端产物生成的关键环节，确保了最终产物的完整性和平台兼容性。

启发：Taro 是非常知名的跨端框架，我们在使用它，享受它带来便利的同时，有余力也可以多为其做出一些贡献。比如帮忙解答一些 issue 或者提 pr 修改 bug 等。
在这个过程，我们会不断学习，促使我们去解决问题，带来的好处则是不断拓展知识深度和知识广度。
有些时候还是需要深入学习源码，理解源码才能更好的针对项目做相应的优化。

---

**如果看完有收获，欢迎点赞、评论、分享、收藏支持。你的支持和肯定，是我写作的动力。也欢迎提建议和交流讨论**。

作者：常以**若川**为名混迹于江湖。所知甚少，唯善学。[若川的博客](https://ruochuan12.github.io)，[github blog](https://github.com/ruochuan12/blog)，可以点个 `star` 鼓励下持续创作。

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。从 2021 年 8 月起，我持续组织了好几年的[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。
