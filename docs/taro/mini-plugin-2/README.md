---
highlight: darcula
theme: smartblue
---

# Taro 源码揭秘：11. Taro 是如何解析入口文件和页面的？

## 1. 前言

大家好，我是[若川](https://ruochuan12.github.io)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

截至目前（`2025-04-15`），目前最新是 [`4.0.10`](https://github.com/NervJS/taro/releases/tag/v4.0.10)，官方`4.0`正式版本的介绍文章暂未发布。官方之前发过[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。

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
-   [x] [10. Taro 到底是怎样转换成小程序文件的？](https://juejin.cn/post/7452329275561279529)
-   [ ] 等等

前面 4 篇文章都是讲述编译相关的，CLI、插件机制、初始化项目、编译构建流程。
第 5-7 篇讲述的是运行时相关的 Events、API、request 等。
第 10 篇接着继续追随第 4 篇和第 8、9 篇的脚步，分析 TaroMiniPlugin webpack 的插件实现（全流程概览）。
第 11 篇，我们继续分析 TaroMiniPlugin webpack 的插件实现。分析 Taro 是如何解析入口文件和页面的？

关于克隆项目、环境准备、如何调试代码等，参考[第一篇文章-准备工作、调试](https://juejin.cn/post/7378363694939783178#heading-1)和[第 4 篇 npm run dev:weapp](https://juejin.cn/post/7403193330271682612#heading-2)。后续文章基本不再过多赘述。

学完本文，你将学到：

```bash
1. Taro 是如何解析入口文件和页面的？
2. 如何读取文件
等等
```

![taro-mini-plugin](./images/taro-webpack.png)

我们先来看 TaroMiniPlugin 结构

```ts
export default class TaroMiniPlugin {
	constructor (options: ITaroMiniPluginOptions) {
		// 省略
	}
	/**
	* 插件入口
	*/
	apply (compiler: Compiler) {
		this.context = compiler.context
		//  根据 webpack entry 配置获取入口文件路径
		//  @returns app 入口文件路径
		this.appEntry = this.getAppEntry(compiler)
		// 省略代码
		/** build mode */
		compiler.hooks.run.tapAsync(
			PLUGIN_NAME,
			this.tryAsync<Compiler>(async compiler => {
				await this.run(compiler)
				// 省略
			})
		)
	}
}
```

插件入口 apply 方法，获取到 `this.appEntry` `src/app.[js|jsx|ts|tsx]`，调用 `run` 方法。

这里的 `this.appEntry` 是 `"/Users/ruochuan/git-source/github/taro4-debug/src/app.ts"`

本文主要讲述 `run` 方法的具体实现。分析 `app` 入口文件，搜集页面、组件信息，往 `this.dependencies` 中添加资源模块。

```ts
export default class TaroMiniPlugin {
	/**
	 * 分析 app 入口文件，搜集页面、组件信息，
	 * 往 this.dependencies 中添加资源模块
	 */
	async run(compiler: Compiler) {
		if (this.options.isBuildPlugin) {
			this.getPluginFiles();
			this.getConfigFiles(compiler);
		} else {
			this.appConfig = await this.getAppConfig();
			this.getPages();
			this.getPagesConfig();
			this.getDarkMode();
			this.getConfigFiles(compiler);
			this.addEntries();
		}
	}
}
```

- 插件构建模式 ( this.options.isBuildPlugin 为 true 时)：
  - 调用 getPluginFiles() 获取插件文件
  - 调用 getConfigFiles(compiler) 获取配置文件
- 正常构建模式 ：
  - 首先通过 getAppConfig() 获取应用配置
  - 然后依次执行：
    - getPages() 获取页面信息
    - getPagesConfig() 获取页面配置
    - getDarkMode() 获取暗黑模式配置
    - getConfigFiles(compiler) 获取配置文件
    - addEntries() 添加入口文件

```mermaid
graph TD
    A[开始] --> B{是否为插件构建模式?}
    B -- 是 --> C[调用 getPluginFiles]
    C --> D[调用 getConfigFiles]
    B -- 否 --> E[调用 getAppConfig]
    E --> F[调用 getPages]
    F --> G[调用 getPagesConfig]
    G --> H[调用 getDarkMode]
    H --> I[调用 getConfigFiles]
    I --> J[调用 addEntries]
    D --> K[结束]
    J --> K

    subgraph 函数解释
        C["getPluginFiles: 获取插件文件，处理插件相关配置"]
        D["getConfigFiles: 获取配置文件，处理配置相关逻辑"]
        E["getAppConfig: 获取应用全局配置"]
        F["getPages: 根据app配置收集页面信息，处理分包和tabbar"]
        G["getPagesConfig: 读取页面及其依赖组件的配置"]
        H["getDarkMode: 获取暗黑模式相关配置"]
        I["getConfigFiles: 同上"]
        J["addEntries: 添加app、模板组件、页面、组件等资源模块"]
    end
```

## 2. getAppConfig 获取入口配置文件配置

```ts
this.appConfig = await this.getAppConfig();
```

入口文件是 `src/app.[js|jsx|ts|tsx]`。
`getAppConfig` 获取入口文件的配置。

这个函数要做的事情是把配置文件 `src/app.config.ts` 转换成

```ts
// src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/index/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
})
```

最终这样的对象。

```ts
{
  pages: [
    "pages/index/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
}
```

我们来看 `getAppConfig` 的具体实现。

```ts
async getAppConfig (): Promise<AppConfig> {
	// 'app'
    const appName = path.basename(this.appEntry).replace(path.extname(this.appEntry), '')

    this.compileFile({
      name: appName,
      path: this.appEntry,
      isNative: false
    })

    const fileConfig = this.filesConfig[this.getConfigFilePath(appName)]
    const appConfig = fileConfig ? fileConfig.content || {} : {}

    if (isEmptyObject(appConfig)) {
      throw new Error('缺少 app 全局配置文件，请检查！')
    }
    const { modifyAppConfig } = this.options.combination.config
    if (typeof modifyAppConfig === 'function') {
      await modifyAppConfig(appConfig)
    }
    return appConfig as AppConfig
  }
```

其中 `compileFile` 函数的实现。

`modifyAppConfig` 是传入的修改 `app.config.ts` 配置文件的钩子函数。

### 2.1 compileFile 读取页面、组件的配置，并递归读取依赖的组件的配置

```ts
/**
   * 读取页面、组件的配置，并递归读取依赖的组件的配置
   */
  compileFile (file: IComponent, independentPackage?: IndependentPackage) {
    const filePath = file.path
    const fileConfigPath = file.isNative ? this.replaceExt(filePath, '.json') : this.getConfigFilePath(filePath)
    const fileConfig = readConfig(fileConfigPath, this.options.combination.config)
    const { componentGenerics, usingComponents } = fileConfig

    if (this.options.isBuildPlugin && componentGenerics) {
      // 省略...
    }

    // 递归收集依赖的第三方组件
    if (usingComponents) {
      // 省略...
    }

    this.filesConfig[this.getConfigFilePath(file.name)] = {
      content: fileConfig,
      path: fileConfigPath
    }
  }
```

`compileFile` 相对比较复杂，我们省略一些代码。

最终给 `this.filesConfig` 赋值，对象如下图所示：

![filesConfig](./images/filesConfig.png)

包含配置文件的路径和配置的内容。

这个函数中，其中有一个很关键的函数 `readConfig`，我们来看它的具体实现。

### 2.2 readConfig 读取配置

[页面配置](https://docs.taro.zone/docs/page-config)

![page.config](./images/page.config.png)

```ts
// packages/taro-helper/src/utils.ts
export function readConfig<T extends IReadConfigOptions> (configPath: string, options: T = {} as T) {
  let result: any = {}
  if (fs.existsSync(configPath)) {
    if (REG_JSON.test(configPath)) {
      result = fs.readJSONSync(configPath)
    } else {
      result = requireWithEsbuild(configPath, {
		// 省略若干代码
	  })
    }

    result = getModuleDefaultExport(result)
  } else {
    result = readPageConfig(configPath)
  }
  return result
}
```

[仓库里有更多 readConfig 测试用例](https://github.com/NervJS/taro/blob/main/packages/taro-helper/src/__tests__/config.spec.ts)

我们很容易看出，存在配置文件，如果是JSON，则用 `fs.readJSONSync` 读取。

- 支持多种配置文件格式（支持 JSON 和 JS/TS 文件格式）
- 支持路径别名和常量定义
- 使用 esbuild、SWC 进行快速编译
- 处理模块默认导出
- 支持页面配置读取

#### 2.2.1 requireWithEsbuild

```ts
// packages/taro-helper/src/esbuild/index.ts

import { Config, transformSync } from '@swc/core'
import esbuild from 'esbuild'
import requireFromString from 'require-from-string'
// 省略若干代码

/** 基于 esbuild 的 require 实现 */
export function requireWithEsbuild(
  id: string,
  { customConfig = {}, customSwcConfig = {}, cwd = process.cwd() }: IRequireWithEsbuildOptions = {}
) {
  const { outputFiles = [] } = esbuild.buildSync(
	// 省略若干代码
  )

  // Note: esbuild.buildSync 模式下不支持引入插件，所以这里需要手动转换
  const { code = '' } = transformSync(
    outputFiles[0].text,
    defaults(customSwcConfig, {
      jsc: { target: 'es2015' },
    })
  )
  return requireFromString(code, id)
}
```

#### 2.2.2 getModuleDefaultExport 处理模块默认导出

```ts
export const getModuleDefaultExport = (exports) => (exports.__esModule ? exports.default : exports)
```

#### 2.2.3 readPageConfig 读取页面配置

这个函数要实现的功能是：在页面 JS 文件中使用 `definePageConfig` 也能配置读取。

![page-js](./images/page-js.png)

```ts
// packages/taro-helper/src/utils.ts

export function readPageConfig(configPath: string) {
  let result: any = {}
  const extNames = ['.js', '.jsx', '.ts', '.tsx', '.vue']

  // check source file extension
  extNames.some((ext) => {
    const tempPath = configPath.replace('.config', ext)
    if (fs.existsSync(tempPath)) {
      try {
        result = readSFCPageConfig(tempPath)
      } catch (error) {
        result = {}
      }
      return true
    }
  })
  return result
}
```

#### 2.2.4 readSFCPageConfig

```ts
// packages/taro-helper/src/utils.ts

// read page config from a sfc file instead of the regular config file
function readSFCPageConfig(configPath: string) {
  if (!fs.existsSync(configPath)) return {}

  const sfcSource = fs.readFileSync(configPath, 'utf8')
  const dpcReg = /definePageConfig\(\{[\w\W]+?\}\)/g
  const matches = sfcSource.match(dpcReg)

  let result: any = {}

  if (matches && matches.length === 1) {
    const callExprHandler = (p: any) => {
      const { callee } = p.node
      if (!callee.name) return
      if (callee.name && callee.name !== 'definePageConfig') return

      const configNode = p.node.arguments[0]
      result = exprToObject(configNode)
      p.stop()
    }
    const configSource = matches[0]
    const program = (babel.parse(configSource, { filename: '' }))?.program

    program && babel.traverse(program, { CallExpression: callExprHandler })
  }

  return result
}
```

## 3. getPages 获取页面信息

```ts
/**
 * 根据 app config 的 pages 配置项，收集所有页面信息，
 * 包括处理分包和 tabbar
 */
getPages () {
	if (isEmptyObject(this.appConfig)) {
		throw new Error('缺少 app 全局配置文件，请检查！')
	}

	const appPages = this.appConfig.pages
	if (!appPages || !appPages.length) {
		throw new Error('全局配置缺少 pages 字段，请检查！')
	}

	if (!this.isWatch && this.options.logger?.quiet === false) {
		printLog(processTypeEnum.COMPILE, '发现入口', this.getShowPath(this.appEntry))
	}

	const { newBlended, frameworkExts, combination } = this.options
	const { prerender } = combination.config

	// 拆分到下方
}
```

一些判断和校验。
其中经常能在控制台看到的一句提示`发现入口`，源码就是在这里实现的。

![image](./images/console.png)

```ts
	this.prerenderPages = new Set(validatePrerenderPages(appPages, prerender).map(p => p.path))
	this.getTabBarFiles(this.appConfig)
	this.pages = new Set([
		...appPages.map<IComponent>(item => {
			const pagePath = resolveMainFilePath(path.join(this.options.sourceDir, item), frameworkExts)
			const pageTemplatePath = this.getTemplatePath(pagePath)
			const isNative = this.isNativePageORComponent(pageTemplatePath)
			return {
				name: item,
				path: pagePath,
				isNative,
				stylePath: isNative ? this.getStylePath(pagePath) : undefined,
				templatePath: isNative ? this.getTemplatePath(pagePath) : undefined
			}
		})
	])
	this.getSubPackages(this.appConfig)
	// 新的混合原生编译模式 newBlended 下，需要收集独立编译为原生自定义组件
	newBlended && this.getNativeComponent()
}
```

执行这个函数过后，`this.pages` 会得到所有的页面数据。

![pages](./images/pages.png)

接下来是获取页面配置信息和组件等。

## 4. getPagesConfig 读取页面及其依赖的组件的配置

```ts
/**
 * 读取页面及其依赖的组件的配置
 */
getPagesConfig () {
	this.pages.forEach(page => {
		if (!this.isWatch && this.options.logger?.quiet === false) {
			printLog(processTypeEnum.COMPILE, '发现页面', this.getShowPath(page.path))
		}

		const pagePath = page.path
		const independentPackage = this.getIndependentPackage(pagePath)

		this.compileFile(page, independentPackage)
	})
}
```

其中经常能在控制台看到的一句提示`发现页面`，源码就是在这里实现的。

![image](./images/console.png)

pages 的配置。

![pages.config](./images/pages.config.png)

## 5. getDarkMode 收集 dark mode 配置中的文件

```ts
/**
   * 收集 dark mode 配置中的文件
   */
  getDarkMode () {
    const themeLocation = this.appConfig.themeLocation
    const darkMode = this.appConfig.darkmode
    if (darkMode && themeLocation && typeof themeLocation === 'string') {
      this.themeLocation = themeLocation
    }
  }
```

收集起来。

我们接下来看 `getConfigFiles` 的实现。

## 6. getConfigFiles 往 this.dependencies 中新增或修改所有 config 配置模块

```ts
/**
   * 往 this.dependencies 中新增或修改所有 config 配置模块
   */
  getConfigFiles (compiler: Compiler) {
    const filesConfig = this.filesConfig
    Object.keys(filesConfig).forEach(item => {
      if (fs.existsSync(filesConfig[item].path)) {
        this.addEntry(filesConfig[item].path, item, META_TYPE.CONFIG)
      }
    })

    // webpack createChunkAssets 前一刻，去除所有 config chunks
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      compilation.hooks.beforeChunkAssets.tap(PLUGIN_NAME, () => {
        const chunks = compilation.chunks
        const configNames = Object.keys(filesConfig)

        for (const chunk of chunks) {
          if (configNames.find(configName => configName === chunk.name)) chunks.delete(chunk)
        }
      })
    })
  }
```

## 7. addEntries 在 this.dependencies 中新增或修改 app、模板组件、页面、组件等资源模块

加入依赖项中的类型。方便针对不同类型，采用不同的 `loader` 处理。

```ts
// packages/taro-helper/src/constants.ts
export enum META_TYPE {
  ENTRY = 'ENTRY',
  PAGE = 'PAGE',
  COMPONENT = 'COMPONENT',
  NORMAL = 'NORMAL',
  STATIC = 'STATIC',
  CONFIG = 'CONFIG',
  EXPORTS = 'EXPORTS',
}
```

```ts
/**
   * 在 this.dependencies 中新增或修改 app、模板组件、页面、组件等资源模块
   */
  addEntries () {
    const { template } = this.options

    this.addEntry(this.appEntry, 'app', META_TYPE.ENTRY)
    if (!template.isSupportRecursive) {
      this.addEntry(path.resolve(__dirname, '..', 'template/comp'), 'comp', META_TYPE.STATIC)
    }
    this.addEntry(path.resolve(__dirname, '..', 'template/custom-wrapper'), 'custom-wrapper', META_TYPE.STATIC)
	// 拆分到下方
  }
```

1. 添加应用入口
2. 添加模板组件
  - 如果模板不支持递归，添加 comp 组件
  - 添加 custom-wrapper 组件
3. 添加页面
- 如果是原生页面，添加页面文件、样式文件和模板文件
- 如果是普通页面，只添加页面文件


遍历页面添加到依赖项中。

```ts
    this.pages.forEach(item => {
      if (item.isNative) {
        this.addEntry(item.path, item.name, META_TYPE.NORMAL, { isNativePage: true })
        if (item.stylePath && fs.existsSync(item.stylePath)) {
          this.addEntry(item.stylePath, this.getStylePath(item.name), META_TYPE.NORMAL)
        }
        if (item.templatePath && fs.existsSync(item.templatePath)) {
          this.addEntry(item.templatePath, this.getTemplatePath(item.name), META_TYPE.NORMAL)
        }
      } else {
        this.addEntry(item.path, item.name, META_TYPE.PAGE)
      }
    })
```

遍历组件添加到依赖项中。

```ts
    this.components.forEach(item => {
      if (item.isNative) {
        this.addEntry(item.path, item.name, META_TYPE.NORMAL, { isNativePage: true })
        if (item.stylePath && fs.existsSync(item.stylePath)) {
          this.addEntry(item.stylePath, this.getStylePath(item.name), META_TYPE.NORMAL)
        }
        if (item.templatePath && fs.existsSync(item.templatePath)) {
          this.addEntry(item.templatePath, this.getTemplatePath(item.name), META_TYPE.NORMAL)
        }
      } else {
        this.addEntry(item.path, item.name, META_TYPE.COMPONENT)
      }
    })
```

### 7.1 addEntry 在 this.dependencies 中新增或修改模块

```ts
/**
   * 在 this.dependencies 中新增或修改模块
   */
  addEntry (entryPath: string, entryName: string, entryType: META_TYPE, options = {}) {
    let dep: TaroSingleEntryDependency
    if (this.dependencies.has(entryPath)) {
      dep = this.dependencies.get(entryPath)!
      dep.name = entryName
      dep.loc = { name: entryName }
      dep.request = entryPath
      dep.userRequest = entryPath
      dep.miniType = entryType
      dep.options = options
    } else {
      dep = new TaroSingleEntryDependency(entryPath, entryName, { name: entryName }, entryType, options)
    }
    this.dependencies.set(entryPath, dep)
  }
```

this.dependencies 是这样的结构。存储的是路径和 TaroSingleEntryDependency 实例对象。如果存在则更新。

![dependencies](./images/dependencies.png)

行文至此，我们完成了对 `run` 函数的分析。分析 `app` 入口文件，搜集页面、组件信息，往 `this.dependencies` 中添加资源模块。

## 8. 总结


最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。
