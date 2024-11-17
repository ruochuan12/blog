---
highlight: darcula
theme: smartblue
---

# Taro 源码揭秘：9. Taro 是如何使用 webpack 打包构建小程序的？

## 1. 前言

大家好，我是[若川](https://ruochuan12.github.io)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

截至目前（`2024-11-07`），目前最新是 [`4.0.7`](https://github.com/NervJS/taro/releases/tag/v4.0.7)，官方`4.0`正式版本的介绍文章暂未发布。官方之前发过[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。

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
第 8 篇接着继续追随第4篇 npm run dev:weapp 的脚步，继续分析 `@tarojs/webpack5-runner`，Taro 是如何使用 webpack 打包构建小程序的？

关于克隆项目、环境准备、如何调试代码等，参考[第一篇文章-准备工作、调试](https://juejin.cn/post/7378363694939783178#heading-1)。后续文章基本不再过多赘述。

学完本文，你将学到：

```bash
1.
等等
```

## 2. webpack 打包构建

[4. 每次 npm run dev:weapp 开发小程序，build 编译打包是如何实现的？](https://juejin.cn/post/7403193330271682612)

在第4篇文章末尾，我们可以回顾下，如何获取 `webpack` 配置和 执行 `webpack()` 构建的。

## @tarojs/webpack5-runner

暴露给 `@tarojs/cli` 的小程序/H5 Webpack 启动器。

这个 `npm` 包，主要要解决的问题是。把 `taro` 项目用 `webpack` 编译到小程序、h5、鸿蒙。

`package.json` 入口文件 `"main": "index.js"` 入口文件 `index.js`

```js
if (process.env.TARO_PLATFORM === 'web') {
  module.exports = require('./dist/index.h5.js').default
} else if (process.env.TARO_PLATFORM === 'harmony' || process.env.TARO_ENV === 'harmony') {
  module.exports = require('./dist/index.harmony.js').default
} else {
  module.exports = require('./dist/index.mini.js').default
}

module.exports.default = module.exports
```

- Combination
 - MiniCombination
 - H5Combination
 - HarmonyCombination
- BaseConfig
 - MiniBaseConfig
 - H5BaseConfig
 - HarmonyBaseConfig
- webpackPlugin
 - MiniWebpackPlugin
 - H5WebpackPlugin
 - HarmonyWebpackPlugin
- WebpackModule
 - MiniWebpackModule
 - H5WebpackModule
 - HarmonyWebpackModule

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

## Combination

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
  enableSourceMap: boolean
  sourceRoot: string
  outputRoot: string
  sourceDir: string
  outputDir: string
  rawConfig: T

  prebundleOptions?: IPrebundle

  isWeb = isWebPlatform()

  /** special mode */
  // 将组件打包为原生模块
  isBuildNativeComp = false
  // 正常打包页面的同时，把组件也打包成独立的原生模块
  newBlended = false

  constructor (appPath: string, config: T) {
    this.appPath = appPath
    this.rawConfig = config
    this.sourceRoot = config.sourceRoot || 'src'
    this.outputRoot = config.outputRoot || 'dist'
    this.sourceDir = path.resolve(appPath, this.sourceRoot)
    this.outputDir = path.resolve(appPath, this.outputRoot)
    this.isBuildNativeComp = !!config.isBuildNativeComp
    this.newBlended = !!config.newBlended
    this.enableSourceMap = config.enableSourceMap ?? config.isWatch ?? process.env.NODE_ENV !== 'production'
  }

  async make () {
    await this.pre(this.rawConfig)
    this.process(this.config)
    await this.post(this.config, this.chain)
  }

  process (_config: Partial<T>) {}

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
}
```

## MiniCombination

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

  getEntry (entry: IMiniBuildConfig['entry']) {
    return this.isBuildPlugin ? this.buildNativePlugin.entry : entry
  }

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

  getAlias () {
    const { alias = {}, taroComponentsPath } = this.config
    return {
      ...alias,
      [`${taroJsComponents}$`]: taroComponentsPath
    }
  }

  getOptimization () {
    return {
      usedExports: true,
      runtimeChunk: {
        name: 'runtime'
      },
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          default: false,
          defaultVendors: false,
          common: {
            name: 'common',
            minChunks: 2,
            priority: 1
          },
          vendors: {
            name: 'vendors',
            minChunks: 2,
            test: module => {
              const nodeModulesDirRegx = new RegExp(REG_NODE_MODULES_DIR)
              return nodeModulesDirRegx.test(module.resource)
            },
            priority: 10
          },
          taro: {
            name: 'taro',
            test: module => REG_TARO_SCOPED_PACKAGE.test(module.context),
            priority: 100
          }
        }
      }
    }
  }
}
```

```ts
export class MiniBaseConfig extends BaseConfig {
  defaultTerserOptions = {
	// 省略
  }

  constructor(appPath: string, config: Partial<IMiniBuildConfig>) {
    super(appPath, config)
  }
}
```

## BaseConfig

```ts
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
      resolveLoader: {
        modules: ['node_modules']
      },
      output: {
        chunkLoadingGlobal: 'webpackJsonp'
      },
      plugin: {
        webpackbar: WebpackPlugin.getWebpackBarPlugin({
          reporters: [
            'basic',
            'fancy',
            {
              done (_context, { stats }: { stats: Stats }) {
                const { warnings, errors } = formatMessages(stats)

                if (stats.hasWarnings()) {
                  console.log(chalk.bgKeyword('orange')('⚠️ Warnings: \n'))
                  warnings.forEach(w => console.log(w + '\n'))
                }

                if (stats.hasErrors()) {
                  console.log(chalk.bgRed('✖ Errors: \n'))
                  errors.forEach(e => console.log(e + '\n'))
                  !config.isWatch && process.exit(1)
                }

                if (config.isWatch) {
                  console.log(chalk.gray(`→ Watching... [${new Date().toLocaleString()}]\n`))
                }

                if (config.logger?.stats === true && config.mode === 'production') {
                  console.log(chalk.bgBlue('ℹ Stats: \n'))
                  console.log(stats.toString({
                    colors: true,
                    modules: false,
                    children: false,
                    chunks: false,
                    chunkModules: false
                  }))
                }
              }
            }
          ],
          basic: config.logger?.quiet === true,
          fancy: config.logger?.quiet !== true,
        })
      },
      watchOptions: {
        aggregateTimeout: 200
      }
    })

    // 持久化缓存
	// 省略代码
  }

  get chain () {
    return this._chain
  }
}
```

## MiniBaseConfig

```ts
export class MiniBaseConfig extends BaseConfig {
  defaultTerserOptions = {
    parse: {
      ecma: 8,
    },
    compress: {
      ecma: 5,
      warnings: false,
      arrows: false,
      collapse_vars: false,
      comparisons: false,
      computed_props: false,
      hoist_funs: false,
      hoist_props: false,
      hoist_vars: false,
      inline: false,
      loops: false,
      negate_iife: false,
      properties: false,
      reduce_funcs: false,
      reduce_vars: false,
      switches: false,
      toplevel: false,
      typeofs: false,
      booleans: true,
      if_return: true,
      sequences: true,
      unused: true,
      conditionals: true,
      dead_code: true,
      evaluate: true,
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
      optimization: {
        sideEffects: true,
      },
      performance: {
        maxEntrypointSize: 2 * 1000 * 1000,
      },
    })

    this.setMinimizer(config, this.defaultTerserOptions)
  }
}

```

## WebpackPlugin 提供应用所需插件

```ts
import path from 'node:path'

import { REG_STYLE } from '@tarojs/helper'
import webpack from 'webpack'

import { TaroWebpackBarPlugin } from '../plugins/WebpackBarPlugin'

import type { ICopyOptions } from '@tarojs/taro/types/compile'

export type PluginArgs = Record<string, any>[]

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
    const globalIgnores: string[] = copy.options?.ignore ?? []
    const patterns = copy.patterns.map(({ from, to, ignore = [], ...extra }) => {
      return {
        from,
        to: path.resolve(appPath, to),
        context: appPath,
        globOptions: {
          ignore: ignore.concat(globalIgnores)
        },
        ...extra
      }
    })
    const args = { patterns }
    return WebpackPlugin.getPlugin(CopyWebpackPlugin, [args])
  }

  static getProviderPlugin (args: Record<string, string | string[]>) {
    return WebpackPlugin.getPlugin(webpack.ProvidePlugin, [args])
  }

  static getDefinePlugin (definitionsList: Record<string, string>[]) {
    const definitions = Object.assign({}, ...definitionsList)
    return WebpackPlugin.getPlugin(webpack.DefinePlugin, [definitions])
  }

  static getMiniCssExtractPlugin (args: Record<string, any>) {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin')
    return WebpackPlugin.getPlugin(MiniCssExtractPlugin, [args])
  }

  static getTerserPlugin (terserOptions) {
    const TerserPlugin = require('terser-webpack-plugin')
    return WebpackPlugin.getPlugin(TerserPlugin, [{
      parallel: true,
      terserOptions
    }])
  }

  static getESBuildMinifyPlugin (esbuildMinifyOptions) {
    const ESBuildMinifyPlugin = require('esbuild-loader').EsbuildPlugin
    return WebpackPlugin.getPlugin(ESBuildMinifyPlugin, [esbuildMinifyOptions])
  }

  static getCssMinimizerPlugin (minimizer: 'esbuild' | 'lightningcss' | 'csso', minimizerOptions: Record<string, any>) {
    const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
    let minify = CssMinimizerPlugin.cssnanoMinify
    if (minimizer === 'esbuild') {
      minify = CssMinimizerPlugin.esbuildMinify
    } else if (minimizer === 'lightningcss') {
      minify = CssMinimizerPlugin.lightningCssMinify
    }
    const options = {
      test: REG_STYLE,
      parallel: true,
      minify,
      minimizerOptions: {
        preset: [
          'default',
          minimizerOptions
        ]
      }
    }
    return WebpackPlugin.getPlugin(CssMinimizerPlugin, [options])
  }

  static getWebpackBarPlugin (webpackBarOptions = {}) {
    return WebpackPlugin.getPlugin(TaroWebpackBarPlugin, [webpackBarOptions])
  }
}

```

## MiniWebpackPlugin 提供小程序应用所需插件

```ts
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

    const copyWebpackPlugin = this.getCopyWebpackPlugin()
    if (copyWebpackPlugin) plugins.copyWebpackPlugin = copyWebpackPlugin

    if (!this.combination.isBuildPlugin) {
      /** 需要在 MiniPlugin 前，否则无法获取 entry 地址 */
      const miniSplitChunksPlugin = this.getMiniSplitChunksPlugin()
      if (miniSplitChunksPlugin) plugins.miniSplitChunksPlugin = miniSplitChunksPlugin
    }

    const definePluginOptions = plugins.definePlugin.args[0]
    const mainPlugin = this.getMainPlugin(definePluginOptions)
    plugins.miniPlugin = mainPlugin

    if (this.combination.config.experimental?.compileMode === true) {
      plugins.taroCompileModePlugin = WebpackPlugin.getPlugin(MiniCompileModePlugin, [{
        combination: this.combination,
      }])
    }

    return plugins
  }

  getProviderPlugin () {
    return WebpackPlugin.getProviderPlugin({
      window: ['@tarojs/runtime', 'window'],
      document: ['@tarojs/runtime', 'document'],
      navigator: ['@tarojs/runtime', 'navigator'],
      requestAnimationFrame: ['@tarojs/runtime', 'requestAnimationFrame'],
      cancelAnimationFrame: ['@tarojs/runtime', 'cancelAnimationFrame'],
      Element: ['@tarojs/runtime', 'TaroElement'],
      SVGElement: ['@tarojs/runtime', 'SVGElement'],
      MutationObserver: ['@tarojs/runtime', 'MutationObserver'],
      history: ['@tarojs/runtime', 'history'],
      location: ['@tarojs/runtime', 'location'],
      URLSearchParams: ['@tarojs/runtime', 'URLSearchParams'],
      URL: ['@tarojs/runtime', 'URL'],
    })
  }

  getDefinePlugin () {
    const {
      env = {},
      runtime = {} as Record<string, boolean>,
      defineConstants = {},
      framework = 'react',
      buildAdapter = PLATFORMS.WEAPP
    } = this.combination.config

    env.FRAMEWORK = JSON.stringify(framework)
    env.TARO_ENV = JSON.stringify(buildAdapter)
    env.TARO_PLATFORM = JSON.stringify(process.env.TARO_PLATFORM || PLATFORM_TYPE.MINI)
    env.SUPPORT_TARO_POLYFILL = env.SUPPORT_TARO_POLYFILL || '"disabled"'
    const envConstants = Object.keys(env).reduce((target, key) => {
      target[`process.env.${key}`] = env[key]
      return target
    }, {})

    const runtimeConstants = {
      ENABLE_INNER_HTML: runtime.enableInnerHTML ?? true,
      ENABLE_ADJACENT_HTML: runtime.enableAdjacentHTML ?? false,
      ENABLE_SIZE_APIS: runtime.enableSizeAPIs ?? false,
      ENABLE_TEMPLATE_CONTENT: runtime.enableTemplateContent ?? false,
      ENABLE_CLONE_NODE: runtime.enableCloneNode ?? false,
      ENABLE_CONTAINS: runtime.enableContains ?? false,
      ENABLE_MUTATION_OBSERVER: runtime.enableMutationObserver ?? false
    }

    return WebpackPlugin.getDefinePlugin([envConstants, defineConstants, runtimeConstants])
  }

  getCopyWebpackPlugin () {
    const combination = this.combination
    const { appPath, config } = combination
    const { copy } = config
    let copyWebpackPlugin

    if (copy?.patterns.length) {
      copyWebpackPlugin = WebpackPlugin.getCopyWebpackPlugin(appPath, copy)
    }

    return copyWebpackPlugin
  }

  getMiniCssExtractPlugin () {
    const { fileType } = this.combination
    const { miniCssExtractPluginOption = {} } = this.combination.config
    const args = Object.assign({
      filename: `[name]${fileType.style}`,
      chunkFilename: `[name]${fileType.style}`
    }, miniCssExtractPluginOption)
    return WebpackPlugin.getMiniCssExtractPlugin(args)
  }

  getMiniSplitChunksPlugin () {
    const { fileType } = this.combination
    const { optimizeMainPackage } = this.combination
    let miniSplitChunksPlugin

    if (optimizeMainPackage?.enable) {
      miniSplitChunksPlugin = WebpackPlugin.getPlugin(MiniSplitChunksPlugin, [{
        exclude: optimizeMainPackage.exclude,
        fileType,
        combination: this.combination
      }])
    }

    return miniSplitChunksPlugin
  }

  getMainPlugin (definePluginOptions) {
    const { combination } = this

    const options = {
      commonChunks: this.getCommonChunks(),
      constantsReplaceList: definePluginOptions,
      pxTransformConfig: this.pxtransformOption?.config || {},
      hot: false,
      combination,
    }

    const plugin = combination.isBuildNativeComp ? BuildNativePlugin : MiniPlugin
    return WebpackPlugin.getPlugin(plugin, [options])
  }

  getCommonChunks () {
    const { buildNativePlugin, config } = this.combination
    const { commonChunks } = config
    const defaultCommonChunks = buildNativePlugin?.commonChunks || ['runtime', 'vendors', 'taro', 'common']
    let customCommonChunks: string[] = defaultCommonChunks
    if (isFunction(commonChunks)) {
      customCommonChunks = commonChunks(defaultCommonChunks.concat()) || defaultCommonChunks
    } else if (isArray(commonChunks) && commonChunks.length) {
      customCommonChunks = commonChunks
    }
    return customCommonChunks
  }
}

```

## WebpackModule 处理不同模块加载规则

```ts
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

  static getCSSLoaderWithModule (cssModuleOptions: CssModuleOptionConfig, cssLoaderOption) {
    const { namingPattern, generateScopedName } = cssModuleOptions
    const defaultOptions = Object.assign(
      {
        importLoaders: 1,
        modules: {
          mode: namingPattern === 'module' ? 'local' : 'global',
          namedExport: false,
          exportLocalsConvention: 'as-is',
        }
      },
      {
        modules: isFunction(generateScopedName)
          ? { getLocalIdent: (context, _, localName) => generateScopedName(localName, context.resourcePath) }
          : { localIdentName: generateScopedName }
      }
    )

    // 更改 namedExport 默认值，以统一旧版本行为
    // https://github.com/webpack-contrib/css-loader/releases/tag/v7.0.0
    defaultOptions.modules.namedExport = false
    defaultOptions.modules.exportLocalsConvention = 'as-is'

    const options = recursiveMerge({}, defaultOptions, cssLoaderOption)
    return WebpackModule.getLoader('css-loader', options)
  }

  static getExtractCSSLoader () {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin')
    return {
      loader: MiniCssExtractPlugin.loader
    }
  }

  static getStyleLoader (options) {
    return WebpackModule.getLoader('style-loader', options)
  }

  static getPostCSSLoader (options) {
    return WebpackModule.getLoader('postcss-loader', options)
  }

  static getBaseSassOptions () {
    return {
      sourceMap: true,
      implementation: require('sass'),
      sassOptions: {
        outputStyle: 'expanded',
        // https://github.com/sass/dart-sass/blob/main/CHANGELOG.md#js-api
        silenceDeprecations: ['legacy-js-api'],
        importer (url, prev, done) {
          // 让 sass 文件里的 @import 能解析小程序原生样式文体，如 @import "a.wxss";
          const extname = path.extname(url)
          // fix: @import 文件可以不带scss/sass缀，如: @import "define";
          if (extname === '.scss' || extname === '.sass' || extname === '.css' || !extname) {
            return null
          } else {
            const filePath = path.resolve(path.dirname(prev), url)
            fs.access(filePath, fs.constants.F_OK, (err) => {
              if (err) {
                console.log(err)
                return null
              } else {
                fs.readFile(filePath)
                  .then(res => {
                    done({ contents: res.toString() })
                  })
                  .catch(err => {
                    console.log(err)
                    return null
                  })
              }
            })
          }
        }
      }
    }
  }

  static getSassLoader (sassLoaderOption) {
    const options = recursiveMerge<any>({}, WebpackModule.getBaseSassOptions(), {
      sassOptions: {
        indentedSyntax: true
      }
    }, sassLoaderOption)
    return WebpackModule.getLoader('sass-loader', options)
  }

  static getScssLoader (sassLoaderOption) {
    const options = recursiveMerge({}, WebpackModule.getBaseSassOptions(), sassLoaderOption)
    return WebpackModule.getLoader('sass-loader', options)
  }

  static getLessLoader (options) {
    return WebpackModule.getLoader('less-loader', options)
  }

  static getStylusLoader (options) {
    return WebpackModule.getLoader('stylus-loader', options)
  }

  static getResolveUrlLoader (options = {}) {
    return WebpackModule.getLoader('resolve-url-loader', options)
  }

  static getScriptRule () {
    return {
      test: REG_SCRIPTS,
      use: {
        babelLoader: WebpackModule.getLoader('babel-loader', {
          compact: false
        })
      }
    }
  }

  static getMediaRule (sourceRoot: string, options) {
    const maxSize = getAssetsMaxSize(options, MEDIA_LIMIT)
    return {
      test: REG_MEDIA,
      type: 'asset',
      parser: {
        dataUrlCondition: {
          maxSize,
        }
      },
      generator: {
        emit: options.emitFile || options.emit,
        outputPath: options.outputPath,
        publicPath: options.publicPath,
        filename ({ filename }) {
          if (isFunction(options.name)) return options.name(filename)
          return options.name || filename.replace(sourceRoot + '/', '')
        }
      }
    }
  }

  static getFontRule (sourceRoot: string, options) {
    const maxSize = getAssetsMaxSize(options, FONT_LIMIT)
    return {
      test: REG_FONT,
      type: 'asset',
      parser: {
        dataUrlCondition: {
          maxSize,
        }
      },
      generator: {
        emit: options.emitFile || options.emit,
        outputPath: options.outputPath,
        publicPath: options.publicPath,
        filename ({ filename }) {
          if (isFunction(options.name)) return options.name(filename)
          return options.name || filename.replace(sourceRoot + '/', '')
        }
      }
    }
  }

  static getImageRule (sourceRoot: string, options) {
    const maxSize = getAssetsMaxSize(options, IMAGE_LIMIT)
    return {
      test: REG_IMAGE,
      type: 'asset',
      parser: {
        dataUrlCondition: {
          maxSize,
        }
      },
      generator: {
        emit: options.emitFile || options.emit,
        outputPath: options.outputPath,
        publicPath: options.publicPath,
        filename ({ filename }) {
          if (isFunction(options.name)) return options.name(filename)
          return options.name || filename.replace(sourceRoot + '/', '')
        }
      }
    }
  }
}
```

## MiniWebpackModule 处理小程序模块加载规则

```ts
export class MiniWebpackModule {
  combination: MiniCombination
  __postcssOption: [string, any, Func?][]

  constructor (combination: MiniCombination) {
    this.combination = combination
  }

  getModules () {
    const { appPath, config, sourceRoot, fileType } = this.combination
    const {
      buildAdapter,
      sassLoaderOption,
      lessLoaderOption,
      stylusLoaderOption,
      designWidth,
      deviceRatio
    } = config

    const { postcssOption, cssModuleOption } = this.parsePostCSSOptions()

    this.__postcssOption = getDefaultPostcssConfig({
      designWidth,
      deviceRatio,
      postcssOption,
      alias: config.alias,
    })

    const postcssPlugins = getPostcssPlugins(appPath, this.__postcssOption)

    const cssLoaders = this.getCSSLoaders(postcssPlugins, cssModuleOption)
    const resolveUrlLoader = WebpackModule.getResolveUrlLoader()
    const sassLoader = WebpackModule.getSassLoader(sassLoaderOption)
    const scssLoader = WebpackModule.getScssLoader(sassLoaderOption)
    const lessLoader = WebpackModule.getLessLoader(lessLoaderOption)
    const stylusLoader = WebpackModule.getStylusLoader(stylusLoaderOption)

    const rule: Record<string, IRule> = {
      sass: {
        test: REG_SASS_SASS,
        oneOf: this.addCSSLoader(cssLoaders, resolveUrlLoader, sassLoader)
      },
      scss: {
        test: REG_SASS_SCSS,
        oneOf: this.addCSSLoader(cssLoaders, resolveUrlLoader, scssLoader)
      },
      less: {
        test: REG_LESS,
        oneOf: this.addCSSLoader(cssLoaders, lessLoader)
      },
      stylus: {
        test: REG_STYLUS,
        oneOf: this.addCSSLoader(cssLoaders, stylusLoader)
      },
      normalCss: {
        test: REG_CSS,
        oneOf: cssLoaders
      },

      script: this.getScriptRule(),

      template: {
        test: REG_TEMPLATE,
        type: 'asset/resource',
        generator: {
          filename ({ filename }) {
            const extname = path.extname(filename)
            const nodeModulesRegx = new RegExp(REG_NODE_MODULES, 'gi')

            return filename
              .replace(sourceRoot + '/', '')
              .replace(extname, fileType.templ)
              .replace(nodeModulesRegx, 'npm')
          }
        },
        use: [WebpackModule.getLoader(path.resolve(__dirname, '../loaders/miniTemplateLoader'), {
          buildAdapter
        })]
      },

      xscript: {
        test: new RegExp(`\\${this.combination.fileType.xs || 'wxs'}$`),
        type: 'asset/resource',
        generator: {
          filename ({ filename }) {
            const nodeModulesRegx = new RegExp(REG_NODE_MODULES, 'gi')

            return filename
              .replace(sourceRoot + '/', '')
              .replace(nodeModulesRegx, 'npm')
          }
        },
        use: [WebpackModule.getLoader(path.resolve(__dirname, '../loaders/miniXScriptLoader'))]
      },

      media: this.getMediaRule(),

      font: this.getFontRule(),

      image: this.getImageRule()
    }
    return { rule }
  }

  addCSSLoader (cssLoaders, ...loader) {
    const cssLoadersCopy = cloneDeep(cssLoaders)
    cssLoadersCopy.forEach(item => {
      if (item.use) {
        item.use = [...item.use, ...loader]
      }
    })
    return cssLoadersCopy
  }

  getCSSLoaders (postcssPlugins: any[], cssModuleOption: PostcssOption.cssModules) {
    const { config } = this.combination
    const {
      cssLoaderOption
    } = config
    const extractCSSLoader = WebpackModule.getExtractCSSLoader()
    const cssLoader = WebpackModule.getCSSLoader(cssLoaderOption)
    const postCSSLoader = WebpackModule.getPostCSSLoader({
      postcssOptions: {
        plugins: postcssPlugins
      }
    })

    const cssLoaders: CSSLoaders = [{
      use: [
        extractCSSLoader,
        cssLoader,
        postCSSLoader
      ]
    }]

    if (cssModuleOption.enable) {
      const cssModuleOptionConfig: CssModuleOptionConfig = recursiveMerge({}, {
        namingPattern: 'module',
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      }, cssModuleOption.config)
      const cssLoaderWithModule = WebpackModule.getCSSLoaderWithModule(cssModuleOptionConfig, cssLoaderOption)
      const styleModuleReg = /(.*\.module).*\.(css|s[ac]ss|less|styl)\b/
      const styleGlobalReg = /(.*\.global).*\.(css|s[ac]ss|less|styl)\b/
      let cssModuleCondition

      if (cssModuleOptionConfig.namingPattern === 'module') {
        /* 不排除 node_modules 内的样式 */
        cssModuleCondition = styleModuleReg
        // for vue
        cssLoaders.unshift({
          resourceQuery: /module=/,
          use: [
            extractCSSLoader,
            cssLoaderWithModule,
            postCSSLoader
          ]
        })
      } else {
        cssModuleCondition = {
          and: [
            { not: styleGlobalReg },
            { not: isNodeModule }
          ]
        }
      }
      cssLoaders.unshift({
        include: [cssModuleCondition],
        use: [
          extractCSSLoader,
          cssLoaderWithModule,
          postCSSLoader
        ]
      })
    }

    return cssLoaders
  }

  getScriptRule () {
    const { sourceDir, config } = this.combination
    const { compile = {} } = this.combination.config
    const rule: IRule = WebpackModule.getScriptRule()

    rule.include = [
      sourceDir,
      filename => /(?<=node_modules[\\/]).*taro/.test(filename)
    ]
    if (Array.isArray(compile.include)) {
      rule.include.unshift(...compile.include)
    }

    if (Array.isArray(compile.exclude)) {
      rule.exclude = [...compile.exclude]
    }

    if (config.experimental?.compileMode === true) {
      rule.use.compilerLoader = WebpackModule.getLoader(path.resolve(__dirname, '../loaders/miniCompilerLoader'), {
        platform: config.platform.toUpperCase(),
        template: config.template,
        FILE_COUNTER_MAP,
      })
    }

    return rule
  }

  parsePostCSSOptions () {
    const { postcss: postcssOption = {} } = this.combination.config
    const defaultCssModuleOption: PostcssOption.cssModules = {
      enable: false,
      config: {
        namingPattern: 'global',
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      }
    }

    const cssModuleOption: PostcssOption.cssModules = recursiveMerge({}, defaultCssModuleOption, postcssOption.cssModules)

    return {
      postcssOption,
      cssModuleOption
    }
  }

  getMediaRule () {
    const sourceRoot = this.combination.sourceRoot
    const { mediaUrlLoaderOption = {} } = this.combination.config
    return WebpackModule.getMediaRule(sourceRoot, mediaUrlLoaderOption)
  }

  getFontRule () {
    const sourceRoot = this.combination.sourceRoot
    const { fontUrlLoaderOption = {} } = this.combination.config
    return WebpackModule.getFontRule(sourceRoot, fontUrlLoaderOption)
  }

  getImageRule () {
    const sourceRoot = this.combination.sourceRoot
    const { imageUrlLoaderOption = {} } = this.combination.config
    return WebpackModule.getImageRule(sourceRoot, imageUrlLoaderOption)
  }
}
```

## link

[多编译内核生态下的极速研发体验](https://taro-docs.jd.com/blog/2023/03/29/D2_17)

[支持使用 Webpack5 编译小程序和 H5 应用](https://github.com/NervJS/taro/discussions/11533)
