# taro 源码 cli

## 1. 前言

大家好，我是[若川](https://juejin.cn/user/1415826704971918)，欢迎 `follow` [我的 github](https://github.com/ruochuan12)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（5.8k+人）第一的专栏，写有 30 余篇源码文章。

截止目前，`taro` 正式版是 `3.6.30`，[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。文章提到将于 2024 年第二季度，发布 `4.x`。所以我们直接学习 `4.x`，截至目前 `4.x` 最新版本是 `4.0.0-beta.75`。

taro 源码系列

## 2. 准备工作

```bash
# 克隆项目
git clone https://github.com/NervJS/taro.git
# 当前分支
git checkout 4.x
# 当前 hash
git checkout d08d4b7faa6773e4f14c31ecdb6b5ebdc8787c76
# 当前版本
# 4.0.0-beta.75
```

后续文章尽量会与 `taro` 版本保持更新。

看一个开源项目，第一步应该是先看 [README.md](https://github.com/NervJS/taro.git) 再看 [贡献文档](https://github.com/NervJS/taro/blob/4.x/CONTRIBUTING.md) 和 `package.json`。

环境准备

> 需要安装 [Node.js 16](https://nodejs.org/en/)（建议安装 `16.20.0` 及以上版本）及 [pnpm 7](https://pnpm.io/zh/installation)

我使用的环境：`mac pro m1 pro`，当然 `Windows` 一样可以。

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

![pnpm i error](./images/pnpm-i-error.png)

```bash
Failed to set up Chromium r1108766! Set "PUPPETEER_SKIP_DOWNLOAD" env variable to skip download.
```

通过谷歌等搜索引擎可以找到解决方法。

[stackoverflow](https://stackoverflow.com/questions/63187371/puppeteer-is-not-able-to-install-error-failed-to-set-up-chromium-r782078-set)

Mac : `export PUPPETEER_SKIP_DOWNLOAD='true'`
Windows: `SET PUPPETEER_SKIP_DOWNLOAD='true'`

pnpm build 完成，如下图所示：

![pnpm build 完成](./images/pnpm-build.png)

报错 binding
taro.[os-platform].node

![binding-error](./images/binding-error.png)

再来看下 [贡献文档-10-rust-部分](https://github.com/NervJS/taro/blob/4.x/CONTRIBUTING.md#10-rust-%E9%83%A8%E5%88%86)

![binding-rust](./images/binding-rust.png)

通过 [rustup](https://rustup.rs) 找到安装命令：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

`pnpm run build:binding:debug` 或 `pnpm run binding:release` 编译出文件：`crates/native_binding/taro.darwin-arm64.node`。

## 3. 调试

package.json

```json
// packages/taro-cli/package.json
{
	"name": "@tarojs/cli",
	"version": "4.0.0-beta.75",
	"description": "cli tool for taro",
	"main": "index.js",
	"types": "dist/index.d.ts",
	"bin": {
		"taro": "bin/taro"
	}
}
```

### 3.1 taro-cli/bin/taro

```js
#! /usr/bin/env node

require("../dist/util").printPkgVersion();

const CLI = require("../dist/cli").default;

new CLI().run();
```

[taro 文档 - 单步调测配置](https://docs.taro.zone/docs/debug-config/)

调试截图

```bash
node ./packages/taro-cli/bin/taro init ../taro-init-debug
```

### 3.2 .vscode/launch.json

```json
{
	// For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
	"version": "0.2.0",
	"configurations": [
		{
			"type": "node",
			"request": "launch",
			"name": "CLI debug",
			"program": "${workspaceFolder}/packages/taro-cli/bin/taro",
			// "cwd": "${project absolute path}",
			"cwd": "${workspaceFolder}",
			"args": ["init", "taro-debug-init"],
			"console": "integratedTerminal",
			// "args": [
			//   "build",
			//   "--type",
			//   "weapp",
			//   "--watch"
			// ],
			"skipFiles": ["<node_internals>/**"]
		}
	]
}
```

## 4. taro-cli/src/utils/index.ts

```js
// packages/taro-cli/src/util/index.ts
import * as path from "path";

export function getRootPath(): string {
	return path.resolve(__dirname, "../../");
}

export function getPkgVersion(): string {
	return require(path.join(getRootPath(), "package.json")).version;
}
```

输出 的是 `taro/packages/taro-cli/package.json` 的版本号

```js
👽 Taro v4.0.0-beta.75
```

## 5. taro-cli/src/cli.ts

```js
// taro/packages/taro-cli/src/cli.ts
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
			// 省略代码
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

[minimist](https://github.com/minimistjs/minimist)，参数解析工具。

同类工具还有：
[commander](https://github.com/tj/commander.js)，命令行工具。功能齐全的框架，提供类似 git 的子命令系统，自动生成帮助信息等。`vue-cli` 用的是这个。
[cac](https://github.com/cacjs/cac)，类似 Commander.js 但更轻巧、现代，支持插件。`vite` 使用的是这个。
[yargs](https://github.com/yargs/yargs)，交互式命令行工具。功能强大的框架，但显得过于臃肿。

### 5.1 parseArgs

```ts
export default class CLI {
	async parseArgs() {
		// ...省略若干代码
		const command = _[0];
		if (command) {
			const appPath = this.appPath;
			const presetsPath = path.resolve(__dirname, "presets");
			const commandsPath = path.resolve(presetsPath, "commands");
			const platformsPath = path.resolve(presetsPath, "platforms");
			const commandPlugins = fs.readdirSync(commandsPath);
			const targetPlugin = `${command}.js`;

			// 省略若干代码
			const configEnv = {
				mode,
				command,
			};
			const config = new Config({
				appPath: this.appPath,
				disableGlobalConfig: disableGlobalConfig,
			});
			await config.init(configEnv);

			const kernel = new Kernel({
				appPath,
				presets: [path.resolve(__dirname, ".", "presets", "index.js")],
				config,
				plugins: [],
			});
			kernel.optsPlugins ||= [];

			// 把内置命令插件传递给 kernel，可以暴露给其他插件使用
			kernel.cliCommandsPath = commandsPath;
			kernel.cliCommands = commandPlugins
				.filter((commandFileName) =>
					/^[\w-]+(\.[\w-]+)*\.js$/.test(commandFileName)
				)
				.map((fileName) => fileName.replace(/\.js$/, ""));

			switch (command) {
				case "inspect":
				case "build": {
					// 省略
				}
				case "init": {
					customCommand(command, kernel, {
						_,
						appPath,
						projectName: _[1] || args.name,
						description: args.description,
						typescript: args.typescript,
						framework: args.framework,
						compiler: args.compiler,
						npm: args.npm,
						templateSource: args["template-source"],
						clone: !!args.clone,
						template: args.template,
						css: args.css,
						h: args.h,
					});
					break;
				}
				default:
					customCommand(command, kernel, args);
					break;
			}
		}
	}
}
```

## Config

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

## Kernel

```ts
// packages/taro-service/src/Kernel.ts
export default class Kernel extends EventEmitter {
	constructor(options: IKernelOptions) {
		super();
		this.debugger =
			process.env.DEBUG === "Taro:Kernel"
				? helper.createDebug("Taro:Kernel")
				: function () {};
		this.appPath = options.appPath || process.cwd();
		this.optsPresets = options.presets;
		this.optsPlugins = options.plugins;
		this.config = options.config;
		this.hooks = new Map();
		this.methods = new Map();
		this.commands = new Map();
		this.platforms = new Map();
		this.initHelper();
		this.initConfig();
		this.initPaths();
		this.initRunnerUtils();
	}
}
```

## 5.2 customCommand

```js
// taro/packages/taro-cli/src/commands/customCommand.ts
import { Kernel } from "@tarojs/service";

export default function customCommand(
	command: string,
	kernel: Kernel,
	args: { _: string[], [key: string]: any }
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

## kernal.run

```ts
async run (args: string | { name: string, opts?: any }) {
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

    console.log(this, 'this')

    await this.applyPlugins({
      name,
      opts
    })
  }
```

### applyPlugins

```ts
async applyPlugins (args: string | { name: string, initialVal?: any, opts?: any }) {
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


### initPresetsAndPlugins

```ts
initPresetsAndPlugins () {
    const initialConfig = this.initialConfig
    const initialGlobalConfig = this.initialGlobalConfig
    const cliAndProjectConfigPresets = mergePlugins(this.optsPresets || [], initialConfig.presets || [])()
    const cliAndProjectPlugins = mergePlugins(this.optsPlugins || [], initialConfig.plugins || [])()
    const globalPlugins = convertPluginsToObject(initialGlobalConfig.plugins || [])()
    const globalPresets = convertPluginsToObject(initialGlobalConfig.presets || [])()
    this.debugger('initPresetsAndPlugins', cliAndProjectConfigPresets, cliAndProjectPlugins)
    this.debugger('globalPresetsAndPlugins', globalPlugins, globalPresets)
    process.env.NODE_ENV !== 'test' &&
    helper.createSwcRegister({
      only: [
        ...Object.keys(cliAndProjectConfigPresets),
        ...Object.keys(cliAndProjectPlugins),
        ...Object.keys(globalPresets),
        ...Object.keys(globalPlugins)
      ]
    })
    this.plugins = new Map()
    this.extraPlugins = {}
    this.globalExtraPlugins = {}
    this.resolvePresets(cliAndProjectConfigPresets, globalPresets)
    this.resolvePlugins(cliAndProjectPlugins, globalPlugins)
  }

  resolvePresets (cliAndProjectPresets: IPluginsObject, globalPresets: IPluginsObject) {
    const resolvedCliAndProjectPresets = resolvePresetsOrPlugins(this.appPath, cliAndProjectPresets, PluginType.Preset)
    while (resolvedCliAndProjectPresets.length) {
      this.initPreset(resolvedCliAndProjectPresets.shift()!)
    }

    const globalConfigRootPath = path.join(helper.getUserHomeDir(), helper.TARO_GLOBAL_CONFIG_DIR)
    const resolvedGlobalPresets = resolvePresetsOrPlugins(globalConfigRootPath, globalPresets, PluginType.Plugin, true)
    while (resolvedGlobalPresets.length) {
      this.initPreset(resolvedGlobalPresets.shift()!, true)
    }
  }

  resolvePlugins (cliAndProjectPlugins: IPluginsObject, globalPlugins: IPluginsObject) {
    cliAndProjectPlugins = merge(this.extraPlugins, cliAndProjectPlugins)
    const resolvedCliAndProjectPlugins = resolvePresetsOrPlugins(this.appPath, cliAndProjectPlugins, PluginType.Plugin)

    globalPlugins = merge(this.globalExtraPlugins, globalPlugins)
    const globalConfigRootPath = path.join(helper.getUserHomeDir(), helper.TARO_GLOBAL_CONFIG_DIR)
    const resolvedGlobalPlugins = resolvePresetsOrPlugins(globalConfigRootPath, globalPlugins, PluginType.Plugin, true)

    const resolvedPlugins = resolvedCliAndProjectPlugins.concat(resolvedGlobalPlugins)

    while (resolvedPlugins.length) {
      this.initPlugin(resolvedPlugins.shift()!)
    }

    this.extraPlugins = {}
    this.globalExtraPlugins = {}
  }
	initPreset (preset: IPreset, isGlobalConfigPreset?: boolean) {
    this.debugger('initPreset', preset)
    const { id, path, opts, apply } = preset
    const pluginCtx = this.initPluginCtx({ id, path, ctx: this })
    const { presets, plugins } = apply()(pluginCtx, opts) || {}
    this.registerPlugin(preset)
    if (Array.isArray(presets)) {
      const _presets = resolvePresetsOrPlugins(this.appPath, convertPluginsToObject(presets)(), PluginType.Preset, isGlobalConfigPreset)
      while (_presets.length) {
        this.initPreset(_presets.shift()!, isGlobalConfigPreset)
      }
    }
    if (Array.isArray(plugins)) {
      isGlobalConfigPreset
        ? (this.globalExtraPlugins = merge(this.globalExtraPlugins, convertPluginsToObject(plugins)()))
        : (this.extraPlugins = merge(this.extraPlugins, convertPluginsToObject(plugins)()))
    }
  }

  initPlugin (plugin: IPlugin) {
    const { id, path, opts, apply } = plugin
    const pluginCtx = this.initPluginCtx({ id, path, ctx: this })
    this.debugger('initPlugin', plugin)
    this.registerPlugin(plugin)
    apply()(pluginCtx, opts)
    this.checkPluginOpts(pluginCtx, opts)
  }

  applyCliCommandPlugin (commandNames: string[] = []) {
    const existsCliCommand: string[] = []
    for (let i = 0; i < commandNames.length; i++) {
      const commandName = commandNames[i]
      const commandFilePath = path.resolve(this.cliCommandsPath, `${commandName}.js`)
      if (this.cliCommands.includes(commandName)) existsCliCommand.push(commandFilePath)
    }
    const commandPlugins = convertPluginsToObject(existsCliCommand || [])()
    helper.createSwcRegister({ only: [...Object.keys(commandPlugins)] })
    const resolvedCommandPlugins = resolvePresetsOrPlugins(this.appPath, commandPlugins, PluginType.Plugin)
    while (resolvedCommandPlugins.length) {
      this.initPlugin(resolvedCommandPlugins.shift()!)
    }
  }

  checkPluginOpts (pluginCtx, opts) {
    if (typeof pluginCtx.optsSchema !== 'function') {
      return
    }
    this.debugger('checkPluginOpts', pluginCtx)
    const joi = require('joi')
    const schema = pluginCtx.optsSchema(joi)
    if (!joi.isSchema(schema)) {
      throw new Error(`插件${pluginCtx.id}中设置参数检查 schema 有误，请检查！`)
    }
    const { error } = schema.validate(opts)
    if (error) {
      error.message = `插件${pluginCtx.id}获得的参数不符合要求，请检查！`
      throw error
    }
  }

  registerPlugin (plugin: IPlugin) {
    this.debugger('registerPlugin', plugin)
    if (this.plugins.has(plugin.id)) {
      throw new Error(`插件 ${plugin.id} 已被注册`)
    }
    this.plugins.set(plugin.id, plugin)
  }

  initPluginCtx ({ id, path, ctx }: { id: string, path: string, ctx: Kernel }) {
    const pluginCtx = new Plugin({ id, path, ctx })
    const internalMethods = ['onReady', 'onStart']
    const kernelApis = [
      'appPath',
      'plugins',
      'platforms',
      'paths',
      'helper',
      'runOpts',
      'runnerUtils',
      'initialConfig',
      'applyPlugins',
      'applyCliCommandPlugin'
    ]
    internalMethods.forEach(name => {
      if (!this.methods.has(name)) {
        pluginCtx.registerMethod(name)
      }
    })
    return new Proxy(pluginCtx, {
      get: (target, name: string) => {
        if (this.methods.has(name)) {
          const method = this.methods.get(name)
          if (Array.isArray(method)) {
            return (...arg) => {
              method.forEach(item => {
                item.apply(this, arg)
              })
            }
          }
          return method
        }
        if (kernelApis.includes(name)) {
          return typeof this[name] === 'function' ? this[name].bind(this) : this[name]
        }
        return target[name]
      }
    })
  }
```

---

**如果看完有收获，欢迎点赞、评论、分享支持。你的支持和肯定，是我写作的动力**。

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)，欢迎 `follow` [我的 github](https://github.com/ruochuan12)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（5.8k+人）第一的专栏，写有 30 余篇源码文章。

我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。

TODO:

[Taro 文档 - 编写插件](https://docs.taro.zone/docs/next/plugin-custom/)
