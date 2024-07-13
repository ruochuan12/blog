---
highlight: darcula
theme: smartblue
---

# Taro 源码揭秘 - 4. build 编译打包

## 1. 前言

大家好，我是[若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

截至目前（`2024-07-12`），`taro` 正式版是 `3.6.33`，[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。文章提到将于 2024 年第二季度，发布 `4.x`。所以我们直接学习 `4.x`，`4.x` 分支最新 `beta` 版本是 `4.0.0-beta.118`。

计划写一个 `taro` 源码揭秘系列，欢迎持续关注。初步计划有如下文章：

-   [x] [Taro 源码揭秘 - 1. 揭开整个架构的入口 CLI => taro init 初始化项目的秘密](https://juejin.cn/post/7378363694939783178)
-   [x] [Taro 源码揭秘 - 2. 揭开整个架构的插件系统的秘密](https://juejin.cn/spost/7380195796208205824)
-   [x] [Taro 源码揭秘 - 3. 揭开 taro init 初始化项目的背后秘密](https://juejin.cn/post/7390335741586931738)
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

## links

[Taro 实现细节](https://docs.taro.zone/docs/implement-note)
