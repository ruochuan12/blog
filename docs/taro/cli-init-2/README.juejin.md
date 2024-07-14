---
highlight: darcula
theme: smartblue
---

# Taro 源码揭秘 - 3. 每次创建新的 taro 项目（taro init）的背后原理是什么

## 1. 前言

大家好，我是[若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

截至目前（`2024-07-12`），`taro` 正式版是 `3.6.34`，[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。文章提到将于 2024 年第二季度，发布 `4.x`。所以我们直接学习 `4.x`，`4.x` 最新版本是 `4.0.0`。

计划写一个 `taro` 源码揭秘系列，欢迎持续关注。初步计划有如下文章：

*   [x] [Taro 源码揭秘 - 1. 揭开整个架构的入口 CLI => taro init 初始化项目的秘密](https://juejin.cn/post/7378363694939783178)
*   [x] [Taro 源码揭秘 - 2. 揭开整个架构的插件系统的秘密](https://juejin.cn/spost/7380195796208205824)
*   [x] [Taro 源码揭秘 - 3. 每次创建新的 taro 项目（taro init）的背后原理是什么](https://juejin.cn/post/7390335741586931738)
*   [ ] cli build
*   [ ] 等等

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

> 文章中基本是先放源码，源码中不做过多解释。源码后面再做简单讲述。

众所周知，我们最开始初始化项目时都是使用 `taro init` 命令，本文我们继续来学习这个命令是如何实现的。

我们可以通过 [npm-dist-tag 文档](https://docs.npmjs.com/cli/v6/commands/npm-dist-tag) 命令来查看 `@tarojs/cli` 包的所有 `tag` 版本。

```bash
npm dist-tag @tarojs/cli
```

如图所示：

![taro-cli-npm-dist-tag.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/8363b1ec059b4ea4b57523cf81dc5198~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1720947881&x-orig-sign=Cq5C5YQIm4cXVanUoC%2BshUYj6jw%3D)

目前 `lastest` 标签（默认版本）是 `3.6.34`，`next` 标签是 `4.0.0`。后续 `lastest` 标签会设置为 `4.x` 版本。

我们先用 `@tarojs/cli@next` 初始化一个项目看看。全局安装相对麻烦，我们不全局安装，使用 `npx` 来运行 `next tag` 版本。

```bash
npx @tarojs/cli@next init taro4-next
```

这个初始化完整的过程，我用 [GIPHY CAPTURE](https://giphy.com/apps/giphycapture) 工具录制了一个`gif`，如下图所示：

![taro-init-gif-high.gif](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/d00b03d50cd34c1995c1f047ca5b3fef~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1720801922&x-orig-sign=rfbni%2BTeAF871T8a%2BQ1gwlf4cM8%3D)

我们接下来就是一步步来分析这个 `gif` 中的每一个步骤的实现原理。

## 2. 调试 taro init

我们在 `.vscode/launch.json` 中的原有的 `CLI debug` 命令行调试配置，添加 `init` 配置如下：

```json diff
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [{
      "type": "node",
      "request": "launch",
      "name": "CLI debug",
      "program": "${workspaceFolder}/packages/taro-cli/bin/taro",
+     "console": "integratedTerminal",
+     "args": [
+       "init",
+       "taro-init-test",
+     ],
      // 省略若干代码...
      "skipFiles": ["<node_internals>/**"]
    }]
}
```

其中 `"console": "integratedTerminal",` 配置是为了在调试时，可以在终端输入和交互。

## 3. init 命令行 fn 函数

根据前面两篇 [1. taro cli init](https://juejin.cn/post/7378363694939783178)、[2. taro 插件机制](https://juejin.cn/spost/7380195796208205824) 文章，我们可以得知：`taro init` 初始化命令，最终调用的是 `packages/taro-cli/src/presets/commands/init.ts` 文件中的 `ctx.registerCommand` 注册的 `init` 命令行的 `fn` 函数。

```ts
// packages/taro-cli/src/presets/commands/init.ts
import type { IPluginContext } from '@tarojs/service'

export default (ctx: IPluginContext) => {
  ctx.registerCommand({
    name: 'init',
    optionsMap: {
      '--name [name]': '项目名称',
      '--description [description]': '项目介绍',
      '--typescript': '使用TypeScript',
      '--npm [npm]': '包管理工具',
      '--template-source [templateSource]': '项目模板源',
      '--clone [clone]': '拉取远程模板时使用git clone',
      '--template [template]': '项目模板',
      '--css [css]': 'CSS预处理器(sass/less/stylus/none)',
      '-h, --help': 'output usage information'
    },
    async fn (opts) {
      // init project
      const { appPath } = ctx.paths
      const { options } = opts
      const { projectName, templateSource, clone, template, description, typescript, css, npm, framework, compiler, hideDefaultTemplate } = options
      const Project = require('../../create/project').default
      const project = new Project({
		// 省略若干参数...
      })

      project.create()
    }
  })
}

```

`fn` 函数，其中 `options` 参数是 `init` 命令行中的所有参数。
主要做了如下几件事：

*   读取组合各种参数，初始化 `project` 对象，并调用 `create` 方法。

我们重点来看 `packages/taro-cli/src/create/project.ts` 的 `Project` 类的实现，和 `create` 方法。

## 4. new Project 构造函数

```ts
// packages/taro-cli/src/create/project.ts
export default class Project extends Creator {
  public rootPath: string
  public conf: IProjectConfOptions

  constructor (options: IProjectConfOptions) {
    super(options.sourceRoot)
    const unSupportedVer = semver.lt(process.version, 'v18.0.0')
    if (unSupportedVer) {
      throw new Error('Node.js 版本过低，推荐升级 Node.js 至 v18.0.0+')
    }
    this.rootPath = this._rootPath

    this.conf = Object.assign(
      {
        projectName: '',
        projectDir: '',
        template: '',
        description: '',
        npm: ''
      },
      options
    )
  }
}
```

`Project` 继承了 `Creator` 类。

构造函数中，使用 `semver.lt` 判断当前 `node` 版本是否低于 `v18.0.0`，如果低于则报错。
[semver](https://www.npmjs.com/package/semver) 是一个版本号比较库，可以用来判断 `node` 版本是否符合要求。

其次就是初始化 `this.rootPath` 和 `this.conf`。

我们继续来看 `Creator` 类，构造函数中调用了 `init` 方法。

```ts
// packages/taro-cli/src/create/creator.ts
export default class Creator {
  protected _rootPath: string
  public rootPath: string

  constructor (sourceRoot?: string) {
    this.rootPath = this.sourceRoot(sourceRoot || path.join(getRootPath()))
    this.init()
  }
}
```

所以继续来看 `init` 方法。

```ts
// packages/taro-cli/src/create/project.ts
init () {
    clearConsole()
    console.log(chalk.green('Taro 即将创建一个新项目!'))
    console.log(`Need help? Go and open issue: ${chalk.blueBright('https://tls.jd.com/taro-issue-helper')}`)
    console.log()
}
```

调试截图如下：

![调试截图](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/4b2dd24e6783421eaeab0abc78ce436b~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1720801977&x-orig-sign=2Rv%2FntcS7n%2BeMZMgWacBsA0K42w%3D)

输出就是这个图：

![taro-init-0.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/f31775fa8fcd4af0bbb4b5fcf85fe7a5~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1720948695&x-orig-sign=cKscXAHnOGywBM%2BURnCFmEDlnFw%3D)

其中`👽 Taro v4.0.0` 输出的是 `tarojs-cli/package.json` 的版本，[第一篇文章 4. taro-cli/src/utils/index.ts](https://juejin.cn/post/7378363694939783178#heading-6) 中有详细讲述，这里就不再赘述了。

输出`获取 taro 全局配置成功`是指获取 `~/.taro-global-config/index.json` 文件的插件集 `presets` 和插件 `plugins`。[第一篇文章 6.2.2 config.initGlobalConfig 初始化全局配置](https://juejin.cn/post/7378363694939783178#heading-12)中有详细讲述，`spinner.succeed('获取 taro 全局配置成功')` 这里就不再赘述了。

看完了 `Project` 构造函数，我们来看 `Project` 类的 `create` 方法。

### 4.1 project.create 创建项目

```ts
// packages/taro-cli/src/create/project.ts
async create () {
	try {
		const answers = await this.ask()
		const date = new Date()
		this.conf = Object.assign(this.conf, answers)
		this.conf.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
		this.write()
	} catch (error) {
		console.log(chalk.red('创建项目失败: ', error))
	}
}
```

`create` 函数主要做了以下几件事：

*   调用 `ask` 询问用户输入项目名称、描述、CSS预处理器、包管理工具等。
*   把用户反馈的结果和之前的配置合并起来，得到 `this.conf`。
*   调用 `write` 方法，写入文件，初始化模板项目。

调试截图如下：

![taro-init-debugger-create.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/924ea8ace2864f9a91df672e6e86b160~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1720802038&x-orig-sign=qgEHUoU%2FBIFwOFQe7wLfA8hRoPM%3D)

`this.conf` 参数结果如下：

```ts
const conf = {
  projectName: "taro-init-test",
  projectDir: "/Users/ruochuan/git-source/github/taro",
  template: "default",
  description: "taro",
  npm: "Yarn",
  templateSource: "direct:https://gitee.com/o2team/taro-project-templates.git#v4.0",
  clone: false,
  typescript: true,
  framework: "React",
  compiler: "Webpack5",
  hideDefaultTemplate: undefined,
  css: "Sass",
  date: "2024-7-12",
}
```

我们来看 `ask` 方法。

## 5. ask 询问用户输入项目名称、描述等

```ts
// packages/taro-cli/src/create/project.ts
async ask () {
    let prompts: Record<string, unknown>[] = []
    const conf = this.conf

    this.askProjectName(conf, prompts)
    this.askDescription(conf, prompts)
    this.askFramework(conf, prompts)
    this.askTypescript(conf, prompts)
    this.askCSS(conf, prompts)
    this.askCompiler(conf, prompts)
    this.askNpm(conf, prompts)
    await this.askTemplateSource(conf, prompts)

    const answers = await inquirer.prompt<IProjectConf>(prompts)

    prompts = []
    const templates = await this.fetchTemplates(answers)
    await this.askTemplate(conf, prompts, templates)
    const templateChoiceAnswer = await inquirer.prompt<IProjectConf>(prompts)

    return {
      ...answers,
      ...templateChoiceAnswer
    }
  }
```

简单来说 `ask` 方法就是一系列的 `inquirer` 交互。

> [`inquirer`](https://www.npmjs.com/package/inquirer) 是一个命令行交互库，可以用来创建命令行程序。

如果参数中没指定相应参数，那么就询问：
- 项目名称
- 项目介绍
- 选择框架（`React、PReact、Vue3、Solid`）
- 是否启用TS
- CSS预处理器（`Sass、less、Stylus、无等`）
- 编译工具（`webpack、vite`）
- 包管理工具（`npm、yarn、pnpm`）
- 选择模板源（`gitee最快、github最新、CLI 内置模板等`）
- 选择模板（`默认模板等`）
- 等等

如图所示：

![初始化](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/39c0a3a5d0464de9a119517dbd3a0567~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1720802062&x-orig-sign=kdUsyTvS%2FEmMFc%2BruCbjv6ZMPkU%3D)

我们重点讲述以下几个方法

*   `askProjectName` 询问项目名称
*   `askTemplateSource` 询问模板源
*   `fetchTemplates` 获取模板列表
*   `askTemplate` 询问模板

我们来看第一个 `askProjectName` 方法。

### 5.1 askProjectName 询问项目名称

```ts
askProjectName: AskMethods = function (conf, prompts) {
    if ((typeof conf.projectName) !== 'string') {
      prompts.push({
        type: 'input',
        name: 'projectName',
        message: '请输入项目名称！',
        validate (input) {
          if (!input) {
            return '项目名不能为空！'
          }
          if (fs.existsSync(input)) {
            return '当前目录已经存在同名项目，请换一个项目名！'
          }
          return true
        }
      })
    } else if (fs.existsSync(conf.projectName!)) {
      prompts.push({
        type: 'input',
        name: 'projectName',
        message: '当前目录已经存在同名项目，请换一个项目名！',
        validate (input) {
          if (!input) {
            return '项目名不能为空！'
          }
          if (fs.existsSync(input)) {
            return '项目名依然重复！'
          }
          return true
        }
      })
    }
  }
```

后面的 `askDescription`、`askFramework`、`askFramework`、`askTypescript`、`askCSS`、`askCompiler`、`askNpm`，都是类似方法，就不再赘述了。

### 5.2 askTemplateSource 询问模板源

```ts
// packages/taro-cli/src/create/project.ts
import {
  chalk,
  DEFAULT_TEMPLATE_SRC,
  DEFAULT_TEMPLATE_SRC_GITEE,
  fs,
  getUserHomeDir,
  SOURCE_DIR,
  TARO_BASE_CONFIG,
  TARO_CONFIG_FOLDER
} from '@tarojs/helper'
```

导出的就是这些常量。

```ts
// packages/taro-helper/src/constants.ts
export const DEFAULT_TEMPLATE_SRC = 'github:NervJS/taro-project-templates#v4.0'
export const DEFAULT_TEMPLATE_SRC_GITEE = 'direct:https://gitee.com/o2team/taro-project-templates.git#v4.0'
export const TARO_CONFIG_FOLDER = '.taro3.7'
export const TARO_BASE_CONFIG = 'index.json'
export const TARO_GLOBAL_CONFIG_DIR = '.taro-global-config'
export const TARO_GLOBAL_CONFIG_FILE = 'index.json'
```

```ts
// packages/taro-cli/src/create/project.ts
askTemplateSource: AskMethods = async function (conf, prompts) {
    if (conf.template === 'default' || conf.templateSource) return

    const homedir = getUserHomeDir()
    const taroConfigPath = path.join(homedir, TARO_CONFIG_FOLDER)
    const taroConfig = path.join(taroConfigPath, TARO_BASE_CONFIG)

    let localTemplateSource: string

    // 检查本地配置
    if (fs.existsSync(taroConfig)) {
      // 存在则把模板源读出来
      const config = await fs.readJSON(taroConfig)
      localTemplateSource = config?.templateSource
    } else {
      // 不存在则创建配置
      await fs.createFile(taroConfig)
      await fs.writeJSON(taroConfig, { templateSource: DEFAULT_TEMPLATE_SRC })
      localTemplateSource = DEFAULT_TEMPLATE_SRC
    }
	const choices = [
		// 省略，拆分放到下方
	];
	if (localTemplateSource && localTemplateSource !== DEFAULT_TEMPLATE_SRC && localTemplateSource !== DEFAULT_TEMPLATE_SRC_GITEE) {
      choices.unshift({
        name: `本地模板源：${localTemplateSource}`,
        value: localTemplateSource
      })
    }
	// 省略部分代码，拆分放到下方
  }
```

简单来说：

*   就是判断本地是否存在配置 `~/.taro3.7/index.json`，如果存在则读取模板源，如果不存在则创建配置。创建配置时，默认模板源为 [github:NervJS/taro-project-templates#v4.0](https://github.com/NervJS/taro-project-templates/tree/v4.0)。
*   另外，如果本地模板源不是默认模板源，那么就把本地模板源作为选项，放在最前面，供用户选择。

其中，`~/.taro3.7/index.json` 内容格式如下：

```json
// ~/.taro3.7/index.json
{
    "remoteSchemaUrl": "https://raw.githubusercontent.com/NervJS/taro-doctor/main/assets/config_schema.json",
    "useRemoteSchema": true
}
```

```ts
// packages/taro-cli/src/create/project.ts
const choices = [
  {
    name: 'Gitee（最快）',
    value: DEFAULT_TEMPLATE_SRC_GITEE
  },
  {
    name: 'Github（最新）',
    value: DEFAULT_TEMPLATE_SRC
  },
  {
    name: 'CLI 内置默认模板',
    value: 'default-template'
  },
  {
    name: '自定义',
    value: 'self-input'
  },
  {
    name: '社区优质模板源',
    value: 'open-source'
  }
]

// 省略部分代码本地模板源的判断，在上方已经展示。

prompts.push({
  type: 'list',
  name: 'templateSource',
  message: '请选择模板源',
  choices
}, {
  type: 'input',
  name: 'templateSource',
  message: '请输入模板源！',
  askAnswered: true,
  when (answers) {
    return answers.templateSource === 'self-input'
  }
}, {
  type: 'list',
  name: 'templateSource',
  message: '请选择社区模板源',
  async choices (answers) {
    const choices = await getOpenSourceTemplates(answers.framework)
    return choices
  },
  askAnswered: true,
  when (answers) {
    return answers.templateSource === 'open-source'
  }
})
```

```ts
// packages/taro-cli/src/create/project.ts
async ask () {
	// 省略上半部分代码
	const answers = await inquirer.prompt<IProjectConf>(prompts)

    prompts = []
    const templates = await this.fetchTemplates(answers)
    await this.askTemplate(conf, prompts, templates)
    const templateChoiceAnswer = await inquirer.prompt<IProjectConf>(prompts)

    return {
      ...answers,
      ...templateChoiceAnswer
    }
}
```

我们继续来看 `fetchTemplates` 函数：

### 5.3 fetchTemplates 获取模板列表

```ts
// packages/taro-cli/src/create/project.ts
async fetchTemplates (answers: IProjectConf): Promise<ITemplates[]> {
  const { templateSource, framework, compiler } = answers
  this.conf.framework = this.conf.framework || framework || ''
  this.conf.templateSource = this.conf.templateSource || templateSource

  // 使用默认模版
  if (answers.templateSource === 'default-template') {
    this.conf.template = 'default'
    answers.templateSource = DEFAULT_TEMPLATE_SRC_GITEE
  }
  if (this.conf.template === 'default' || answers.templateSource === NONE_AVAILABLE_TEMPLATE) return Promise.resolve([])

  // 从模板源下载模板
  const isClone = /gitee/.test(this.conf.templateSource) || this.conf.clone
  const templateChoices = await fetchTemplate(this.conf.templateSource, this.templatePath(''), isClone)

  const filterFramework = (_framework) => {
    const current = this.conf.framework?.toLowerCase()

    if (typeof _framework === 'string' && _framework) {
      return current === _framework.toLowerCase()
    } else if (isArray(_framework)) {
      return _framework?.map(name => name.toLowerCase()).includes(current)
    } else {
      return true
    }
  }

  const filterCompiler = (_compiler) => {
    if (_compiler && isArray(_compiler)) {
      return _compiler?.includes(compiler)
    }
    return true
  }

  // 根据用户选择的框架筛选模板
  const newTemplateChoices: ITemplates[] = templateChoices
    .filter(templateChoice => {
      const { platforms, compiler } = templateChoice
      return filterFramework(platforms) && filterCompiler(compiler)
    })

  return newTemplateChoices
}
```

我们继续来看 `fetchTemplate` 函数，它主要做了以下几件事情：

#### 5.3.1 fetchTemplate 获取模板

```ts
// packages/taro-cli/src/create/fetchTemplate.ts
import * as path from 'node:path'

import { chalk, fs } from '@tarojs/helper'
import * as AdmZip from 'adm-zip'
import axios from 'axios'
import * as download from 'download-git-repo'
import * as ora from 'ora'

import { getTemplateSourceType, readDirWithFileTypes } from '../util'
import { TEMPLATE_CREATOR } from './constants'

export interface ITemplates {
  name: string
  value: string
  platforms?: string | string[]
  desc?: string
  compiler?: string[]
}

const TEMP_DOWNLOAD_FOLDER = 'taro-temp'

export default function fetchTemplate (templateSource: string, templateRootPath: string, clone?: boolean): Promise<ITemplates[]> {
  const type = getTemplateSourceType(templateSource)
  const tempPath = path.join(templateRootPath, TEMP_DOWNLOAD_FOLDER)
  let name: string
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async (resolve) => {
    // 下载文件的缓存目录
    if (fs.existsSync(tempPath)) await fs.remove(tempPath)
    await fs.mkdir(tempPath)

    const spinner = ora(`正在从 ${templateSource} 拉取远程模板...`).start()

    if (type === 'git') {
      name = path.basename(templateSource)
      download(templateSource, path.join(tempPath, name), { clone }, async error => {
        if (error) {
          console.log(error)
          spinner.color = 'red'
          spinner.fail(chalk.red('拉取远程模板仓库失败！'))
          await fs.remove(tempPath)
          return resolve()
        }
        spinner.color = 'green'
        spinner.succeed(`${chalk.grey('拉取远程模板仓库成功！')}`)
        resolve()
      })
    } else if (type === 'url') {
      // 省略这部分代码...
	  // 如果是 `url` 则用 `axios` 下载
    }
  }).then(async () => {
    // 拆解到下方讲述
  })
}

```

这个方法主要做了以下几件事情：

*   判断模板来源地址是 `git` 类型，那么使用 [download-git-repo](https://www.npmjs.com/package/download-git-repo) 下载远程仓库到本地。
*   判断模板来源地址是 `git` 类型，那么则用 `axios` 下载。

**then 部分**

```ts
// packages/taro-cli/src/create/fetchTemplate.ts
// then 部分
const templateFolder = name ? path.join(tempPath, name) : ''

// 下载失败，只显示默认模板
if (!fs.existsSync(templateFolder)) return Promise.resolve([])

const isTemplateGroup = !(
  fs.existsSync(path.join(templateFolder, 'package.json')) ||
  fs.existsSync(path.join(templateFolder, 'package.json.tmpl'))
)

if (isTemplateGroup) {
  // 模板组
  const files = readDirWithFileTypes(templateFolder)
    .filter(file => !file.name.startsWith('.') && file.isDirectory && file.name !== '__MACOSX')
    .map(file => file.name)
  await Promise.all(
    files.map(file => {
      const src = path.join(templateFolder, file)
      const dest = path.join(templateRootPath, file)
      return fs.move(src, dest, { overwrite: true })
    })
  )
  await fs.remove(tempPath)

  const res: ITemplates[] = files.map(name => {
    const creatorFile = path.join(templateRootPath, name, TEMPLATE_CREATOR)

    if (!fs.existsSync(creatorFile)) return { name, value: name }
    const { name: displayName, platforms = '', desc = '', compiler } = require(creatorFile)

    return {
      name: displayName || name,
      value: name,
      platforms,
      compiler,
      desc
    }
  })
  return Promise.resolve(res)
} else {
  // 单模板
  // 省略这部分代码，单模版和模板组逻辑基本一致，只是一个是多个一个是单个
}
```

这段代码主要做了以下几件事情：

*   判断是否是模板组，如果是模板组，则遍历 `packages/taro-cli/templates/taro-temp` 文件夹下的所有文件夹，并移动到 `packages/taro-cli` 目录下的 `templates` 文件夹。
*   不是模板组，则直接移动到 `packages/taro-cli/templates/taro-temp` 目录下单个模板到 `templates` 文件夹。

用一张图来展示：

![合并](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ece7568f049e4f778474f442d4d8d006~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1720802112&x-orig-sign=ol%2F7Cm2jqZ%2B%2BKirBBfs2pzOOtKM%3D)

### 5.4 askTemplate 询问用户选择模板

```ts
askTemplate: AskMethods = function (conf, prompts, list = []) {
    const choices = list.map(item => ({
      name: item.desc ? `${item.name}（${item.desc}）` : item.name,
      value: item.value || item.name
    }))

    if (!conf.hideDefaultTemplate) {
      choices.unshift({
        name: '默认模板',
        value: 'default'
      })
    }

    if ((typeof conf.template as 'string' | undefined) !== 'string') {
      prompts.push({
        type: 'list',
        name: 'template',
        message: '请选择模板',
        choices
      })
    }
  }
```

## 6. write 写入项目

```ts
// packages/taro-cli/src/create/project.ts
write (cb?: () => void) {
    this.conf.src = SOURCE_DIR
    const { projectName, projectDir, template, autoInstall = true, framework, npm } = this.conf as IProjectConf
    // 引入模板编写者的自定义逻辑
	// taro/packages/taro-cli/templates/default
    const templatePath = this.templatePath(template)
	// taro/packages/taro-cli/templates/default/template_creator.js
    const handlerPath = path.join(templatePath, TEMPLATE_CREATOR)
    const handler = fs.existsSync(handlerPath) ? require(handlerPath).handler : {}
    createProject({
      projectRoot: projectDir,
      projectName,
      template,
      npm,
      framework,
      css: this.conf.css || CSSType.None,
      autoInstall: autoInstall,
      templateRoot: getRootPath(),
      version: getPkgVersion(),
      typescript: this.conf.typescript,
      date: this.conf.date,
      description: this.conf.description,
      compiler: this.conf.compiler,
      period: PeriodType.CreateAPP,
    }, handler).then(() => {
      cb && cb()
    })
}
```

`write` 函数主要做了以下几件事情：

*   获取用户输入的参数，包括项目名称、项目目录、模板名称等。
*   引入模板编写者的自定义逻辑。
*   调用 `createProject` 函数，传入用户输入的参数和模板编写者的自定义逻辑。

调试截图

![taro-init-debugger-write.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/6c05f427b98f43339be267ec6beac9f6~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1720802182&x-orig-sign=iYwZbOrOqlf0FKb2OAhKLsVcHfw%3D)

### 6.1 template\_creator.js 默认模板中创建模板的自定义逻辑

```ts
// packages/taro-cli/templates/default/template_creator.js
const path = require('path')

function createWhenTs (err, params) {
  return !!params.typescript
}

function normalizePath (path) {
  return path.replace(/\\/g, '/').replace(/\/{2,}/g, '/')
}

const SOURCE_ENTRY = '/src'
const PAGES_ENTRY = '/src/pages'

const handler = {
  '/tsconfig.json': createWhenTs,
  '/types/global.d.ts': createWhenTs,
  '/types/vue.d.ts' (err, { framework, typescript }) {
    return ['Vue3'].includes(framework) && !!typescript
  },
  '/src/pages/index/index.jsx' (err, { pageDir = '', pageName = '', subPkg = '' }) {
    return {
      setPageName: normalizePath(path.join(PAGES_ENTRY, pageDir, pageName, 'index.jsx')),
      setSubPkgName: normalizePath(path.join(SOURCE_ENTRY, subPkg, pageDir, pageName, 'index.jsx'))
    }
  },
  // 省略部分代码
  '/_editorconfig' () {
    return { setPageName: `/.editorconfig` }
  },
  '/_env.development' () {
    return { setPageName: `/.env.development` }
  },
  '/_env.production' () {
    return { setPageName: `/.env.production` }
  },
  '/_env.test' () {
    return { setPageName: `/.env.test` }
  },
  '/_eslintrc' () {
    return { setPageName: `/.eslintrc` }
  },
  '/_gitignore' () {
    return { setPageName: `/.gitignore` }
  }
}

const basePageFiles = [
  '/src/pages/index/index.jsx',
  '/src/pages/index/index.vue',
  '/src/pages/index/index.css',
  '/src/pages/index/index.config.js'
]

module.exports = {
  handler,
  basePageFiles
}
```

`template_creator.js` 文件中的 `handler` 对象，定义了模板中创建的文件和自定义逻辑。
比如当 `!!params.typescript` 的时候，创建 `/tsconfig.json`、`types/global.d.ts` 文件。
当 \['Vue3'].includes(framework) && !!typescript 的时候，创建 `types/vue.d.ts` 文件。
根据 '/\_env.development' 文件创建 `.env.development`
等等

> 因为在一些场景下，`.` 开头文件会出现问题，所以改用 `_` 开头命名文件，创建时做一次替换。

## 7. 调试 rust 代码

我们从 `write` 函数调用 `createProject` 函数，可以看到 `createProject` 等是从  `@tarojs/binding` 引入的。

```ts
import { CompilerType, createProject, CSSType, FrameworkType, NpmType, PeriodType } from '@tarojs/binding'
```

简单来说就是：通过 [napi-rs](https://napi.rs/docs/introduction/getting-started) 把 `create_project` 函数暴露给 `nodejs` ，然后通过 `nodejs` 调用 `rust` 的 `create_project` 函数。

关于具体细节，用 `rust` 改造 `taro init` 这部分代码的作者 `@luckyadam`，写了一篇文章。可以参考学习[解锁前端新潜能：如何使用 Rust 锈化前端工具链](https://juejin.cn/post/7321410906426998810)，我在这里就不赘述了。

> 安装 `VSCode` 插件 [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) (方便跳转代码定义等) 和调试代码的插件 [CodeLLDB](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.lldb-dap)

更多 `rust` 学习，可参考 [rust 官网：rust-lang.org](https://www.rust-lang.org/zh-CN/)

我们在 `.vscode/launch.json` 中的原有的 `debug-init` 命令行调试配置，修改 `"type": "lldb",` 配置如下：

```json diff
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
-     "type": "node",
+     "type": "lldb",
      "request": "launch",
      "name": "debug-init",
      "sourceLanguages": ["rust"],
      "program": "node",
      "args": ["${workspaceFolder}/packages/taro-cli/bin/taro", "init", "test_pro"],
      "cwd": "${workspaceFolder}",
      "preLaunchTask": "build binding debug",
      "postDebugTask": "remove test_pro"
    }]
}
```

这样我们就可以在 `crates/native_binding/src/lib.rs` 文件中打断点调试了。

调试截图如下：

![taro-init-debugger-rust.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/be3872872be04cf3b1b947f120f40168~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1720802238&x-orig-sign=d6kCNyG7mlkm86CIJ4%2BTlMTDIQI%3D)

我们继续来看 `crates/native_binding/src/lib.rs` 文件中的 `create_project` （ `nodejs` 中调用则是 `createProject` ）函数：

## 8. rust create\_project 创建项目

```rs
// crates/native_binding/src/lib.rs
#[napi]
pub async fn create_project(
  conf: Project,
  handlers: HashMap<String, ThreadsafeFunction<CreateOptions>>,
) -> Result<()> {
  let project: Project = Project::new(
    conf.project_root,
    conf.project_name,
    conf.npm,
    conf.description,
    conf.typescript,
    conf.template,
    conf.css,
    conf.framework,
    conf.auto_install,
    conf.template_root,
    conf.version,
    conf.date,
    conf.compiler,
    conf.period,
  );
  let mut thread_safe_functions = HashMap::new();
  for (key, callback) in handlers {
    thread_safe_functions.insert(key, callback);
  }
  if let Err(e) = project.create(thread_safe_functions).await {
    println!("创建项目错误，原因如下：");
    println!("{:?}", e);
    return Err(napi::Error::from_reason(format!("{:?}", e)));
  }
  Ok(())
}
```

我们重点来看一下 `project.create` 函数：

### 8.1 create 创建文件

```rs
// crates/taro_init/src/project.rs
pub async fn create(
    &self,
    js_handlers: HashMap<String, ThreadsafeFunction<CreateOptions>>,
  ) -> anyhow::Result<()> {
    // 省略若干代码
    let all_files = get_all_files_in_folder(template_path.clone(), filter, None)?;
    let mut create_options = CreateOptions {
      // 省略若干代码
    };
    let all_files = all_files.iter().filter_map(|f| f.to_str()).collect::<Vec<_>>();
    println!();
    println!(
      "{} {}",
      style("✔").green(),
      format!(
        "{}{}",
        style("创建项目: ").color256(238),
        style(self.project_name.as_str()).color256(238).bold()
      )
    );
    creator
      .create_files(
        all_files.as_slice(),
        template_path.as_str(),
        &mut create_options,
        &js_handlers,
      )
      .await?;
    // 当选择 rn 模板时，替换默认项目名
    if self.template.eq("react-native") {
      change_default_name_in_template(
        &self.project_name,
        template_path.as_str(),
        project_path_str.as_str(),
      )
      .await?;
    }
    println!();
    init_git(&self.project_name, project_path_str.as_str())?;
    let auto_install = self.auto_install.unwrap_or(true);
    if auto_install {
      install_deps(&self.npm, || self.call_success()).await?;
    } else {
      self.call_success();
    }
    Ok(())
  }
```

`create` 主要做了以下几件事情：

1.  创建项目目录
2.  创建项目文件 `creator.create_files`
3.  初始化 `git init_git`
4.  安装依赖 `install_deps`

如下图所示：

![初始化2，创建项目](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/c8156afa9d55465e972c46b6a5b58776~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1720802271&x-orig-sign=iLgq%2BRMqK52qMTHnjhVGO%2BzKRYM%3D)

接着我们重点来看一下 `creator.create_files` 函数：

### 8.2 creator.create\_files

```rs
// crates/taro_init/src/creator.rs
pub async fn create_files(
    &self,
    files: &[&str],
    template_path: &str,
    options: &mut CreateOptions,
    js_handlers: &HashMap<String, ThreadsafeFunction<CreateOptions>>,
  ) -> anyhow::Result<()> {
    let current_style_ext = STYLE_EXT_MAP
      .get(&options.css.unwrap_or(CSSType::None))
      .unwrap_or(&"css");
    options.css_ext = Some(current_style_ext.to_string());
    for file in files {
      // 省略若干代码...
      if need_create_file {
        // 省略若干代码...
        let dest_path = self.get_destination_path(&[&dest_re_path]);
        let from_path: String = PathBuf::from(file_relative_path)
          .to_string_lossy()
          .to_string();
        self
          .tempate(from_path.as_str(), dest_path.as_str(), &options.clone())
          .await?;
        println!(
          "{} {}",
          style("✔").green(),
          style("创建文件: ".to_owned() + dest_path.as_str()).color256(238)
        );
      }
    }
    Ok(())
  }
```

我们重点来看一下 `creator.tempate` 函数：

### 8.3 creator.tempate 模板

```rs
// crates/taro_init/src/creator.rs

pub async fn tempate(
    &self,
    from_path: &str,
    dest_path: &str,
    options: &CreateOptions,
  ) -> anyhow::Result<()> {
    if MEDIA_REGEX.is_match(from_path) {
      let dir_name = PathBuf::from(dest_path)
        .parent()
        .unwrap()
        .to_string_lossy()
        .to_string();
      async_fs::create_dir_all(&dir_name)
        .await
        .with_context(|| format!("文件夹创建失败: {}", dir_name))?;
      async_fs::copy(from_path, dest_path)
        .await
        .with_context(|| format!("文件复制失败: {}", from_path))?;
      return Ok(());
    }
    generate_with_template(from_path, dest_path, options).await?;
    Ok(())
  }
```

我们重点来看一下 `generate_with_template` 函数：

### 8.4 generate\_with\_template 根据数据渲染模板，生成文件

```rs
// crates/taro_init/src/utils.rs
pub async fn generate_with_template(from_path: &str, dest_path: &str, data: &impl serde::Serialize) -> anyhow::Result<()> {
  let form_template = async_fs::read(from_path).await.with_context(|| format!("文件读取失败: {}", from_path))?;
  let from_template = String::from_utf8_lossy(&form_template);
  let template = if from_template == "" {
    "".to_string()
  } else {
    HANDLEBARS.render_template(&from_template, data).with_context(|| format!("模板渲染失败: {}", from_path))?
  };
  let dir_name = Path::new(dest_path).parent().unwrap().to_string_lossy().to_string();
  async_fs::create_dir_all(&dir_name).await.with_context(|| format!("文件夹创建失败: {}", dir_name))?;
  let metadata = async_fs::metadata(from_path).await.with_context(|| format!("文件读取失败: {}", from_path))?;
  async_fs::write(dest_path, template).await.with_context(|| format!("文件写入失败: {}", dest_path))?;
  #[cfg(unix)]
  async_fs::set_permissions(dest_path, metadata.permissions()).await.with_context(|| format!("文件权限设置失败: {}", dest_path))?;
  Ok(())
}
```

taro init 的 rust代码中，安装依赖引入了[crates/handlebars rust包](https://crates.io/crates/handlebars)，类似 [npm 包管理官网](npmjs.com)。

经过 `HANDLEBARS.render_template(&from_template, data)` [handlebars-rust](https://github.com/sunng87/handlebars-rust) 根据数据渲染模板，生成文件。

比如：`handlebars` 模板中的 `app.config.js => app.config.ts`

如下图所示：

![handlebars-render.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/e1042eabca99460eac71bef4dbc67244~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1720802307&x-orig-sign=abucGTlxr008%2FkiUUgyawtPjfVI%3D)

更多 `handlebars` 用法，参考[handlebars官网](https://handlebarsjs.com/zh/installation/#%E7%94%A8%E6%B3%95)。

## 9. 总结

我们再来看下开头初始化项目的 `gif` 回顾下整个 `taro init` 过程：

![taro-init-gif-high.gif](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/d00b03d50cd34c1995c1f047ca5b3fef~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1720801922&x-orig-sign=rfbni%2BTeAF871T8a%2BQ1gwlf4cM8%3D)

根据前面两篇 [1. taro cli init](https://juejin.cn/post/7378363694939783178)、[2. taro 插件机制](https://juejin.cn/spost/7380195796208205824) 文章，我们可以得知：`taro init` 初始化命令，最终调用的是 `packages/taro-cli/src/presets/commands/init.ts` 文件中的 `ctx.registerCommand` 注册的 `init` 命令行的 `fn` 函数。

可以根据配置 `.vscode/launch.json` 文件调试 `taro init` `node` 部分代码和 `rust` 配置 `type:lldb` 代码。

```ts
export default (ctx: IPluginContext) => {
  ctx.registerCommand({
    name: 'init',
    optionsMap: {
		// 省略若干代码...
    },
    async fn (opts) {
      const Project = require('../../create/project').default
      const project = new Project({
		// 省略若干参数...
      })
      project.create()
    }
  })
}
```

```ts
// packages/taro-cli/src/create/project.ts
async create () {
	try {
		const answers = await this.ask()
		const date = new Date()
		this.conf = Object.assign(this.conf, answers)
		this.conf.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
		this.write()
	} catch (error) {
		console.log(chalk.red('创建项目失败: ', error))
	}
}
```

`ask` 命令行交互式选择使用的是 [inquirer](https://www.npmjs.com/package/inquirer) `inquirer.prompt` 实现。使用 [download-git-repo](https://www.npmjs.com/package/download-git-repo) 包（如果是 `url` 则用 `axios` 下载）把远程仓库下载到本地移动到`packages/taro-cli/templates`。

```ts
import { createProject } from '@tarojs/binding'
```

```ts
// packages/taro-cli/src/create/project.ts
write (cb?: () => void) {
    createProject({
    }, handler).then(() => {
      cb && cb()
    })
}
```

`write` 函数中的 `createProject` 创建文件部分是使用 [rust](https://www.rust-lang.org/zh-CN/) 实现的。使用 [napi-rs](https://napi.rs/docs/introduction/getting-started) 包绑定 `rust` 代码，给 `nodejs` 调用。

模板部分使用的是 [handlebars](https://handlebarsjs.com/zh/installation/#%E7%94%A8%E6%B3%95)，`rust` 使用的 [handlebars rust 包 crates/handlebars](https://crates.io/crates/handlebars) [rust](https://www.rust-lang.org/zh-CN/) 实现。

根据数据渲染 `handlebars` 模板，创建项目，生成文件。

再根据包管理器安装依赖。最后打印创建项目成功，请进入项目目录工作。

整个 `taro init` 创建新项目流程用一张图表示如图所示：

![taro init 创建新项目流程](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/daea13af8f3845abaf7e710df3392fc6~tplv-73owjymdk6-watermark.image?policy=eyJ2bSI6MywidWlkIjoiMTQxNTgyNjcwNDk3MTkxOCJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1721049696&x-orig-sign=hITt%2BMU9LwAlzQ%2BsWY2R2YzyuNE%3D)

***

**如果看完有收获，欢迎点赞、评论、分享、收藏支持。你的支持和肯定，是我写作的动力。也欢迎提建议和交流讨论**。

作者：常以**若川**为名混迹于江湖。所知甚少，唯善学。[若川的博客](https://ruochuan12.github.io)

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。
