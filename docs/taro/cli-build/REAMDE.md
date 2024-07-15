---
highlight: darcula
theme: smartblue
---

# Taro 源码揭秘 - 4. build 编译打包

## 1. 前言

大家好，我是[若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

截至目前（`2024-07-12`），`taro` 正式版是 `3.6.34`，[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。文章提到将于 2024 年第二季度，发布 `4.x`。所以我们直接学习 `4.x`，`4.x` 最新版本是 `4.0.0`。

计划写一个 `taro` 源码揭秘系列，欢迎持续关注。初步计划有如下文章：

-   [x] [Taro 源码揭秘 - 1. 揭开整个架构的入口 CLI => taro init 初始化项目的秘密](https://juejin.cn/post/7378363694939783178)
-   [x] [Taro 源码揭秘 - 2. 揭开整个架构的插件系统的秘密](https://juejin.cn/spost/7380195796208205824)
-   [x] [Taro 源码揭秘 - 3. 每次创建新的 taro 项目（taro init）的背后原理是什么](https://juejin.cn/post/7390335741586931738)
-   [ ] cli build
-   [ ] 等等

学完本文，你将学到：

```bash
1. taro init 初始化项目，背后原理是什么？
2. 如何调试 taro cli init 源码
3. nodejs 如何调用 rust 代码？
4. 如何调试 rust 代码
5. 如何使用 handlebars 模板引擎
等等
```

关于克隆项目、环境准备、如何调试代码等，参考[第一篇文章-准备工作、调试](https://juejin.cn/post/7378363694939783178#heading-1)。后续文章基本不再过多赘述。
>文章中基本是先放源码，源码中不做过多解释。源码后面再做简单讲述。

```ts
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
      '--env [env]': 'Value for process.env.NODE_ENV',
      '--mode [mode]': 'Value of dotenv extname',
      '-p, --port [port]': 'Specified port',
      '--no-build': 'Do not build project',
      '--platform': '[rn] Specific React-Native build target: android / ios, android is default value',
      '--reset-cache': '[rn] Clear transform cache',
      '--public-path': '[rn] Assets public path',
      '--bundle-output': '[rn] File name where to store the resulting bundle',
      '--sourcemap-output': '[rn] File name where to store the sourcemap file for resulting bundle',
      '--sourcemap-use-absolute-path': '[rn]  Report SourceMapURL using its full path',
      '--sourcemap-sources-root': '[rn] Path to make sourcemaps sources entries relative to',
      '--assets-dest': '[rn] Directory name where to store assets referenced in the bundle',
      '--qr': '[rn] Print qrcode of React-Native bundle server',
      '--blended': 'Blended Taro project in an original MiniApp project',
      '--new-blended': 'Blended Taro project in an original MiniApp project while supporting building components independently',
      '--plugin [typeName]': 'Build Taro plugin project, weapp',
      '--env-prefix [envPrefix]': "Provide the dotEnv varables's prefix",
      '--no-inject-global-style': '[H5] Do not inject global style',
      '--no-check': 'Do not check config is valid or not',
    },
    synopsisList: [
      'taro build --type weapp',
      'taro build --type weapp --watch',
      'taro build --type weapp --env production',
      'taro build --type weapp --blended',
      'taro build --type weapp --no-build',
      'taro build native-components --type weapp',
      'taro build --type weapp --new-blended',
      'taro build --plugin weapp --watch',
      'taro build --plugin weapp',
      'taro build --type weapp --mode prepare --env-prefix TARO_APP_',
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
          const ERROR = chalk.red('[✗] ')
          const WARNING = chalk.yellow('[!] ')
          const SUCCESS = chalk.green('[✓] ')

          const lineChalk = chalk.hex('#fff')
          const errorChalk = chalk.hex('#f00')
          console.log(errorChalk(`Taro 配置有误，请检查！ (${configPath})`))
          checkResult.messages.forEach((message) => {
            switch (message.kind) {
              case MessageKind.Error:
                console.log('  ' + ERROR + lineChalk(message.content))
                break
              case MessageKind.Success:
                console.log('  ' + SUCCESS + lineChalk(message.content))
                break
              case MessageKind.Warning:
                console.log('  ' + WARNING + lineChalk(message.content))
                break
              case MessageKind.Manual:
                console.log('  ' + lineChalk(message.content))
                break
              default:
                break
            }
          })
          console.log('')
          process.exit(0)
        }
      }

      const isProduction = process.env.NODE_ENV === 'production' || !isWatch

      // dist folder
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
            async modifyAppConfig (appConfig) {
              await ctx.applyPlugins({
                name: hooks.MODIFY_APP_CONFIG,
                opts: {
                  appConfig
                }
              })
            },
            async modifyWebpackChain (chain, webpack, data) {
              await ctx.applyPlugins({
                name: hooks.MODIFY_WEBPACK_CHAIN,
                initialVal: chain,
                opts: {
                  chain,
                  webpack,
                  data,
                },
              })
            },
            async modifyViteConfig(viteConfig, data) {
              await ctx.applyPlugins({
                name: hooks.MODIFY_VITE_CONFIG,
                initialVal: viteConfig,
                opts: {
                  viteConfig,
                  data,
                },
              })
            },
            async modifyBuildAssets(assets, miniPlugin) {
              await ctx.applyPlugins({
                name: hooks.MODIFY_BUILD_ASSETS,
                initialVal: assets,
                opts: {
                  assets,
                  miniPlugin,
                },
              })
            },
            async modifyMiniConfigs(configMap) {
              await ctx.applyPlugins({
                name: hooks.MODIFY_MINI_CONFIGS,
                initialVal: configMap,
                opts: {
                  configMap,
                },
              })
            },
            async modifyComponentConfig(componentConfig, config) {
              await ctx.applyPlugins({
                name: hooks.MODIFY_COMPONENT_CONFIG,
                opts: {
                  componentConfig,
                  config,
                },
              })
            },
            async onCompilerMake(compilation, compiler, plugin) {
              await ctx.applyPlugins({
                name: hooks.ON_COMPILER_MAKE,
                opts: {
                  compilation,
                  compiler,
                  plugin,
                },
              })
            },
            async onParseCreateElement(nodeName, componentConfig) {
              await ctx.applyPlugins({
                name: hooks.ON_PARSE_CREATE_ELEMENT,
                opts: {
                  nodeName,
                  componentConfig,
                },
              })
            },
            async onBuildFinish({ error, stats, isWatch }) {
              await ctx.applyPlugins({
                name: hooks.ON_BUILD_FINISH,
                opts: {
                  error,
                  stats,
                  isWatch,
                },
              })
            },
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

## 插件 weapp

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
      console.log('registerPlatform', config)
      const program = new Weapp(ctx, config, options || {})
      await program.start()
    }
  })
}
```

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
- weapp =>
- TaroPlatformBase
- TaroPlatform

## TaroPlatformBase

```ts
import * as path from 'node:path'

import { recursiveMerge } from '@tarojs/helper'
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
  projectConfigJson?: string
  taroComponentsPath?: string

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

## TaroPlatform

```ts
import { PLATFORM_TYPE } from '@tarojs/shared'

import type { Func } from '@tarojs/taro/types/compile'
import type { IPluginContext, TConfig } from '../utils/types'

interface IWrapper {
  init? (): void
  close? (): void
}

const VALID_COMPILER = ['webpack5', 'vite']
const DEFAULT_COMPILER = 'webpack5'

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

## links

[Taro 实现细节](https://docs.taro.zone/docs/implement-note)
