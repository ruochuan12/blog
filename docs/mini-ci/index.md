---
highlight: darcula
theme: smartblue
---

# 还在用开发者工具上传小程序? 快来试试 miniprogram-ci 提效摸鱼

## 1. 前言

大家好，我是[若川](https://ruochuan12.github.io)。我倾力持续组织了一年[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（4.3k+人）第一的专栏，写有20余篇源码文章。

## 2. 前情回顾

**注意：文章是基于 [`tag v0.7.0`](https://github.com/ruochuan12/mini-ci/tree/0.7.0) 撰写。目前工具是 `0.12.0` 版本，后续 `mini-ci` 会持续更新，文章应该暂时不会更新**。

[本文提到的工具 mini-ci 已开源，求个 star^\_^](https://github.com/ruochuan12/mini-ci.git)

```bash
# 可全局安装
npm i @ruochuan/mini-ci -g
mini-ci -h
# 也可以不全局安装
npx @ruochuan/mini-ci -h
# 查看帮助信息，或者查看文档：https://github.com/ruochuan12/mini-ci.git，
```

估计有很多开发小程序的同学，还在使用微信开发者工具上传小程序。如果你是，那么这篇文章非常适合你。如果不是，同样也很适合你。

早在 2021 年 08 月，我写过一篇文章 [Vue 3.2 发布了，那尤雨溪是怎么发布 Vue.js 的？](https://juejin.cn/post/6997943192851054606)

`Vue 2.7` 如何发布跟`Vue 3.2`这篇文章类似，所以就不赘述了。

> `vuejs`发布的文件很多代码我们可以直接复制粘贴修改，优化我们自己发布的流程。比如写小程序，相对可能发布频繁，完全可以使用这套代码，配合[miniprogram-ci](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html 'miniprogram-ci')，再加上一些自定义，加以优化。

于是今天我们来开发这样的脚手架工具。

看完本文，你将学到：

```bash
1. 如何利用 release-it 提升版本号，自动打 tag，生成 changelog 等
2. npm init 原理
3. 如何写一个脚手架工具
 - 如何解析 Nodejs 命令行参数 minimist
 - 如何选择单选、多选 enquirer(prompt, MultiSelect)
 - 等等
```

先看看最终开发的效果。

支持的功能

![支持的功能](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/600f4161b25c4d62b47c2fffb8f267fd~tplv-k3u1fbpfcp-watermark.image?)

显示帮助信息

![显示帮助信息](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8bb61b337b4a4065ae669ba3738c8d53~tplv-k3u1fbpfcp-watermark.image?)

上传效果

![上传效果](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3fdedad23161405b9381daf272443f1f~tplv-k3u1fbpfcp-watermark.image?)

## 3. 关于为啥要开发这样的工具

> 关于小程序 `ci` 上传，再分享两篇文章。

> [基于 CI 实现微信小程序的持续构建](https://help.coding.net/docs/best-practices/ci/1minute/wechat-mini-program.html)

> [小打卡小程序自动化构建及发布的工程化实践](https://www.yuque.com/jinxuanzheng/gvhmm5/uy4qu9#8yQ8M) 虽然文章里不是最新的 `miniprogram-ci`，但这篇场景写得比较全面。

接着，我们先来看看 miniprogram-ci 官方文档。

## 4. miniprogram-ci 官方文档

[miniprogram-ci 文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)

### 4.1 上传

```js
const ci = require('miniprogram-ci');
(async () => {
 const project = new ci.Project({
  appid: 'wxsomeappid',
  type: 'miniProgram',
  projectPath: 'the/project/path',
  privateKeyPath: 'the/path/to/privatekey',
  ignores: ['node_modules/**/*'],
 });
 const uploadResult = await ci.upload({
  project,
  version: '1.1.1',
  desc: 'hello',
  setting: {
   es6: true,
  },
  onProgressUpdate: console.log,
 });
 console.log(uploadResult);
})();
```

### 4.2 预览

```js
const ci = require('miniprogram-ci');
(async () => {
 const project = new ci.Project({
  appid: 'wxsomeappid',
  type: 'miniProgram',
  projectPath: 'the/project/path',
  privateKeyPath: 'the/path/to/privatekey',
  ignores: ['node_modules/**/*'],
 });
 const previewResult = await ci.preview({
  project,
  desc: 'hello', // 此备注将显示在“小程序助手”开发版列表中
  setting: {
   es6: true,
  },
  qrcodeFormat: 'image',
  qrcodeOutputDest: '/path/to/qrcode/file/destination.jpg',
  onProgressUpdate: console.log,
  // pagePath: 'pages/index/index', // 预览页面
  // searchQuery: 'a=1&b=2',  // 预览参数 [注意!]这里的`&`字符在命令行中应写成转义字符`\&`
 });
 console.log(previewResult);
})();
```

## 5. Taro 小程序插件 @tarojs/plugin-mini-ci

如果使用 `Taro` 开发的小程序，可以直接使用。

具体如何使用参考文档，我在本文中就不赘述了。

[小程序持续集成 @tarojs/plugin-mini-ci](https://taro-docs.jd.com/taro/docs/plugin-mini-ci/)

我组织的[源码共读第 30 期](https://juejin.cn/post/7082662027143053342)读的就是这个插件，非常值得学习。[@tarojs/plugin-mini-ci 源码解读可以参考 @NewName 的源码文章](https://juejin.cn/post/7089819849257385997)

我体验下来的感觉有以下几点可以优化。

- 不支持指定机器人
- 不支持不打包时上传
- 不支持官方提供的更多配置
- 不支持选择多个小程序批量上传等等

如果有时间我可能给 `Taro` 提 `PR`，当然不一定会被合并。

## 6. uni-app 好像没有提供类似的插件

uni-app 好像没有提供类似的插件。需要自己动手，丰衣足食。

## 7. release-it 自动提升版本、打 tag、生成 changelog 等

于是我们自己动手，丰衣足食，写一个工具解决上面提到的问题，**支持 `Taro` 打包后的小程序和 `uni-app` 打包后的，还有原生小程序上传和预览**。

开发小工具之前，先介绍一些好用的工具。

据说很多小伙伴的项目，没有打 `tag`、没有版本的概念，没有生成 `changelog`，没有配置 `eslint`、`prettier`，没有 `commit` 等规范。

这些其实不难，`commit` 规范一般简单做法是安装 `npm i git-cz -D`，
在`package.json` 中加入如下脚本。

```json
{
 "scripts": {
  "commit": "git-cz"
 }
}
```

`git` 提交时使用 `npm run commit` 即可，其他就不赘述了。

release-it，自动提升版本号，自动打 `tag`，生成 `changelog` 等

[release-it 官网仓库](https://github.com/release-it/release-it)

```bash
npm init release-it
# 选择 .release-it.json 用下面的配置，复制粘贴到 .release-it.json 中。
# 再安装 changelog 插件
npm i @release-it/conventional-changelog -D
```

```json
{
 "github": {
  "release": false
 },
 "git": {
  "commitMessage": "release: v${version}"
 },
 "npm": {
  "publish": false
 },
 "hooks": {
  "after:bump": "echo 更新版本成功"
 },
 "plugins": {
  "@release-it/conventional-changelog": {
   "preset": "angular",
   "infile": "CHANGELOG.md"
  }
 }
}
```

这样配置后，可以 `npm run release` 执行 `release-it` 版本。
还支持 hooks 钩子，比如提升版本号后`"after:bump": "echo 更新版本成功"`，更多功能可以查看[release-it 官网仓库](https://github.com/release-it/release-it)。

### 7.1 npm init release-it 原理

为啥 `npm init` 也可以直接初始化一个项目，带着疑问，我们翻看 npm 文档。

[`npm init`](https://docs.npmjs.com/cli/v6/commands/npm-init)

`npm init` 用法：

```bash
npm init [--force|-f|--yes|-y|--scope]
npm init <@scope> (same as `npx <@scope>/create`)
npm init [<@scope>/]<name> (same as `npx [<@scope>/]create-<name>`)
```

`npm init <initializer>` 时转换成 `npx` 命令：

```bash
npm init foo -> npx create-foo
npm init @usr/foo -> npx @usr/create-foo
npm init @usr -> npx @usr/create
```

看完文档，我们也就理解了：

**运行 `npm init release-it` => 相当于 `npx create-release-it`**

[create-release-it](https://github.com/release-it/create-release-it)

`npm init release-it` 原理其实就是 `npx create-release-it`
选择一些配置，生成 `.release-it.json` 或者 `package.json` 的 `release-it` 配置。

再写入命令`release` 配置到 `package.json`。

```json
{
 "scripts": {
  "release": "release-it"
 }
}
```

最后执行 `npm install release-it --save-dev`
也就是源码里的 `await execa('npm', ['install', 'release-it', '--save-dev'], { stdio: 'inherit' });`。

[这行源码位置](https://github.com/release-it/create-release-it/blob/master/index.js#L120)

## 8. 小程序上传工具实现主流程

需要支持多选，那肯定得遍历数组。

```js
// 代码只是关键代码，完整的可以查看 https://github.com/ruochuan12/mini-ci/blob/0.7.0/src/index.js
(async () => {
 for (const mpConfigItem of mpConfigList) {
  try {
   const res = await main({});
  } catch (err) {
   console.log('执行失败', err);
  }
 }
})();
```

`main` 函数

```js
const { green, bold } = require('kolorist');
const step = (msg) => console.log(bold(green(`[step] ${msg}`)));
async function main(options = {}) {
 const project = new ci.Project(lastProjectOptions);
 if (upload) {
  step('开始上传小程序...');
  const uploadResult = await ci.upload(lastUploadOptions);
  console.log('uploadResult', uploadResult);
 }
 if (preview) {
  step('开始生成预览二维码...');
  const previewResult = await ci.preview(lastPreviewOptions);
  console.log('previewResult', previewResult);
 }
}
```

### 8.1 添加功能支持指定参数

使用 [minimist](https://github.com/minimist/minimist) 解析命令行参数。

```js
const getParams = () => {
 const params = process.argv.slice(2);
 const paramsDefault = {
  default: {
   robot: 1,
   preview: false,
   upload: false,
   // 空跑，不执行
   dry: false,
   // 根据配置，单选还是多选来上传小程序
   useSelect: false,
   useMultiSelect: false,
   help: false,
   version: false,
  },
  alias: {
   u: 'upload',
   r: 'robot',
   v: 'version',
   d: 'dry',
   s: 'useSelect',
   m: 'useMultiSelect',
   p: 'preview',
   h: 'help',
  },
 };
 return require('minimist')(params, paramsDefault);
};

module.exports = {
 getParams,
};
```

### 8.2 支持读取项目的 `package.json` 的 `version`，也支持读取自定义`version`

[kolorist](https://github.com/marvinhagemeister/kolorist) 颜色输出。

```js
const { red, bold } = require('kolorist');
const getVersion = () => {
 let version;
 try {
  version = require(`${packageJsonPath}/package.json`).version;
 } catch (e) {
  console.log(e);
  console.log(
   red(
    bold(
     '未设置 version , 并且未设置 package.json 路径，无法读取 version',
    ),
   ),
  );
 }
 return version;
};

module.exports = {
 getVersion,
};
```

### 8.3 版本描述 支持指定 git commit hash 和作者

`git rev-parse --short HEAD` 读取 `git` 仓库最近一次的 `commit hash`。

`parse-git-config` 可以读取 `.git/config` 配置。

```js
// const path = require('path');
const { execSync } = require('child_process');
const parseGitConfig = require('parse-git-config');
const getDesc = (projectPath, version) => {
 // 获取最新 git 记录 7位的 commit hash
 let gitCommitHash = 'git commit hash 为空';
 try {
  gitCommitHash = execSync('git rev-parse --short HEAD', {
   cwd: projectPath,
  })
   .toString()
   .trim();
 } catch (e) {
  console.warn('获取 git commit hash 失败');
  console.warn(e);
 }

 // 获取项目的git仓库的 user.name
 let userName = '默认';
 try {
  const {
   user: { name = '默认' },
  } = parseGitConfig.sync({
   cwd: projectPath,
   path: '.git/config',
  });
  userName = name;
 } catch (e) {
  console.warn('获取 .git/config user.name 失败');
  console.warn(e);
 }

 const desc = `v${version} - ${gitCommitHash} - by@${userName}`;
 return desc;
};

module.exports = getDesc;
```

### 8.4 读取配置 wx.config.js 配置（更推荐）

当前也支持读取 `.env` 配置。读取 `.env` 配置，可以采用 [`dotenv`](https://github.com/motdotla/dotenv)。关于 dotenv 的原理，可以看我之前写过的文章[面试官：项目中常用的 .env 文件原理是什么？如何实现？](https://juejin.cn/post/7045057475845816357)

但 `wx.config.js` 可以配置更多东西而且更灵活。所以更推荐。

感兴趣的可以研究 `vue-cli` 是如何读取 `vue.config.js` 配置的。围绕工作相关的学习，往往收益更大。

```js
// 读取 wx.config.js 配置
const loadWxconfig = (cwd) => {
 try {
  return require(path.join(cwd, 'wx.config.js'));
 } catch (e) {
  return {
   error: '未配置 wx.config.js 文件',
  };
 }
};

const parseEnv = () => {
 const cwd = process.cwd();

 let parsed = {};
 let wxconfig = loadWxconfig(cwd);
 if (wxconfig.error) {
  let dotenvResult = require('dotenv').config({
   path: path.join(cwd, './.env'),
  });

  parsed = dotenvResult.parsed;
  if (dotenvResult.error) {
   throw error;
  }
 } else {
  parsed = wxconfig;
 }
 // 代码有省略
};
```

### 8.5 支持选择多个小程序

我们可以用 [enquirer](https://github.com/enquirer/enquirer) 来实现单选或者多选的功能。以下只是关键代码。
完整代码可以查看 [mini-ci/src/utils/getConfig.js 文件](https://github.com/ruochuan12/mini-ci/blob/0.7.0/src/utils/getConfig.js)。

```js
// 只是关键代码
const { prompt, MultiSelect } = require('enquirer');
const configPathList = fs.readdirSync(configPath);
const configPathListJson = configPathList.map((el) => {
 return require(`${configPath}/${el}`);
});
const { name } = await prompt({
 type: 'select',
 name: 'name',
 message: '请选择一个小程序配置',
 choices: configPathListJson,
});
result = configPathListJson.filter((el) => el.name === name);
return result;
```

### 8.6 支持多个批量上传

```js
// 只是关键代码
const { prompt, MultiSelect } = require('enquirer');
const configPathList = fs.readdirSync(configPath);
const configPathListJson = configPathList.map((el) => {
 return require(`${configPath}/${el}`);
});
const multiSelectPrompt = new MultiSelect({
 name: 'value',
 message: '可选择多个小程序配置',
 limit: 7,
 choices: configPathListJson,
});

try {
 const answer = await multiSelectPrompt.run();
 console.log('Answer:', answer);
 result = configPathListJson.filter((el) => answer.includes(el.name));
 return result;
} catch (err) {
 console.log('您已经取消');
 console.log(err);
 process.exit(1);
}
```

**后续可能接入 CI/CD、接入邮件提醒、接入钉钉、支持可视化操作等等**

### 8.7 更多如何使用可以参考文档

```bash
# 全局安装 mini-ci 工具，也可以不全局安装
npm i @ruochuan/mini-ci -g
mini-ci -h
npx @ruochuan/mini-ci -h
# 文档：https://github.com/ruochuan12/mini-ci.git
# 克隆腾讯开源的电商小程序
git clone https://github.com/ruochuan12/tdesign-miniprogram-starter-retail.git
# 切到分支 feature/release-it
git checkout feature/release-it
```

可以克隆我的另外一个小程序（腾讯开源的电商小程序）。比如 `projects` 中。

按照[微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)配置小程序密钥等，这样就能上传和预览了。如果没有微信小程序，可以自行免费开通个人的[微信小程序](https://mp.weixin.qq.com/)。

## 9. 总结

通过本文的学习，我们知道了以下知识。

```bash
1. 如何利用 release-it 提升版本号，自动打 tag，生成 changelog 等
2. npm init 原理
3. 如何写一个脚手架工具
 - 如何解析 Nodejs 命令行参数 minimist
 - 如何选择单选、多选 enquirer(prompt, MultiSelect)
 - 等等
```

我相信大家也能够自己动手实现公司类似要求的脚手架工具，减少发版时间，降本提效。

[本文提到的工具 mini-ci 已开源，求个 star^\_^](https://github.com/ruochuan12/mini-ci.git)

```bash
# 可全局安装
npm i @ruochuan/mini-ci -g
mini-ci -h
# 也可以不全局安装
npx @ruochuan/mini-ci -h
# 查看帮助信息，或者查看文档：https://github.com/ruochuan12/mini-ci.git，
```

**注意：文章是基于 [`tag v0.7.0`](https://github.com/ruochuan12/mini-ci/tree/0.7.0) 撰写。目前工具是 `0.12.0` 版本，后续 `mini-ci` 会持续更新，文章应该暂时不会更新**。

---

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)。我倾力持续组织了一年[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。

另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（4.2k+人）第一的专栏，写有20余篇源码文章。包含`jQuery`、`underscore`、`lodash`、`vuex`、`sentry`、`axios`、`redux`、`koa`、`vue-devtools`、`vuex4`、`koa-compose`、`vue 3.2 发布`、`vue-this`、`create-vue`、`玩具vite`、`create-vite` 等20余篇源码文章。
