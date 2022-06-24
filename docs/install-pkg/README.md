---
highlight: darcula
theme: smartblue
---

# Vue团队核心成员开发的39行小工具 install-pkg 安装包，值得一学！

## 1. 前言

>大家好，我是[若川](https://lxchuan12.gitee.io)。**为了能帮助到更多对源码感兴趣、想学会看源码、提升自己前端技术能力的同学**。我倾力组织了[源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以加我微信 [ruochuan12](https://juejin.cn/pin/7005372623400435725) 参与，欢迎关注我的[公众号若川视野](https://lxchuan12.gitee.io)。每周大家一起学习200行左右的源码，共同进步，已进行4个月，很多人都表示收获颇丰。

想学源码，极力推荐关注我写的专栏（目前1.9K人关注）[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093) 包含`jQuery`、`underscore`、`lodash`、`vuex`、`sentry`、`axios`、`redux`、`koa`、`vue-devtools`、`vuex4`、`koa-compose`、`vue 3.2 发布`、`vue-this`、`create-vue`、`玩具vite`等20余篇源码文章。

[本文仓库 https://github.com/lxchuan12/install-pkg-analysis.git，求个star^_^](https://github.com/lxchuan12/install-pkg-analysis.git)

[源码共读活动](https://juejin.cn/post/7079706017579139102) 每周一期，已进行到16期。Vue团队核心成员 `Anthony Fu` 开发的 [install-pkg](https://github.com/antfu/install-pkg) 小工具，主文件源码仅39行，非常值得我们学习。

阅读本文，你将学到：
```bash
1. 如何学习调试源码
2. 如何开发构建一个 ts 的 npm 包
3. 如何配置 github action
4. 配置属于自己的 eslint 预设、提升版本号等
5. 学会使用 execa 执行命令
6. 等等
```

## 2. install-pkg 是什么

Install package programmatically. Detect package managers automatically (`npm`, `yarn` and `pnpm`).

以编程方式安装包。自动检测包管理器（`npm`、`yarn` 和 `pnpm`）。

```bash
npm i @antfu/install-pkg
```

```js
import { installPackage } from '@antfu/install-pkg'
await installPackage('vite', { silent: true })
```

我们看看[npmjs.com @antfu/install-pkg](https://www.npmjs.com/package/@antfu/install-pkg) 有哪些包依赖的这个包。

我们可以发现目前只有以下这两个项目使用了。

[unplugin-icons](https://www.npmjs.com/package/unplugin-icons)
[@chenyueban/lint](https://www.npmjs.com/package/%40chenyueban%2Flint)

我们克隆项目来看源码。
## 3 克隆项目

```bash
# 推荐克隆我的项目，保证与文章同步
git clone https://github.com/lxchuan12/install-pkg-analysis.git
# npm i -g pnpm
cd install-pkg-analysis/install-pkg && pnpm i
# VSCode 直接打开当前项目
# code .

# 或者克隆官方项目
git clone https://github.com/antfu/install-pkg.git
# npm i -g pnpm
cd install-pkg && pnpm i
# VSCode 直接打开当前项目
# code .
```

看源码一般先看 `package.json`，再看 `script`。

```js
{
    "name": "@antfu/install-pkg",
    "version": "0.1.0",
    "scripts": {
      "start": "esno src/index.ts"
    },
}
```

关于调试可以看我的这篇文章：[新手向：前端程序员必学基本技能——调试JS代码](https://juejin.cn/post/7030584939020042254)，这里就不再赘述了。

我们可以得知入口文件是 `src/index.ts`

`src`文件夹下有三个文件

```
src
- detect.ts
- index.ts
- install
```

接着我们看这些文件源码。
## 4. 源码

### 4.1 index.js

导出所有

```js
// src/install.ts
export * from './detect'
export * from './install'
```

我们来看 `install.ts` 文件，`installPackage` 方法。
### 4.2 installPackage 安装包

```js
// src/install.ts
import execa from 'execa'
import { detectPackageManager } from '.'

export interface InstallPackageOptions {
  cwd?: string
  dev?: boolean
  silent?: boolean
  packageManager?: string
  preferOffline?: boolean
  additionalArgs?: string[]
}

export async function installPackage(names: string | string[], options: InstallPackageOptions = {}) {
  const agent = options.packageManager || await detectPackageManager(options.cwd) || 'npm'
  if (!Array.isArray(names))
    names = [names]

  const args = options.additionalArgs || []

  if (options.preferOffline)
    args.unshift('--prefer-offline')

  return execa(
    agent,
    [
      agent === 'yarn'
        ? 'add'
        : 'install',
      options.dev ? '-D' : '',
      ...args,
      ...names,
    ].filter(Boolean),
    {
      stdio: options.silent ? 'ignore' : 'inherit',
      cwd: options.cwd,
    },
  )
}
```

支持安装多个，也支持指定包管理器，支持额外的参数。

其中 [github execa](https://github.com/sindresorhus/execa) 是执行脚本 
>Process execution for humans

也就是说：最终执行类似以下的脚本。

```bash
pnpm install -D --prefer-offine release-it react antd
```

我们接着来看 `detect.ts`文件 探测包管理器 `detectPackageManager` 函数如何实现的。
### 4.3 detectPackageManager 探测包管理器

根据当前目录锁文件，探测包管理器。

```js
// src/detect.ts
import path from 'path'
import findUp from 'find-up'

export type PackageManager = 'pnpm' | 'yarn' | 'npm'

const LOCKS: Record<string, PackageManager> = {
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
}

export async function detectPackageManager(cwd = process.cwd()) {
  const result = await findUp(Object.keys(LOCKS), { cwd })
  const agent = (result ? LOCKS[path.basename(result)] : null)
  return agent
}
```

其中 [find-up](https://github.com/sindresorhus/find-up#readme) 查找路径。

```bash
/
└── Users
    └── install-pkg
        ├── pnpm-lock.yaml
```

```js
import {findUp} from 'find-up';

console.log(await findUp('pnpm-lock.yaml'));
//=> '/Users/install-pkg/pnpm-lock.yaml'
```

`path.basename('/Users/install-pkg/pnpm-lock.yaml')` 则是 `pnpm-lock.yaml`。

所以在有`pnpm-lock.yaml`文件的项目中，`detectPackageManager` 函数最终返回的是 `pnpm`。

至此我们可以用一句话总结原理就是：通过锁文件自动检测使用何种包管理器（npm、yarn、pnpm），最终用 [execa](https://github.com/sindresorhus/execa) 执行类似如下的命令。

```bash
pnpm install -D --prefer-offine release-it react antd
```

看完源码，我们接着来解释下 `package.json` 中的 `scripts` 命令。
## 5. package.json script 命令解析

```js
{
    "name": "@antfu/install-pkg",
    "version": "0.1.0",
    "scripts": {
      "prepublishOnly": "nr build",
      "dev": "nr build --watch",
      "start": "esno src/index.ts",
      "build": "tsup src/index.ts --format cjs,esm --dts --no-splitting",
      "release": "bumpp --commit --push --tag && pnpm publish",
      "lint": "eslint \"{src,test}/**/*.ts\"",
      "lint:fix": "nr lint -- --fix"
    },
}
```

### 5.1 ni 神器

[github ni](https://github.com/antfu/ni)

我之前写过源码文章。

[尤雨溪推荐神器 ni ，能替代 npm/yarn/pnpm ？简单好用！源码揭秘！](https://juejin.cn/post/7023910122770399269)

自动根据锁文件 yarn.lock / pnpm-lock.yaml / package-lock.json 检测使用 yarn / pnpm / npm 的包管理器。

```bash
nr dev --port=3000

# npm run dev -- --port=3000
# yarn run dev --port=3000
# pnpm run dev -- --port=3000
```

```bash
nr
# 交互式选择脚本
# interactively select the script to run
# supports https://www.npmjs.com/package/npm-scripts-info convention
```


nci - clean install

```bash
nci
# npm ci
# 简单说就是不更新锁文件
# yarn install --frozen-lockfile
# pnpm install --frozen-lockfile
```

[pnpm install --frozen-lockfile](https://pnpm.io/zh/cli/install#--frozen-lockfile)

### 5.2 esno 运行 ts

[esno](https://github.com/antfu/esno#readme)

TypeScript / ESNext node runtime powered by esbuild

源码也不是很多。

```js
#!/usr/bin/env node

const spawn = require('cross-spawn')
const spawnSync = spawn.sync

const register = require.resolve('esbuild-register')

const argv = process.argv.slice(2)

process.exit(spawnSync('node', ['-r', register, ...argv], { stdio: 'inherit' }).status)
```

[esbuild-register](https://github.com/egoist/esbuild-register)
简单说：使用 esbuild 即时传输 JSX、TypeScript 和 esnext 功能

### 5.3 tsup 打包 ts

打包 `TypeScript` 库的最简单、最快的方法。

[tsup](https://github.com/egoist/tsup#readme)

### 5.4 bumpp 交互式提升版本号

[bumpp](https://github.com/antfu/bumpp)

[version-bump-prompt](https://github.com/JS-DevTools/version-bump-prompt)

交互式 CLI 可增加您的版本号等

### 5.5 eslint 预设

[eslint 预设](https://github.com/antfu/eslint-config)

```js
pnpm add -D eslint @antfu/eslint-config
```

添加 `.eslintrc` 文件

```js
// .eslintrc
{
  "extends": ["@antfu"],
  "rules": {}
}
```

之前看其他源码发现的也很好用的 eslint 工具 xo

[xo](https://github.com/xojs/xo)

>JavaScript/TypeScript linter (ESLint wrapper) with great defaults
>JavaScript/TypeScript linter（ESLint 包装器）具有很好的默认值

看完 scripts 命令解析，我们来看看 github action 配置。
## 6. github action workflows

对于github action 不熟悉的读者，可以看[阮一峰老师 GitHub Actions 入门教程](https://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html)

配置文件[workflows/release](https://github.com/antfu/install-pkg/blob/main/.github/workflows/release.yml)

构建历史[github action workflow](https://github.com/antfu/install-pkg/runs/3773517075?check_suite_focus=true)

```yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v2
        with:
          node-version: '14'
          registry-url: https://registry.npmjs.org/
      - run: npm i -g pnpm @antfu/ni
      - run: nci
      - run: nr test --if-present
      - run: npx conventional-github-releaser -p angular
        env:
          CONVENTIONAL_GITHUB_RELEASER_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

根据每次 tags 推送，执行。

```bash
# 全局安装 pnpm 和 ni
npm i -g pnpm @antfu/ni
```

```bash
# 如何存在 test 命令则执行
nr test --if-present
```

nci - clean install

```bash
nci
# npm ci
# 简单说就是不更新锁文件
# yarn install --frozen-lockfile
# pnpm install --frozen-lockfile
```

最后 `npx conventional-github-releaser -p angular`
[conventional-github-releaser](https://www.npmjs.com/package/conventional-github-releaser)

生成 `changelog`。

至此我们就学习完了 [install-pkg](https://github.com/antfu/install-pkg) 包。
## 7. 总结

整体代码比较简单。原理就是通过锁文件自动检测使用何种包管理器（npm、yarn、pnpm），最终用 [execa](https://github.com/sindresorhus/execa) 执行类似如下的命令。

```bash
pnpm install -D --prefer-offine release-it react antd
```

我们学到了：

```bash
1. 如何学习调试源码
2. 如何开发构建一个 ts 的 npm 包
3. 如何配置 github action
4. 配置属于自己的 eslint 预设、提升版本号等
5. 学会使用 execa 执行命令
6. 等等
```

还有各种依赖工具。

建议读者克隆 [我的仓库](https://github.com/lxchuan12/install-pkg-analysis.git) 动手实践调试源码学习。

最后可以持续关注我[@若川](https://juejin.cn/column/6960551178908205093)。欢迎加我微信 [ruochuan12](https://juejin.cn/pin/7005372623400435725) 交流，参与 [源码共读](https://juejin.cn/post/7079706017579139102) 活动，每周大家一起学习200行左右的源码，共同进步。
