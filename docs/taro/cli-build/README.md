---
highlight: darcula
theme: smartblue
---

# Taro 源码揭秘 - 4. 日常 npm run dev 开发小程序，build 编译打包整体流程是怎样的

## 1. 前言

大家好，我是[若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

截至目前（`2024-08-12`），`taro` 正式版是 `4.0.4`，官方文章正式文章暂未发布。官方之前发过[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。

计划写一个 `taro` 源码揭秘系列，欢迎持续关注。初步计划有如下文章：

-   [x] [Taro 源码揭秘 - 1. 揭开整个架构的入口 CLI => taro init 初始化项目的秘密](https://juejin.cn/post/7378363694939783178)
-   [x] [Taro 源码揭秘 - 2. 揭开整个架构的插件系统的秘密](https://juejin.cn/spost/7380195796208205824)
-   [x] [Taro 源码揭秘 - 3. 每次创建新的 taro 项目（taro init）的背后原理是什么](https://juejin.cn/post/7390335741586931738)
-   [ ] cli build
-   [ ] 等等

学完本文，你将学到：

```bash
1.
等等
```

经常使用 `Taro` 开发小程序的小伙伴，一定日常使用 `npm run dev:weapp` 等命令运行小程序。我们这篇文章就来解读这个命令背后，`Taro` 到底做了什么。
`npm run dev:weapp` 对应的是 `taro build --type weapp --watch`。<br>
`npm run build:weapp` 对应的是 `taro build --type weapp`。<br>

关于克隆项目、环境准备、如何调试代码等，参考[第一篇文章-准备工作、调试](https://juejin.cn/post/7378363694939783178#heading-1)。后续文章基本不再过多赘述。
>文章中基本是先放源码，源码中不做过多解释。源码后面再做简单讲述。

## 调试源码

```bash
npx @taro/cli init taro4-debug
cd taro4-debug
# 安装依赖
pnpm i
# 写文章时最新的版本是 4.0.4
```

初始化一个项目，方便调试，选择`React`、`TS`、`webpack`、`CLI默认模板`、`pnpm`。

![初始化项目](./images/taro-init.png)

### 调试方式1：使用项目里的依赖

```bash
git clone https://github.com/NervJS/taro.git
cd taro
pnpm i
pnpm run build
# 写文章时最新的版本是 4.0.4，可以 git checkout 39dd83eb0bfc2a937acd79b289c7c2ec6e59e202
# 39dd83eb0bfc2a937acd79b289c7c2ec6e59e202
# chore(release): publish 4.0.4 (#16202)
```

方式1调试截图如下：

![使用项目中的依赖调试](./images/taro-project-debugger.png)

优点，无需多余的配置，可以直接调试本身项目。
缺点：安装的 `taro` 依赖都是 `dist` 目录，压缩过后的，不方便查看原始代码。

我们使用调试方法2。

### 调试方式2：使用 taro 源码

优点：可以调试本身不压缩的源码。
缺点：需要配置 `launch.json`。还需要在对应的 `dist` 配置修改 `taro-platform-weapp` 等包的路径。

不配置会报错，路径不对。

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "CLI debug",
      "program": "${workspaceFolder}/packages/taro-cli/bin/taro",
      "cwd": "/Users/ruochuan/git-source/github/taro4-debug",
      "args": [
        "build",
        "--type",
        "weapp",
      ],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
  ]
}
```

方式2调试截图如下：

![使用 taro 源码调试](./images/taro-debugger.png)

我把 `taro` 源码和 `taro4-debug` 克隆到了同一个目录 `github`。

重点添加配置 "cwd": "/Users/ruochuan/git-source/github/taro4-debug"、 `"args": ["build","--type","weapp" ]` 和 `"console": "integratedTerminal"`

调试微信小程序打包。

```ts
// packages/taro-cli/src/presets/commands/build.ts
import {
  MessageKind,
  validateConfig
} from '@tarojs/plugin-doctor'

import * as hooks from '../constant'

import type { IPluginContext } from '@tarojs/service'

export default (ctx: IPluginContext) => {
  ctx.registerCommand({
    name: 'build',
    optionsMap: {
      '--type [typeName]': 'Build type, weapp/swan/alipay/tt/qq/jd/h5/rn',
      '--watch': 'Watch mode',
      // 省略若干代码
      '--no-check': 'Do not check config is valid or not',
    },
    synopsisList: [
      'taro build --type weapp',
      'taro build --type weapp --watch',
      // 省略若干代码
    ],
    async fn(opts) {
      const { options, config, _ } = opts
      const { platform, isWatch, blended, newBlended, withoutBuild, noInjectGlobalStyle, noCheck } = options
      const { fs, chalk, PROJECT_CONFIG } = ctx.helper
      const { outputPath, configPath } = ctx.paths

      if (!configPath || !fs.existsSync(configPath)) {
        console.log(chalk.red(`找不到项目配置文件${PROJECT_CONFIG}，请确定当前目录是 Taro 项目根目录!`))
        process.exit(1)
      }

      if (typeof platform !== 'string') {
        console.log(chalk.red('请传入正确的编译类型！'))
        process.exit(0)
      }

      // 校验 Taro 项目配置
      if (!noCheck) {
        const checkResult = await checkConfig({
          projectConfig: ctx.initialConfig,
          helper: ctx.helper
        })
        if (!checkResult.isValid) {
        // 校验失败，退出
        }
      }

      const isProduction = process.env.NODE_ENV === 'production' || !isWatch

      // dist folder
	  //   确保输出路径存在，如果不存在就创建
      fs.ensureDirSync(outputPath)

      // is build native components mode?
      const isBuildNativeComp = _[1] === 'native-components'

      await ctx.applyPlugins(hooks.ON_BUILD_START)
      await ctx.applyPlugins({
        name: platform,
        opts: {
          config: {
            ...config,
            isWatch,
            mode: isProduction ? 'production' : 'development',
            blended,
            isBuildNativeComp,
            withoutBuild,
            newBlended,
            noInjectGlobalStyle,
			// 省略若干钩子
          },
        },
      })
      await ctx.applyPlugins(hooks.ON_BUILD_COMPLETE)
    },
  })
}

async function checkConfig ({ projectConfig, helper }) {
  const result = await validateConfig(projectConfig, helper)
  return result
}
```

Taro build 插件主要做了以下几件事：

- 判断 `config/index` 配置文件是否存在。
- 判断 `platfrom` 参数是否是字符串，这里是 `weapp`，如果不是，退出程序。
- 使用 `checkConfig` 函数校验配置文件 `config/index`，如果配置文件出错，退出程序。
- 调用 `ctx.applyPlugins(hooks.ON_BUILD_START)` （编译开始）钩子。
- 调用 `ctx.applyPlugins({ name: platform, })` （调用 weapp） 钩子。
- 调用 `ctx.applyPlugins(hooks.ON_BUILD_COMPLETE)` （编译结束）钩子。

```js
await ctx.applyPlugins({
  name: platform,
});
```

调用的是端平台插件，本文以微信小程序为例，所以调用的是 weapp。对应的源码文件路径是：`packages/taro-platform-weapp/src/index.ts`。我们来看具体实现。



## 端平台插件 weapp

```ts
// packages/taro-platform-weapp/src/index.ts
import Weapp from './program'

import type { IPluginContext } from '@tarojs/service'

// 让其它平台插件可以继承此平台
export { Weapp }

export interface IOptions {
  enablekeyboardAccessory?: boolean
}

export default (ctx: IPluginContext, options: IOptions) => {
  ctx.registerPlatform({
    name: 'weapp',
    useConfigName: 'mini',
    async fn ({ config }) {
      const program = new Weapp(ctx, config, options || {})
      await program.start()
    }
  })
}
```

`ctx.registerPlatform` 注册 `weapp` 平台插件，调用 `Weapp` 构造函数，传入 `ctx` 、`config` 和 `options` 等配置。

## new Weapp 构造函数

>packages/taro-platform-weapp/src/program.ts

```ts
// packages/taro-platform-weapp/src/program.ts
import { TaroPlatformBase } from '@tarojs/service'

import { components } from './components'
import { Template } from './template'

import type { IOptions } from './index'

const PACKAGE_NAME = '@tarojs/plugin-platform-weapp'

export default class Weapp extends TaroPlatformBase {
  template: Template
  platform = 'weapp'
  globalObject = 'wx'
  projectConfigJson: string = this.config.projectConfigName || 'project.config.json'
  runtimePath = `${PACKAGE_NAME}/dist/runtime`
  taroComponentsPath = `${PACKAGE_NAME}/dist/components-react`
  fileType = {
    templ: '.wxml',
    style: '.wxss',
    config: '.json',
    script: '.js',
    xs: '.wxs'
  }

  /**
   * 1. setupTransaction - init
   * 2. setup
   * 3. setupTransaction - close
   * 4. buildTransaction - init
   * 5. build
   * 6. buildTransaction - close
   */
  constructor (ctx, config, pluginOptions?: IOptions) {
    super(ctx, config)
    this.template = new Template(pluginOptions)
    this.setupTransaction.addWrapper({
      close () {
        this.modifyTemplate(pluginOptions)
        this.modifyWebpackConfig()
      }
    })
  }

  /**
   * 增加组件或修改组件属性
   */
  modifyTemplate (pluginOptions?: IOptions) {
    const template = this.template
    template.mergeComponents(this.ctx, components)
    template.voidElements.add('voip-room')
    template.focusComponents.add('editor')
    if (pluginOptions?.enablekeyboardAccessory) {
      template.voidElements.delete('input')
      template.voidElements.delete('textarea')
    }
  }

  /**
   * 修改 Webpack 配置
   */
  modifyWebpackConfig () {
    this.ctx.modifyWebpackChain(({ chain }) => {
      // 解决微信小程序 sourcemap 映射失败的问题，#9412
      chain.output.devtoolModuleFilenameTemplate((info) => {
        const resourcePath = info.resourcePath.replace(/[/\\]/g, '_')
        return `webpack://${info.namespace}/${resourcePath}`
      })
    })
  }
}

```

- class Weapp 继承于抽象类 TaroPlatformBase 继承于抽象类 TaroPlatform

## TaroPlatformBase 端平台插件基础抽象类

关于抽象类和更多类相关，可以参考：
[TypeScript 入门教程 - 类](https://ts.xcatliu.com/advanced/class.html)
>抽象类（Abstract Class）：抽象类是供其他类继承的基类，抽象类不允许被实例化。抽象类中的抽象方法必须在子类中被实现

```ts
// packages/taro-service/src/platform-plugin-base/mini.ts
import * as path from 'node:path'

import { recursiveMerge, taroJsMiniComponentsPath } from '@tarojs/helper'
import { isObject, PLATFORM_TYPE } from '@tarojs/shared'

import { getPkgVersion } from '../utils/package'
import TaroPlatform from './platform'

import type { RecursiveTemplate, UnRecursiveTemplate } from '@tarojs/shared/dist/template'
import type { TConfig } from '../utils/types'

interface IFileType {
  templ: string
  style: string
  config: string
  script: string
  xs?: string
}

export abstract class TaroPlatformBase<T extends TConfig = TConfig> extends TaroPlatform<T> {
  platformType = PLATFORM_TYPE.MINI

  abstract globalObject: string
  abstract fileType: IFileType
  abstract template: RecursiveTemplate | UnRecursiveTemplate
  // Note: 给所有的小程序平台一个默认的 taroComponentsPath
  taroComponentsPath: string = taroJsMiniComponentsPath
  projectConfigJson?: string

  private projectConfigJsonOutputPath: string

  /**
   * 1. 清空 dist 文件夹
   * 2. 输出编译提示
   * 3. 生成 project.config.json
   */
  private async setup () {
    await this.setupTransaction.perform(this.setupImpl, this)
    this.ctx.onSetupClose?.(this)
  }

  private setupImpl () {
    const { output } = this.config
    // webpack5 原生支持 output.clean 选项，但是 webpack4 不支持， 为统一行为，这里做一下兼容
    // （在 packages/taro-mini-runner/src/webpack/chain.ts 和 packages/taro-webpack-runner/src/utils/chain.ts 的 makeConfig 中对 clean 选项做了过滤）
    // 仅 output.clean 为 false 时不清空输出目录
    // eslint-disable-next-line eqeqeq
    if (output == undefined || output.clean == undefined || output.clean === true) {
      this.emptyOutputDir()
    } else if (isObject(output.clean)) {
      this.emptyOutputDir(output.clean.keep || [])
    }
    this.printDevelopmentTip(this.platform)
    if (this.projectConfigJson) {
      this.generateProjectConfig(this.projectConfigJson)
    }
    if (this.ctx.initialConfig.logger?.quiet === false) {
      const { printLog, processTypeEnum } = this.ctx.helper
      printLog(processTypeEnum.START, '开发者工具-项目目录', `${this.ctx.paths.outputPath}`)
    }
    // Webpack5 代码自动热重载
    if (this.compiler === 'webpack5' && this.config.isWatch && this.projectConfigJsonOutputPath) {
      try {
        const projectConfig = require(this.projectConfigJsonOutputPath)
        if (projectConfig.setting?.compileHotReLoad === true) {
          this.ctx.modifyWebpackChain(({ chain }) => {
            chain.plugin('TaroMiniHMRPlugin')
              .use(require(path.join(__dirname, './webpack/hmr-plugin.js')).default)
          })
        }
      } catch (e) {} // eslint-disable-line no-empty
    }
  }

  protected printDevelopmentTip (platform: string) {
    const tips: string[] = []
    const config = this.config
    const { chalk } = this.helper

    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      const { isWindows } = this.helper
      const exampleCommand = isWindows
        ? `$ set NODE_ENV=production && taro build --type ${platform} --watch`
        : `$ NODE_ENV=production taro build --type ${platform} --watch`

      tips.push(chalk.yellowBright(`预览模式生成的文件较大，设置 NODE_ENV 为 production 可以开启压缩。
Example:
${exampleCommand}`))
    }

    if (this.compiler === 'webpack5' && !config.cache?.enable) {
      tips.push(chalk.yellowBright('建议开启持久化缓存功能，能有效提升二次编译速度，详情请参考: https://docs.taro.zone/docs/config-detail#cache。'))
    }

    if (tips.length) {
      console.log(chalk.yellowBright('Tips:'))
      tips.forEach((item, index) => console.log(`${chalk.yellowBright(index + 1)}. ${item}`))
      console.log('\n')
    }
  }

  /**
   * 返回当前项目内的 runner 包
   */
  protected async getRunner () {
    const { appPath } = this.ctx.paths
    const { npm } = this.helper

    const runnerPkg = this.compiler === 'vite' ? '@tarojs/vite-runner' : '@tarojs/webpack5-runner'

    const runner = await npm.getNpmPkg(runnerPkg, appPath)

    return runner.bind(null, appPath)
  }

  /**
   * 准备 runner 参数
   * @param extraOptions 需要额外合入 Options 的配置项
   */
  protected getOptions (extraOptions = {}) {
    const { ctx, globalObject, fileType, template } = this

    const config = recursiveMerge(Object.assign({}, this.config), {
      env: {
        FRAMEWORK: JSON.stringify(this.config.framework),
        TARO_ENV: JSON.stringify(this.platform),
        TARO_PLATFORM: JSON.stringify(this.platformType),
        TARO_VERSION: JSON.stringify(getPkgVersion())
      }
    })

    return {
      ...config,
      nodeModulesPath: ctx.paths.nodeModulesPath,
      buildAdapter: config.platform,
      platformType: this.platformType,
      globalObject,
      fileType,
      template,
      ...extraOptions
    }
  }

  /**
   * 调用 runner 开始编译
   * @param extraOptions 需要额外传入 runner 的配置项
   */
  private async build (extraOptions = {}) {
    this.ctx.onBuildInit?.(this)
    await this.buildTransaction.perform(this.buildImpl, this, extraOptions)
  }

  private async buildImpl (extraOptions = {}) {
    const runner = await this.getRunner()
    const options = this.getOptions(
      Object.assign(
        {
          runtimePath: this.runtimePath,
          taroComponentsPath: this.taroComponentsPath
        },
        extraOptions
      )
    )
    await runner(options)
  }

  /**
   * 生成 project.config.json
   * @param src 项目源码中配置文件的名称
   * @param dist 编译后配置文件的名称，默认为 'project.config.json'
   */
  protected generateProjectConfig (src: string, dist = 'project.config.json') {
    if (this.config.isBuildNativeComp) return
    this.ctx.generateProjectConfig({
      srcConfigName: src,
      distConfigName: dist
    })
    this.projectConfigJsonOutputPath = `${this.ctx.paths.outputPath}/${dist}`
  }

  /**
   * 递归替换对象的 key 值
   */
  protected recursiveReplaceObjectKeys (obj, keyMap) {
    Object.keys(obj).forEach((key) => {
      if (keyMap[key]) {
        obj[keyMap[key]] = obj[key]
        if (typeof obj[key] === 'object') {
          this.recursiveReplaceObjectKeys(obj[keyMap[key]], keyMap)
        }
        delete obj[key]
      } else if (keyMap[key] === false) {
        delete obj[key]
      } else if (typeof obj[key] === 'object') {
        this.recursiveReplaceObjectKeys(obj[key], keyMap)
      }
    })
  }

  /**
   * 调用 runner 开启编译
   */
  public async start () {
    await this.setup()
    await this.build()
  }
}

```

## TaroPlatform 端平台插件抽象类

### Transaction

```ts
// packages/taro-service/src/platform-plugin-base/platform.ts

interface IWrapper {
  init? (): void
  close? (): void
}

export class Transaction<T = TaroPlatform> {
  wrappers: IWrapper[] = []

  async perform (fn: Func, scope: T, ...args: any[]) {
    this.initAll(scope)
    await fn.call(scope, ...args)
    this.closeAll(scope)
  }

  initAll (scope: T) {
    const wrappers = this.wrappers
    wrappers.forEach(wrapper => wrapper.init?.call(scope))
  }

  closeAll (scope: T) {
    const wrappers = this.wrappers
    wrappers.forEach(wrapper => wrapper.close?.call(scope))
  }

  addWrapper (wrapper: IWrapper) {
    this.wrappers.push(wrapper)
  }
}

```

```ts
// packages/taro-service/src/platform-plugin-base/platform.ts
import { PLATFORM_TYPE } from '@tarojs/shared'

import type { Func } from '@tarojs/taro/types/compile'
import type { IPluginContext, TConfig } from '../utils/types'

const VALID_COMPILER = ['webpack5', 'vite']
const DEFAULT_COMPILER = 'webpack5'

export default abstract class TaroPlatform<T extends TConfig = TConfig> {
  protected ctx: IPluginContext
  protected config: T
  protected helper: IPluginContext['helper']
  protected compiler: string

  abstract platformType: PLATFORM_TYPE
  abstract platform: string
  abstract runtimePath: string | string[]

  protected setupTransaction = new Transaction<this>()
  protected buildTransaction = new Transaction<this>()

  constructor (ctx: IPluginContext, config: T) {
    this.ctx = ctx
    this.helper = ctx.helper
    this.config = config
    this.updateOutputPath(config)
    const _compiler = config.compiler
    this.compiler = typeof _compiler === 'object' ? _compiler.type : _compiler
    // Note: 兼容 webpack4 和不填写 compiler 的情况，默认使用 webpack5
    if (!VALID_COMPILER.includes(this.compiler)) {
      this.compiler = DEFAULT_COMPILER
    }
  }

  protected emptyOutputDir (excludes: Array<string | RegExp> = []) {
    const { outputPath } = this.ctx.paths
    this.helper.emptyDirectory(outputPath, { excludes })
  }

  /**
   * 如果分端编译详情 webpack 配置了 output 则需更新 outputPath 位置
   */
  private updateOutputPath (config: TConfig) {
    const platformPath = config.output?.path
    if (platformPath) {
      this.ctx.paths.outputPath = platformPath
    }
  }

  /**
   * 调用 runner 开启编译
   */
  abstract start(): Promise<void>
}

```

## runner

- index.js

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

```ts
// packages/taro-webpack5-runner/src/index.mini.ts
import { chalk } from '@tarojs/helper'
import Prebundle from '@tarojs/webpack5-prebundle'
import { isEmpty } from 'lodash'
import webpack from 'webpack'

import { Prerender } from './prerender/prerender'
import { errorHandling } from './utils/webpack'
import { MiniCombination } from './webpack/MiniCombination'

import type { Stats } from 'webpack'
import type { IMiniBuildConfig } from './utils/types'

export default async function build (appPath: string, rawConfig: IMiniBuildConfig): Promise<Stats | void> {
  const combination = new MiniCombination(appPath, rawConfig)
  await combination.make()

  const { enableSourceMap, entry = {}, runtimePath } = combination.config
  const prebundle = new Prebundle({
    appPath,
    sourceRoot: combination.sourceRoot,
    chain: combination.chain,
    enableSourceMap,
    entry,
    isWatch: combination.config.isWatch,
    runtimePath,
    isBuildPlugin: combination.isBuildPlugin,
    alias: combination.config.alias,
    defineConstants: combination.config.defineConstants,
    modifyAppConfig: combination.config.modifyAppConfig
  })
  try {
    await prebundle.run(combination.getPrebundleOptions())
  } catch (error) {
    console.error(error)
    console.warn(chalk.yellow('依赖预编译失败，已经为您跳过预编译步骤，但是编译速度可能会受到影响。'))
  }

  const webpackConfig = combination.chain.toConfig()
  const config = combination.config

  return new Promise<Stats | void>((resolve, reject) => {
    if (config.withoutBuild) return

    const compiler = webpack(webpackConfig)
    const onBuildFinish = config.onBuildFinish
    let prerender: Prerender

    const onFinish = function (error: Error | null, stats: Stats | null) {
      if (typeof onBuildFinish !== 'function') return

      onBuildFinish({
        error,
        stats,
        isWatch: config.isWatch
      })
    }

    const callback = async (err: Error, stats: Stats) => {
      const errorLevel = typeof config.compiler !== 'string' && config.compiler?.errorLevel || 0
      if (err || stats.hasErrors()) {
        const error = err ?? stats.toJson().errors
        onFinish(error, null)
        reject(error)
        errorHandling(errorLevel, stats)
        return
      }

      if (!isEmpty(config.prerender)) {
        prerender = prerender ?? new Prerender(config, webpackConfig, stats, config.template)
        await prerender.render()
      }

      // const res = stats.toString({
      //   logging: 'verbose'
      // })
      // console.log('res: ', res)

      onFinish(null, stats)
      resolve(stats)
    }

    if (config.isWatch) {
      compiler.watch({
        aggregateTimeout: 300,
        poll: undefined
      }, callback)
    } else {
      compiler.run((err: Error, stats: Stats) => {
        compiler.close(err2 => callback(err || err2, stats))
      })
    }
  })
}

```

## 流程梳理

- new WeappBuild

## links

[Taro 实现细节](https://docs.taro.zone/docs/implement-note)
