---
highlight: darcula
theme: smartblue
---

## 1. 前言

大家好，我是[若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

截至目前（`2024-07-12`），`taro` 正式版是 `3.6.34`，[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。文章提到将于 2024 年第二季度，发布 `4.x`。所以我们直接学习 `4.x`，`4.x` 最新版本是 `4.0.0`。

[多编译内核生态下的极速研发体验](https://taro-docs.jd.com/blog/2023/03/29/D2_17) 官方博客有如下图。

![多编译内核架构](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/85718d9f74004f45910a2c7459f999ab~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=960&h=540&s=363552&e=png&b=030617)

计划写一个 `taro` 源码揭秘系列，欢迎持续关注。初步计划有如下文章：

*   [x] [Taro 源码揭秘 - 1. 揭开整个架构的入口 CLI => taro init 初始化项目的秘密](https://juejin.cn/post/7378363694939783178)
*   [x] [Taro 源码揭秘 - 2. 揭开整个架构的插件系统的秘密](https://juejin.cn/post/7380195796208205824)
*   [x] [Taro 源码揭秘 - 3. 每次创建新的 taro 项目（taro init）的背后原理是什么](https://juejin.cn/post/7390335741586931738)
*   [ ] cli build
*   [ ] 等等

学完本文，你将学到：

```bash
1. 学会通过两种方式调试 taro 源码
2. 学会入口 taro-cli 具体实现方式
3. 学会 cli init 命令实现原理，读取用户项目配置文件和用户全局配置文件
4. 学会 taro-service kernal （内核）解耦实现
5. 初步学会 taro 插件架构，学会如何编写一个 taro 插件
```

## 2. 准备工作

```bash
# 克隆项目
git clone https://github.com/NervJS/taro.git
# 切换到分支 4.x
git checkout 4.x
# 写文章时，项目当前 hash
git checkout a7fcf67b3acd065b85f2fdc8d999b9d2cb2f3058
# chore(release): publish 4.0.0 --tag=next
# 写文章时，当前版本
# 4.0.0
```

后续文章尽量会与 `taro` `4.x` 版本保持更新。

看一个开源项目，第一步应该是先看 [README.md](https://github.com/NervJS/taro.git) 再看 [贡献文档](https://github.com/NervJS/taro/blob/4.x/CONTRIBUTING.md) 和 `package.json`。

环境准备

> 需要安装 [Node.js 16](https://nodejs.org/en/)（建议安装 `16.20.0` 及以上版本）及 [pnpm 7](https://pnpm.io/zh/installation)

我使用的环境：`mac`，当然 `Windows` 一样可以。

一般用 [nvm](https://github.com/nvm-sh/nvm) 管理 `node` 版本。

```zsh
nvm install 18
nvm use 18
# 可以把 node 默认版本设置为 18，调试时会使用默认版本
nvm alias default 18

pnpm -v
# 9.1.1
node -v
# v18.20.2

cd taro
# 安装依赖
pnpm i
# 编译构建
pnpm build
```

```bash
# 删除根目录的 node_modules 和所有 workspace 里的 node_modules
$ pnpm run clear-all
# 对应的是：rimraf **/node_modules
# mac 下可以用 rm -rf **/node_modules
```

安装依赖可能会报错。

![pnpm-i-error.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/edef5301eec7477f9094f4e0cf035d24~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2906&h=474&s=170652&e=png&b=020202)

```bash
Failed to set up Chromium r1108766! Set "PUPPETEER_SKIP_DOWNLOAD" env variable to skip download.
```

通过谷歌等搜索引擎可以找到解决方法。

[stackoverflow](https://stackoverflow.com/questions/63187371/puppeteer-is-not-able-to-install-error-failed-to-set-up-chromium-r782078-set)

Mac : `export PUPPETEER_SKIP_DOWNLOAD='true'`
Windows: `SET PUPPETEER_SKIP_DOWNLOAD='true'`

pnpm build 完成，如下图所示：

![pnpm-build.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3b54216574f44c5088b50b48ccafa5a9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3314&h=968&s=296242&e=png&b=010101)

## 3. 调试

package.json

```json
// packages/taro-cli/package.json
{
	"name": "@tarojs/cli",
	"version": "4.0.0",
	"description": "cli tool for taro",
	"main": "index.js",
	"types": "dist/index.d.ts",
	"bin": {
		"taro": "bin/taro"
	}
}
```

### 3.1 入口文件 packages/taro-cli/bin/taro

```js
// packages/taro-cli/bin/taro

#! /usr/bin/env node

require("../dist/util").printPkgVersion();

const CLI = require("../dist/cli").default;

new CLI().run();
```

### 3.2 调试方法 1 JavaScript Debug Terminal

可参考我的文章[新手向：前端程序员必学基本技能——调试 JS 代码](https://juejin.cn/post/7030584939020042254)，或者[据说 90%的人不知道可以用测试用例(Vitest)调试开源项目(Vue3) 源码](https://juejin.cn/post/7212263304394981432)

简而言之就是以下步骤：

```bash
1. 找到入口文件设置断点
2. ctrl + `\`` (反引号) 打开终端，配置`JavaScript调试终端`
3. 在终端输入 `node` 相关命令，这里用 `init` 举例
4. 尽情调试源码
```

```bash
node ./packages/taro-cli/bin/taro init taro-init-debug
```

本文将都是使用 `init` 命令作为示例。

如下图所示：

![vscode 调试源码](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a0d04d62ce64702b5a558c6c3f1fa5d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3840&h=1982&s=636817&e=png&b=272727)

调试时应该会报错 `binding` `taro.[os-platform].node`。如下图所示：

![binding-error.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f1d20328bf24cc0993589f5da4adc95~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3666&h=1164&s=355043&e=png&b=262626)

运行等过程报错，不要慌。可能是我们遗漏了一些细节，贡献文档等应该会给出答案。所以再来看下 [贡献文档-10-rust-部分](https://github.com/NervJS/taro/blob/4.x/CONTRIBUTING.md#10-rust-%E9%83%A8%E5%88%86)

![binding-rust.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5761d804a3c943d587fa8f6ceb5b3a74~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2014&h=1084&s=244735&e=png&b=0e1218)

通过 [rustup](https://rustup.rs) 找到安装命令：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

安装完成后，执行 `pnpm run build:binding:debug` 或 `pnpm run binding:release` 编译出文件：`crates/native_binding/taro.darwin-arm64.node`。

就完美解决了，调试时不会报错了。

### 3.3 调试方式 2 配置 .vscode/launch.json

[taro 文档 - 单步调测配置](https://docs.taro.zone/docs/debug-config/)
写的挺好的，通过配置 `launch.json` 来调试，在此就不再赘述了。

不过补充一条：`launch.json` 文件可以添加一条 `"console": "integratedTerminal"`（集成终端）配置，就可以在调试终端输入内容。`args` 参数添加 `init` 和指定要初始化项目的文件夹。当然调试其他的时候也可以修改为其他参数。比如`args: ["build", "--type", "weapp", "--watch"]`。

```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"type": "node",
			"request": "launch",
			"name": "CLI debug",
			"program": "${workspaceFolder}/packages/taro-cli/bin/taro",
			// "cwd": "${project absolute path}",
			"args": [
				"init",
				"taro-init-debug",
			],
			"skipFiles": ["<node_internals>/**"],
			"console": "integratedTerminal"
		}
	]
}
```

[vscode nodejs 调试](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_node-console)

`console- 启动程序的控制台（internalConsole，integratedTerminal，externalTerminal）。`

![vscode-console.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e00d93ab56114dd388b480854b023481~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1558&h=468&s=138407&e=png&b=fefefe)

```js
// packages/taro-cli/bin/taro

#! /usr/bin/env node

require("../dist/util").printPkgVersion();

const CLI = require("../dist/cli").default;

new CLI().run();
```

我们跟着断点进入，入口文件中的第一句`require("../dist/util").printPkgVersion();` `printPkgVersion` 函数。

## 4. taro-cli/src/utils/index.ts

工具函数

```js
// packages/taro-cli/src/util/index.ts
import * as path from "path";

export function getRootPath(): string {
	return path.resolve(__dirname, "../../");
}

export function getPkgVersion(): string {
	return require(path.join(getRootPath(), "package.json")).version;
}

export function printPkgVersion() {
	console.log(`👽 Taro v${getPkgVersion()}`);
	console.log();
}
```

可以看出这句输出的是 `taro/packages/taro-cli/package.json` 的版本号。

```js
👽 Taro v4.0.0
```

我们继续跟着断点，进入第二第三句，可以进入到 `packages/taro-cli/src/cli.ts` 这个文件。

## 5. CLI 整体结构

`taro-cli` 对应的文件路径是：

> packages/taro-cli/src/cli.ts

我们先来看下这个文件的整体结构。`class CLI` 一个 appPath 属性（一般指 `taro` 工作目录），两个函数 `run` 和 `parseArgs`。

```js
// packages/taro-cli/src/cli.ts
export default class CLI {
	appPath: string;
	constructor(appPath) {
		this.appPath = appPath || process.cwd();
	}

	run() {
		return this.parseArgs();
	}

	async parseArgs() {
		const args = minimist(process.argv.slice(2), {
			alias: {
				// 省略一些别名设置 ...
			},
			boolean: ["version", "help", "disable-global-config"],
			default: {
				build: true,
			},
		});
		const _ = args._;
		// init、build 等
		const command = _[0];
		if (command) {
			// 省略若干代码
		} else {
			if (args.h) {
				// 输出帮助信息
				// 省略代码
			} else if (args.v) {
				// 输出版本号
				console.log(getPkgVersion());
			}
		}
	}
}
```

使用了[minimist](https://github.com/minimistjs/minimist)，参数解析工具。

同类工具还有：
[commander](https://github.com/tj/commander.js)，命令行工具。功能齐全的框架，提供类似 git 的子命令系统，自动生成帮助信息等。有很多知名的 `cli` 都是用的这个[commander](https://www.npmjs.com/browse/depended/commander)。比如：[`vue-cli`](https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli/bin/vue.js#L37)、[`webpack-cli`](https://github.com/webpack/webpack-cli/blob/master/packages/webpack-cli/src/webpack-cli.ts#L64) 和 [`create-react-app`](https://github.com/facebook/create-react-app/blob/main/packages/create-react-app/createReactApp.js#L59) 用的是这个。

[cac](https://github.com/cacjs/cac)，类似 `Commander.js` 但更轻巧、现代，支持插件。也有很多使用这个[cac npm](https://www.npmjs.com/package/cac?activeTab=dependents)，比如[`vite`](https://www.npmjs.com/package/vite?activeTab=dependencies) 使用的是这个。

[yargs](https://github.com/yargs/yargs)，交互式命令行工具。功能强大的框架，但显得过于臃肿。

`cli.run` 函数最终调用的是 `cli.parseArgs` 函数。我们接着来看 `parseArgs` 函数。

## 6. cli parseArgs

### 6.1 presets 预设插件集合

![parseArgs-1.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3421a9f42d9746aeaf31459396383e86~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3066&h=1988&s=618972&e=png&b=262626)

`presets` 对应的目录结构如图所示：

![presets.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ac775f2413a4b45b271302b4fc6e740~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=998&h=1692&s=172949&e=png&b=252525)

### 6.2 Config

![parseArgs-2.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fb6920f397db4fc78e73abc29afddab2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3414&h=1688&s=474740&e=png&b=252525)

`64-78` 行代码，代码量相对较少，就截图同时顺便直接放代码了。

```js
// packages/taro-cli/src/cli.ts
// 这里解析 dotenv 以便于 config 解析时能获取 dotenv 配置信息
const expandEnv = dotenvParse(appPath, args.envPrefix, mode);

const disableGlobalConfig = !!(
	args["disable-global-config"] ||
	DISABLE_GLOBAL_CONFIG_COMMANDS.includes(command)
);

const configEnv = {
	mode,
	command,
};
const config = new Config({
	appPath: this.appPath,
	disableGlobalConfig: disableGlobalConfig,
});
await config.init(configEnv);
```

`dotenvParse` 函数简单来说就是通过 [dotenv](https://github.com/motdotla/dotenv) 和 [dotenv-expand](https://github.com/motdotla/dotenv-expand) 解析 `.env`、`.env.development`、`.env.production` 等文件和变量的。

> `dotenv` 是一个零依赖模块，可将 `.env` 文件中的环境变量加载到 `process.env` 中。

我之前写过一篇 [面试官：项目中常用的 .env 文件原理是什么？如何实现？](https://juejin.cn/post/7045057475845816357)

接着我们来看 `Config` 类。

```ts
// packages/taro-service/src/Config.ts
export default class Config {
	appPath: string;
	configPath: string;
	initialConfig: IProjectConfig;
	initialGlobalConfig: IProjectConfig;
	isInitSuccess: boolean;
	disableGlobalConfig: boolean;

	constructor(opts: IConfigOptions) {
		this.appPath = opts.appPath;
		this.disableGlobalConfig = !!opts?.disableGlobalConfig;
	}
	async init(configEnv: { mode: string; command: string }) {
		// 代码省略
	}
	initGlobalConfig() {
		// 代码省略
	}
	getConfigWithNamed(platform, configName) {
		// 代码省略
	}
}
```

`Config` 构造函数有两个属性。
`appPath` 是 `taro` 项目路径。
`disableGlobalConfig` 是禁用全局配置。

接着我们来看 `Config` 类的实例上的 `init` 方法。

#### 6.2.1 config.init 初始化配置

读取的是 `config/index` `.ts` 或者 `.js` 后缀。
判断是否禁用 `disableGlobalConfig` 全局配置。不禁用则读取全局配置 `~/.taro-global-config/index.json`。

```ts
async init (configEnv: {
    mode: string
    command: string
  }) {
    this.initialConfig = {}
    this.initialGlobalConfig = {}
    this.isInitSuccess = false
    this.configPath = resolveScriptPath(path.join(this.appPath, CONFIG_DIR_NAME, DEFAULT_CONFIG_FILE))
    if (!fs.existsSync(this.configPath)) {
      if (this.disableGlobalConfig) return
      this.initGlobalConfig()
    } else {
      createSwcRegister({
        only: [
          filePath => filePath.indexOf(path.join(this.appPath, CONFIG_DIR_NAME)) >= 0
        ]
      })
      try {
        const userExport = getModuleDefaultExport(require(this.configPath))
        this.initialConfig = typeof userExport === 'function' ? await userExport(merge, configEnv) : userExport
        this.isInitSuccess = true
      } catch (err) {
        console.log(err)
      }
    }
  }
```

值得一提的是：

![createSwcRegister.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34924b795e2b4c8981ca0076eecfa8c4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2774&h=1958&s=381062&e=png&b=252525)

`createSwcRegister` 使用了 [`@swc/register`](https://www.npmjs.com/package/@swc/register) 来编译 `ts` 等转换成 `commonjs`。可以直接用 `require`。

> 使用 swc 的方法之一是通过 `require` 钩子。`require` 钩子会将自身绑定到 `node` 的 `require` 并自动动态编译文件。不过现在更推荐 [@swc-node/register](https://www.npmjs.com/package/@swc-node/register)。

```ts
export const getModuleDefaultExport = (exports) =>
	exports.__esModule ? exports.default : exports;
```

`this.initialConfig = typeof userExport === 'function' ? await userExport(merge, configEnv) : userExport`。这句就是 `config/index.ts` 支持函数也支持对象的实现。

接着我们来看 `Config` 类的实例上的 `initGlobalConfig` 方法。

#### 6.2.2 config.initGlobalConfig 初始化全局配置

读取配置 `~/.taro-global-config/index.json`。

```json
{
	"plugins": [],
	"presets": []
}
```

```ts
initGlobalConfig () {
    const homedir = getUserHomeDir()
    if (!homedir) return console.error('获取不到用户 home 路径')
    const globalPluginConfigPath = path.join(getUserHomeDir(), TARO_GLOBAL_CONFIG_DIR, TARO_GLOBAL_CONFIG_FILE)
    if (!fs.existsSync(globalPluginConfigPath)) return
    const spinner = ora(`开始获取 taro 全局配置文件： ${globalPluginConfigPath}`).start()
    try {
      this.initialGlobalConfig = fs.readJSONSync(globalPluginConfigPath) || {}
      spinner.succeed('获取 taro 全局配置成功')
    } catch (e) {
      spinner.stop()
      console.warn(`获取全局配置失败，如果需要启用全局插件请查看配置文件: ${globalPluginConfigPath} `)
    }
  }
```

`getUserHomeDir` 函数主要是获取用户的主页路径。比如 `mac` 中是 `/Users/用户名/`。
如果支持 `os.homedir()` 直接获取返回，如果不支持则根据各种操作系统和环境变量判断获取。

[ora](https://www.npmjs.com/package/ora) 是控制台的 loading 小动画。

> 优雅的终端旋转器

这里的是 `fs` 是 `@tarojs/helper` 。

> Taro 编译时工具库，主要供 CLI、编译器插件使用。

导出的 [fs-extra](https://www.npmjs.com/package/fs-extra)。

> fs-extra 添加本机模块中未包含的文件系统方法 fs，并为这些方法添加承诺支持 fs。它还用于 graceful-fs 防止 EMFILE 错误。它应该是 的替代品 fs。

使用 [fs.readJSONSync](https://github.com/jprichardson/node-fs-extra/blob/master/docs/readJson-sync.md) 同步读取 `json` 的方法。

文档中也有对这个全局参数的描述。

[全局插件或插件集配置](https://docs.taro.zone/docs/next/cli/#%E5%85%A8%E5%B1%80%E6%8F%92%E4%BB%B6%E6%88%96%E6%8F%92%E4%BB%B6%E9%9B%86%E9%85%8D%E7%BD%AE)

![global-config.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/808b984f1f754942b7035515b0234906~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2304&h=1000&s=288783&e=png&b=f5f7f9)

`Config` 部分我们基本分析完成，接下来我们学习 `Kernel` （内核）部分。

## 7. Kernel （内核）

```ts
// packages/taro-cli/src/cli.ts

// 省略若干代码
const kernel = new Kernel({
	appPath,
	presets: [path.resolve(__dirname, ".", "presets", "index.js")],
	config,
	plugins: [],
});
kernel.optsPlugins ||= [];
```

接着我们来看 `Kernel` 类， `Kernel` 类继承自 `Nodejs` 的事件模块`EventEmitter`。

```ts
// packages/taro-service/src/Kernel.ts
export default class Kernel extends EventEmitter {
	constructor(options: IKernelOptions) {
		super();
		this.debugger =
			process.env.DEBUG === "Taro:Kernel"
				? helper.createDebug("Taro:Kernel")
				: function () {};
		// taro 项目路径
		this.appPath = options.appPath || process.cwd();
		// 预设插件集合
		this.optsPresets = options.presets;
		// 插件
		this.optsPlugins = options.plugins;
		// 配置
		this.config = options.config;
		// 钩子，Map 存储
		this.hooks = new Map();
		// 存储方法
		this.methods = new Map();
		// 存储命令
		this.commands = new Map();
		// 存储平台
		this.platforms = new Map();
		this.initHelper();
		this.initConfig();
		this.initPaths();
		this.initRunnerUtils();
	}
}
```

```ts
// packages/taro-helper/src/index.ts
export const createDebug = (id: string) => require("debug")(id);
```

`this.debugger` 当没有配置 `DEBUG` 环境变量时，则 `debugger` 是空函数。配置了 `process.env.DEBUG === "Taro:Kernel"` 为则调用的 `npm` 包 [debug](https://www.npmjs.com/package/debug)。

> 一个仿照 `Node.js` 核心调试技术的微型 `JavaScript` 调试实用程序。适用于 `Node.js` 和 `Web` 浏览器。

我们接着看构造器函数里调用的几个初始化函数，基本都是顾名知义。

```ts
// packages/taro-service/src/Kernel.ts
initConfig () {
	this.initialConfig = this.config.initialConfig
	this.initialGlobalConfig = this.config.initialGlobalConfig
	this.debugger('initConfig', this.initialConfig)
}

initHelper () {
	this.helper = helper
	this.debugger('initHelper')
}

initRunnerUtils () {
	this.runnerUtils = runnerUtils
	this.debugger('initRunnerUtils')
}
```

```ts
// packages/taro-service/src/Kernel.ts
initPaths () {
	this.paths = {
		appPath: this.appPath,
		nodeModulesPath: helper.recursiveFindNodeModules(path.join(this.appPath, helper.NODE_MODULES))
	} as IPaths
	if (this.config.isInitSuccess) {
		Object.assign(this.paths, {
		configPath: this.config.configPath,
		sourcePath: path.join(this.appPath, this.initialConfig.sourceRoot as string),
		outputPath: path.resolve(this.appPath, this.initialConfig.outputRoot as string)
		})
	}
	this.debugger(`initPaths:${JSON.stringify(this.paths, null, 2)}`)
}
```

初始化后的参数，如 [`taro` 官方文档 - 编写插件 api](https://docs.taro.zone/docs/next/plugin-custom#api)中所示。

![initConfig.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/820cb9df210647b7bd495a7c2d3e6a0c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2148&h=1640&s=301305&e=png&b=fefefe)

### 7.1 cli kernel.optsPlugins 等

![parseArgs-3.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f5f628dcd6704742b6fedc23efe06e1f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2598&h=1898&s=502975&e=png&b=262626)

我们接下来看，`customCommand` 函数。

### 7.2 cli customCommand 函数

![parseArgs-4.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/38cecda1701c467b926bb95235aeb8b6~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2008&h=1770&s=288624&e=png&b=252525)

我们可以看到最终调用的是 `customCommand` 函数

```ts
// packages/taro-cli/src/commands/customCommand.ts
import { Kernel } from "@tarojs/service";

export default function customCommand(
	command: string,
	kernel: Kernel,
	args: { _: string[]; [key: string]: any }
) {
	if (typeof command === "string") {
		const options: any = {};
		const excludeKeys = [
			"_",
			"version",
			"v",
			"help",
			"h",
			"disable-global-config",
		];
		Object.keys(args).forEach((key) => {
			if (!excludeKeys.includes(key)) {
				options[key] = args[key];
			}
		});

		kernel.run({
			name: command,
			opts: {
				_: args._,
				options,
				isHelp: args.h,
			},
		});
	}
}
```

`customCommand` 函数移除一些 `run` 函数不需要的参数，最终调用的是 `kernal.run` 函数。

接下来，我们来看 `kernal.run` 函数的具体实现。

## 8. kernal.run 执行函数

```ts
// packages/taro-service/src/Kernel.ts
async run (args: string | { name: string, opts?: any }) {
	// 上半部分
    let name
    let opts
    if (typeof args === 'string') {
      name = args
    } else {
      name = args.name
      opts = args.opts
    }
    this.debugger('command:run')
    this.debugger(`command:run:name:${name}`)
    this.debugger('command:runOpts')
    this.debugger(`command:runOpts:${JSON.stringify(opts, null, 2)}`)
    this.setRunOpts(opts)
	// 拆解下半部分
}
```

`run` 函数中，开头主要是兼容两种参数传递。

## 9. kernal.setRunOpts

把参数先存起来。便于给插件使用。

```ts
// packages/taro-service/src/Kernel.ts
setRunOpts (opts) {
	this.runOpts = opts
}
```

[Taro 文档 - 编写插件 - ctx.runOpts](https://taro-docs.jd.com/docs/plugin-custom#ctxrunopts)

![ctx.runOpts.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10422bfaec0540039a1d86d4748f1d6b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2056&h=786&s=116172&e=png&b=ffffff)

我们接着来看，`run` 函数的下半部分。

```ts
// packages/taro-service/src/Kernel.ts
async run (args: string | { name: string, opts?: any }) {
    // 下半部分
    this.debugger('initPresetsAndPlugins')
    this.initPresetsAndPlugins()

    await this.applyPlugins('onReady')

    this.debugger('command:onStart')
    await this.applyPlugins('onStart')

    if (!this.commands.has(name)) {
      throw new Error(`${name} 命令不存在`)
    }

    if (opts?.isHelp) {
      return this.runHelp(name)
    }

    if (opts?.options?.platform) {
      opts.config = this.runWithPlatform(opts.options.platform)
      await this.applyPlugins({
        name: 'modifyRunnerOpts',
        opts: {
          opts: opts?.config
        }
      })
    }

    await this.applyPlugins({
      name,
      opts
    })
}
```

`run` 函数下半部分主要有三个函数：

```bash
1. this.initPresetsAndPlugins() 函数，顾名知义。初始化预设插件集合和插件。
2. this.applyPlugins() 执行插件
3. this.runHelp() 执行 命令行的帮助信息，例：taro init --help
```

我们分开叙述

> `this.initPresetsAndPlugins()`函数，因为此处涉及到的代码相对较多，容易影响主线流程。所以本文在此先不展开深入学习了。将放在下一篇文章中详细讲述。

执行 `this.initPresetsAndPlugins()` 函数之后。我们完全可以在调试时把 `kernal` 实例对象打印出来。

我们来看插件的注册。

## 10. kernal ctx.registerCommand 注册 init 命令

```ts
// packages/taro-cli/src/presets/commands/init.ts
import type { IPluginContext } from "@tarojs/service";

export default (ctx: IPluginContext) => {
	ctx.registerCommand({
		name: "init",
		optionsMap: {
			"--name [name]": "项目名称",
			"--description [description]": "项目介绍",
			"--typescript": "使用TypeScript",
			"--npm [npm]": "包管理工具",
			"--template-source [templateSource]": "项目模板源",
			"--clone [clone]": "拉取远程模板时使用git clone",
			"--template [template]": "项目模板",
			"--css [css]": "CSS预处理器(sass/less/stylus/none)",
			"-h, --help": "output usage information",
		},
		async fn(opts) {
			// init project
			const { appPath } = ctx.paths;
			const { options } = opts;
			const {
				// 省略若干参数
			} = options;
			const Project = require("../../create/project").default;
			console.log(Project, "Project");
			const project = new Project({
				projectName,
				projectDir: appPath,
				// 省略若干参数
			});

			project.create();
		},
	});
};
```

通过 `ctx.registerCommand` 注册了一个 `name` 为 `init` 的命令，会存入到内核 `Kernal` 实例对象的 `hooks` 属性中，其中 `ctx` 就是 `Kernal` 的实例对象。具体实现是 `fn` 函数。

## 11. kernal.applyPlugins 触发插件

```ts
// packages/taro-service/src/Kernel.ts
async applyPlugins (args: string | { name: string, initialVal?: any, opts?: any }) {
	// 上半部分
    let name
    let initialVal
    let opts
    if (typeof args === 'string') {
      name = args
    } else {
      name = args.name
      initialVal = args.initialVal
      opts = args.opts
    }
    this.debugger('applyPlugins')
    this.debugger(`applyPlugins:name:${name}`)
    this.debugger(`applyPlugins:initialVal:${initialVal}`)
    this.debugger(`applyPlugins:opts:${opts}`)
    if (typeof name !== 'string') {
      throw new Error('调用失败，未传入正确的名称！')
    }
	// 拆解到下半部分
}
```

上半部分，主要是适配两种传参的方式。

```ts
// packages/taro-service/src/Kernel.ts
async applyPlugins (args: string | { name: string, initialVal?: any, opts?: any }) {
	// 下半部分
	const hooks = this.hooks.get(name) || []
    if (!hooks.length) {
      return await initialVal
    }
    const waterfall = new AsyncSeriesWaterfallHook(['arg'])
    if (hooks.length) {
      const resArr: any[] = []
      for (const hook of hooks) {
        waterfall.tapPromise({
          name: hook.plugin!,
          stage: hook.stage || 0,
          // @ts-ignore
          before: hook.before
        }, async arg => {
          const res = await hook.fn(opts, arg)
          if (IS_MODIFY_HOOK.test(name) && IS_EVENT_HOOK.test(name)) {
            return res
          }
          if (IS_ADD_HOOK.test(name)) {
            resArr.push(res)
            return resArr
          }
          return null
        })
      }
    }
    return await waterfall.promise(initialVal)
}
```

`Taro` 的插件架构基于 [Tapable](https://github.com/webpack/tapable)。

这里使用了这个函数：`AsyncSeriesWaterfallHook`。

> The hook type is reflected in its class name. E.g., AsyncSeriesWaterfallHook allows asynchronous functions and runs them in series, passing each function’s return value into the next function.

简言之就是异步或者同步方法串联起来，上一个函数的结果作为下一个函数的参数依次执行。依次执行。

这时让我想起一句小虎队的爱的歌词。

> 喔，把你的心我的心串一串，串一株幸运草串一个同心圆...

举个例子用户写的插件中有多个钩子函数。比如 `onReday` 等可以有多个。

![插件方法.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9568a4f0b4384b00bd3c3b3728c24487~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1458&h=1246&s=201717&e=png&b=ffffff)

![插件 hooks](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/02635270495948dabba4bd7863bd6019~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2090&h=922&s=352202&e=png&b=ffffff)

`applyPlugins` 根据执行的命令 `init` 从 `hooks` 取出，串起来，然后依次执行插件的 `fn` 方法。

我们顺便来看一下，`kernal.runHelp` 的实现。

## 12. kernal.runHelp 命令帮助信息

在 `kernal.run` 函数中，有一个 `opts.isHelp` 的判断，执行 `kernal.runHelp` 方法。

```ts
// packages/taro-service/src/Kernel.ts
// run 函数
if (opts?.isHelp) {
	return this.runHelp(name);
}
```

以 `taro init --help` 为例。输出结果如下图所示：

![命令行 help.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4c29f1a7d502421691461aeeae9e026e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1704&h=758&s=253342&e=png&b=000000)

具体实现代码如下：

```ts
// packages/taro-service/src/Kernel.ts
runHelp (name: string) {
    const command = this.commands.get(name)
    const defaultOptionsMap = new Map()
    defaultOptionsMap.set('-h, --help', 'output usage information')
    let customOptionsMap = new Map()
    if (command?.optionsMap) {
      customOptionsMap = new Map(Object.entries(command?.optionsMap))
    }
    const optionsMap = new Map([...customOptionsMap, ...defaultOptionsMap])
    printHelpLog(name, optionsMap, command?.synopsisList ? new Set(command?.synopsisList) : new Set())
}
```

根据 `name` 从 `this.commands` `Map` 中获取到命令，输出对应的 `optionsMap` 和 `synopsisList`。

## 13. 总结

我们主要学了

1.  学会通过两种方式调试 taro 源码
2.  学会入口 taro-cli 具体实现方式
3.  学会 cli init 命令实现原理，读取用户项目配置文件和用户全局配置文件
4.  学会 taro-service kernal （内核）解耦实现
5.  初步学会 taro 插件架构，学会了如何编写一个 taro 插件

taro-cli 使用了[minimist](https://github.com/minimistjs/minimist)，命令行参数解析工具。

使用了 [`@swc/register`](https://www.npmjs.com/package/@swc/register) 读取 config/index .js 或者 .ts 配置文件和用 fs-extra [fs.readJSONSync](https://github.com/jprichardson/node-fs-extra/blob/master/docs/readJson-sync.md) 全局配置文件。

CLI 部分有各种预设插件集合 `presets`。

taro 单独抽离了一个 `tarojs/service` (`packages/taro-service`) 模块，包含 `Kernal` 内核、`Config`、`Plugin` 等。

taro 的基于 [Tapable](https://github.com/webpack/tapable) 的 `AsyncSeriesWaterfallHook` (把函数组合在一起串行) 实现的插件机制。各个插件可以分开在各个地方，达到解耦效果。非常值得我们学习。

简单做了一个本文的总结图。

![简单总结](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/541bfebea50f45fdb8e4e3acabfadc21~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3840&h=2160&s=904686&e=png&b=ffffff)

***

**如果看完有收获，欢迎点赞、评论、分享、收藏支持。你的支持和肯定，是我写作的动力**。

作者：常以**若川**为名混迹于江湖。所知甚少，唯善学。[若川的博客](https://ruochuan12.github.io)

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。
