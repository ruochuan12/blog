---
highlight: darcula
theme: smartblue
---

# Taro 源码揭秘 - 3. 揭开 taro init 初始化项目的背后秘密

## 1. 前言

大家好，我是[若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（5.8k+人）第一的专栏，写有几十篇源码文章。

截止目前（`2024-06-14`），`taro` 正式版是 `3.6.31`，[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。文章提到将于 2024 年第二季度，发布 `4.x`。所以我们直接学习 `4.x`，`4.x` 最新版本是 `4.0.0-beta.83`。

计划写一个 `taro` 源码揭秘系列，欢迎持续关注。初步计划有如下文章：

-   [x] [Taro 源码揭秘 - 1. 揭开整个架构的入口 CLI => taro init 初始化项目的秘密](https://juejin.cn/post/7378363694939783178)
-   [x] [Taro 源码揭秘 - 2. 揭开整个架构的插件系统的秘密](https://juejin.cn/spost/7380195796208205824)
-   [ ] init 初始化项目
-   [ ] cli build
-   [ ] 等等

学完本文，你将学到：

```bash
1. 如何合并预设插件集合和插件（CLI、用户项目（config/index.ts）、全局插件`/Users/用户名/.taro-global-config`）
2. 插件是如何注册的
3. 插件如何调用的
等等
```

关于如何调试代码等，参考第一篇文章。后续文章基本不再赘述。

```ts
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
        projectName,
        projectDir: appPath,
        npm,
        templateSource,
        clone,
        template,
        description,
        typescript,
        framework,
        compiler,
        hideDefaultTemplate,
        css
      })

      project.create()
    }
  })
}

```

## init

我们重点来看 `packages/taro-cli/src/create/project.ts` 的 `Project` 类的实现，和 `create` 方法。

### project.create

```ts
// packages/taro-cli/src/create/project.ts
export default class Project extends Creator {
	public rootPath: string;
	public conf: IProjectConfOptions;

	constructor(options: IProjectConfOptions) {
		super(options.sourceRoot);
		const unSupportedVer = semver.lt(process.version, "v7.6.0");
		if (unSupportedVer) {
			throw new Error("Node.js 版本过低，推荐升级 Node.js 至 v8.0.0+");
		}
		this.rootPath = this._rootPath;

		this.conf = Object.assign(
			{
				projectName: "",
				projectDir: "",
				template: "",
				description: "",
				npm: "",
			},
			options
		);
	}
	async create() {
		try {
			const answers = await this.ask();
			const date = new Date();
			this.conf = Object.assign(this.conf, answers);
			this.conf.date = `${date.getFullYear()}-${
				date.getMonth() + 1
			}-${date.getDate()}`;
			this.write();
		} catch (error) {
			console.log(chalk.red("创建项目失败: ", error));
		}
	}
}
```

`create` 函数主要做了三件事：
询问用户等。
把用户反馈的结果和之前的配置合并起来。
写入文件，初始化模板项目。
具体代码细节，所以本文在此先不展开深入学习了。我打算再单独写一篇文章来讲述。

## ask

```ts
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

## askProjectName

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

## askDescription

```ts
askDescription: AskMethods = function (conf, prompts) {
    if (typeof conf.description !== 'string') {
      prompts.push({
        type: 'input',
        name: 'description',
        message: '请输入项目介绍'
      })
    }
  }
```

## askFramework

```ts
askFramework: AskMethods = function (conf, prompts) {
    const frameworks = [
      {
        name: 'React',
        value: FrameworkType.React
      },
      {
        name: 'PReact',
        value: FrameworkType.Preact
      },
      {
        name: 'Vue3',
        value: FrameworkType.Vue3
      }
    ]

    if (typeof conf.framework !== 'string') {
      prompts.push({
        type: 'list',
        name: 'framework',
        message: '请选择框架',
        choices: frameworks
      })
    }
  }
```

## askTypescript

```ts
askTemplate: AskMethods = function (conf, prompts, list = []) {
    const choices = list.map(item => ({
      name: item.desc ? `${item.name}（${item.desc}）` : item.name,
      value: item.name
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

## askCSS

```ts
askCSS: AskMethods = function (conf, prompts) {
    const cssChoices = [
      {
        name: 'Sass',
        value: CSSType.Sass
      },
      {
        name: 'Less',
        value: CSSType.Less
      },
      {
        name: 'Stylus',
        value: CSSType.Stylus
      },
      {
        name: '无',
        value: CSSType.None
      }
    ]

    if (typeof conf.css !== 'string') {
      prompts.push({
        type: 'list',
        name: 'css',
        message: '请选择 CSS 预处理器（Sass/Less/Stylus）',
        choices: cssChoices
      })
    }
  }
```

## askCompiler

```ts
askCompiler: AskMethods = function (conf, prompts) {
    const compilerChoices = [
      {
        name: 'Webpack5',
        value: CompilerType.Webpack5
      },
      {
        name: 'Vite',
        value: CompilerType.Vite
      }
    ]

    if (typeof conf.compiler !== 'string') {
      prompts.push({
        type: 'list',
        name: 'compiler',
        message: '请选择编译工具',
        choices: compilerChoices
      })
    }
  }
```

## askNpm

```ts
askNpm: AskMethods = function (conf, prompts) {
    const packages = [
      {
        name: 'yarn',
        value: NpmType.Yarn
      },
      {
        name: 'pnpm',
        value: NpmType.Pnpm
      },
      {
        name: 'npm',
        value: NpmType.Npm
      },
      {
        name: 'cnpm',
        value: NpmType.Cnpm
      }
    ]

    if ((typeof conf.npm as string | undefined) !== 'string') {
      prompts.push({
        type: 'list',
        name: 'npm',
        message: '请选择包管理工具',
        choices: packages
      })
    }
  }
```

## askTemplateSource

```ts
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

    if (localTemplateSource && localTemplateSource !== DEFAULT_TEMPLATE_SRC && localTemplateSource !== DEFAULT_TEMPLATE_SRC_GITEE) {
      choices.unshift({
        name: `本地模板源：${localTemplateSource}`,
        value: localTemplateSource
      })
    }

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
  }
```

### getOpenSourceTemplates

```ts
function getOpenSourceTemplates (platform: string) {
  return new Promise((resolve, reject) => {
    const spinner = ora({ text: '正在拉取开源模板列表...', discardStdin: false }).start()
    axios.get('https://gitee.com/NervJS/awesome-taro/raw/next/index.json')
      .then(response => {
        spinner.succeed(`${chalk.grey('拉取开源模板列表成功！')}`)
        const collection = response.data
        switch (platform.toLowerCase()) {
          case 'react':
            return resolve(collection.react)
          default:
            return resolve([NONE_AVAILABLE_TEMPLATE])
        }
      })
      .catch(_error => {
        spinner.fail(chalk.red('拉取开源模板列表失败！'))
        return reject(new Error())
      })
  })
}
```

## fetchTemplates

```ts
async fetchTemplates (answers: IProjectConf): Promise<ITemplates[]> {
    const { templateSource, framework, compiler } = answers
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
      const current = framework.toLowerCase()
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

### fetchTemplate

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
      // url 模板源，因为不知道来源名称，临时取名方便后续开发者从列表中选择
      name = 'from-remote-url'
      const zipPath = path.join(tempPath, name + '.zip')
      const unZipPath = path.join(tempPath, name)
      axios.get<fs.ReadStream>(templateSource, { responseType: 'stream' })
        .then(response => {
          const ws = fs.createWriteStream(zipPath)
          response.data.pipe(ws)
          ws.on('finish', () => {
            // unzip
            const zip = new AdmZip(zipPath)
            zip.extractAllTo(unZipPath, true)
            const files = readDirWithFileTypes(unZipPath).filter(
              file => !file.name.startsWith('.') && file.isDirectory && file.name !== '__MACOSX'
            )

            if (files.length !== 1) {
              spinner.color = 'red'
              spinner.fail(chalk.red(`拉取远程模板仓库失败！\n${new Error('远程模板源组织格式错误')}`))
              return resolve()
            }
            name = path.join(name, files[0].name)

            spinner.color = 'green'
            spinner.succeed(`${chalk.grey('拉取远程模板仓库成功！')}`)
            resolve()
          })
          ws.on('error', error => { throw error })
        })
        .catch(async error => {
          spinner.color = 'red'
          spinner.fail(chalk.red(`拉取远程模板仓库失败！\n${error}`))
          await fs.remove(tempPath)
          return resolve()
        })
    }
  }).then(async () => {
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
      await fs.move(templateFolder, path.join(templateRootPath, name), { overwrite: true })
      await fs.remove(tempPath)

      let res: ITemplates = { name, value: name, desc: type === 'url' ? templateSource : '' }

      const creatorFile = path.join(templateRootPath, name, TEMPLATE_CREATOR)

      if (fs.existsSync(creatorFile)) {
        const { name: displayName, platforms = '', desc = '', compiler } = require(creatorFile)

        res = {
          name: displayName || name,
          value: name,
          platforms,
          compiler,
          desc: desc || templateSource
        }
      }

      return Promise.resolve([res])
    }
  })
}

```

## write

```ts
write (cb?: () => void) {
    this.conf.src = SOURCE_DIR
    const { projectName, projectDir, template, autoInstall = true, framework, npm } = this.conf as IProjectConf
    // 引入模板编写者的自定义逻辑
    const templatePath = this.templatePath(template)
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

## template

```ts
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
  '/src/pages/index/index.css' (err, { pageDir = '', pageName = '', subPkg = '' }) {
    return {
      setPageName: normalizePath(path.join(PAGES_ENTRY, pageDir, pageName, 'index.css')),
      setSubPkgName: normalizePath(path.join(SOURCE_ENTRY, subPkg, pageDir, pageName, 'index.css'))
    }
  },
  '/src/pages/index/index.vue' (err, { pageDir = '', pageName = '', subPkg = '' }) {
    return {
      setPageName: normalizePath(path.join(PAGES_ENTRY, pageDir, pageName, 'index.vue')),
      setSubPkgName: normalizePath(path.join(SOURCE_ENTRY, subPkg, pageDir, pageName, 'index.vue'))
    }
  },
  '/src/pages/index/index.config.js' (err, { pageDir = '', pageName = '', subPkg = '' }) {
    return {
      setPageName: normalizePath(path.join(PAGES_ENTRY, pageDir, pageName, 'index.config.js')),
      setSubPkgName: normalizePath(path.join(SOURCE_ENTRY, subPkg, pageDir, pageName, 'index.config.js'))
    }
  },
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

## rust createProject

```rs
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

## 总结

----

**如果看完有收获，欢迎点赞、评论、分享、收藏支持。你的支持和肯定，是我写作的动力**。

作者：常以**若川**为名混迹于江湖。所知甚少，唯善学。[若川的博客](https://ruochuan12.github.io)

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（5.8k+人）第一的专栏，写有几十篇源码文章。
