# taro 源码 cli

## 1. 前言

大家好，我是[若川](https://juejin.cn/user/1415826704971918)，欢迎 `follow` [我的 github](https://github.com/ruochuan12)。我倾力持续组织了3年多[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（5.7k+人）第一的专栏，写有30余篇源码文章。

截止目前，`taro` 正式版是 `3.6.30`，[Taro 4.0 Beta 发布：支持开发鸿蒙应用、小程序编译模式、Vite 编译等](https://juejin.cn/post/7330792655125463067)。文章提到将于2024年第二季度，发布4.x。所以我们直接学习 `4.x`。

## 2. 准备工作 && 调试代码

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

看一个开源项目，第一步应该是先看 [README.md](https://github.com/NervJS/taro.git) 再看 [贡献文档](https://github.com/NervJS/taro/blob/main/CONTRIBUTING.md) 和 `package.json`。

环境准备
> 需要安装 [Node.js 16](https://nodejs.org/en/)（建议安装 `16.20.0` 及以上版本）及 [pnpm 7](https://pnpm.io/zh/installation)

我使用的环境：`mac pro m1 pro`，当然 `Windows` 一样可以。

```zsh
nvm install 18
nvm use 18
# 建议把 node 默认版本设置为 18，调试时会使用默认版本
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

[taro 文档 - 单步调测配置](https://docs.taro.zone/docs/debug-config/)

报错 binding
taro.[os-platform].node

[贡献文档](https://github.com/NervJS/taro/blob/main/CONTRIBUTING.md)

### Rust 部分

Taro 仓库里有部分使用 Rust 开发的子包，在开发、调试、测试这些包时有不一样的流程。

Rust 代码存放在 `crates` 文件夹下，使用 Cargo workspace 管理，目前包括 NAPI bindings 和若干 SWC 插件。

开发前请使用 `rustup` 安装 Rust 工具链。

[rustup](https://www.rust-lang.org/learn/get-started)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

或者

[安装 cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html)

```sh
curl https://sh.rustup.rs -sSf | sh
```

#### NAPI bindings

在根目录执行 `pnpm build:binding:debug` 或 `pnpm build:binding:release` 命令，会在 `crates/native-binding` 文件夹中编译出 binding 文件 `taro.[os-platform].node`。

然后可以执行单元测试：

```bash
$ pnpm --filter @tarojs/binding run test
```

或结合调用方执行集成测试。

调试截图

---

**如果看完有收获，欢迎点赞、评论、分享支持。你的支持和肯定，是我写作的动力**。

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)，欢迎 `follow` [我的 github](https://github.com/ruochuan12)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（5.7k+人）第一的专栏，写有30余篇源码文章。

我倾力持续组织了3年多[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。
