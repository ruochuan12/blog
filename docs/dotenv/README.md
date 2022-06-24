---
highlight: darcula
theme: smartblue
---

# 面试官：项目中常用的 .env 文件原理是什么？如何实现？

## 1. 前言
>大家好，我是[若川](https://lxchuan12.gitee.io)。[正在参加掘金年度人气作者活动，可以点此帮我投票](https://www.yuque.com/docs/share/9492e1e0-3499-47df-954d-b3f14487e9de)。**为了能帮助到更多对源码感兴趣、想学会看源码、提升自己前端技术能力的同学**。我倾力组织了[源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以加我微信 [ruochuan12](https://juejin.cn/pin/7005372623400435725) 参与。每周大家一起学习200行左右的源码，已进行5个月。

想学源码，极力推荐关注我写的专栏（目前2K人关注）[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093) 包含`jQuery`、`underscore`、`lodash`、`vuex`、`sentry`、`axios`、`redux`、`koa`、`vue-devtools`、`vuex4`、`koa-compose`、`vue 3.2 发布`、`vue-this`、`create-vue`、`玩具vite`等20余篇源码文章。

[本文仓库 https://github.com/lxchuan12/dotenv-analysis.git，求个star^_^](https://github.com/lxchuan12/dotenv-analysis.git)

[源码共读活动](https://juejin.cn/post/7079706017579139102) 每周一期，已进行到18期。于是搜寻各种值得我们学习，且代码行数不多的源码。[dotenv 主文件仅118行](https://github.com/motdotla/dotenv/blob/master/lib/main.js)，非常值得我们学习。

阅读本文，你将学到：
```bash
1. 学会 dotenv 原理和实现
2. 学会使用 fs模块 获取文件并解析
3. 等等
```

## 2. 环境准备

```bash
# 推荐克隆我的项目，保证与文章同步
git clone https://github.com/lxchuan12/dotenv-analysis.git
# npm i -g yarn
cd dotenv-analysis/dotenv && yarn i
# VSCode 直接打开当前项目
# code .
# 我写的例子都在 examples 这个文件夹中，可以启动服务本地查看调试
# 在 dotenv-analysis 目录下
node examples/index.js

# 或者克隆官方项目
git clone https://github.com/motdotla/dotenv.git
# npm i -g yarn
cd dotenv && yarn i
# VSCode 直接打开当前项目
# code .
```

如果需要对源码进行调试，可以看我的这篇文章：[新手向：前端程序员必学基本技能——调试JS代码](https://juejin.cn/post/7030584939020042254)，这里就不再赘述了。

## 3. dotenv 的作用

[dotenv](https://github.com/motdotla/dotenv)

`Dotenv` 是一个零依赖模块，可将 `.env` 文件中的环境变量加载到 `process.env` 中。

如果需要使用变量，则配合如下扩展包使用。

[dotenv-expand](https://github.com/motdotla/dotenv-expand)

众所周知，`.env` 文件在我们项目中非常常见，在 `vue-cli` 和 `create-react-app` 中都有使用。

[vue-cli .env](https://cli.vuejs.org/zh/guide/mode-and-env.html#%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F)

[create-react-app .env](https://create-react-app.dev/docs/adding-custom-environment-variables/#what-other-env-files-can-be-used)

## 4. .env 文件使用

我们项目中经常会用到`.env 文件`写法：

```bash
NAME=若川
AGE=18
BLOG=https://lxchuan12.gitee.io
MP_WEIXIN='若川视野'
ACTIVITY=每周一起学200行左右的源码共读活动
WEIXIN=加我微信 ruochuan12 参与
```

单从这个文件来看，我们可以知道有如下功能需要实现：

1. 读取 .env 文件
2. 解析 .env 文件拆成键值对的对象形式
3. 赋值到 process.env 上
4. 最后返回解析后得到的对象
## 5. 简单实现

根据分析问题，我们最终可以简单把代码实现如下：

```js
const fs = require('fs');
const path = require('path');

const parse = function parse(src){
    const obj = {};
    // 用换行符 分割
    // 比如
    /**
     * NAME=若川
     * AGE=18
     * MP_WEIXIN=若川视野
     * BLOG=https://lxchuan12.gitee.io
     * ACTIVITY=每周一起学200行左右的源码共读活动
     * WEIXIN=加我微信 ruochuan12 参与
    */
    src.toString().split('\n').forEach(function(line, index){
        // 用等号分割
        const keyValueArr = line.split('=');
        // NAME
        key = keyValueArr[0];
        // 若川
        val = keyValueArr[1] || '';
        obj[key] = val;
    });
    // { NAME: '若川', ... }
    return obj;
}

const config = function(){
    // 读取 node 执行的当前路径下的 .env 文件
    let dotenvPath = path.resolve(process.cwd(), '.env');
    // 按 utf-8 解析文件，得到对象
    // { NAME: '若川', ... }
    const parsed = parse(fs.readFileSync(dotenvPath, 'utf-8'));

    // 键值对形式赋值到 process.env 变量上，原先存在的不赋值
    Object.keys(parsed).forEach(function(key){
        if(!Object.prototype.hasOwnProperty.call(process.env, key)){
            process.env[key] = parsed[key];
        }
    });

    // 返回对象
    return parsed;
};

console.log(config());
console.log(process.env);

// 导出 config parse 函数
module.exports.config = config;
module.exports.parse = parse;
```

## 6. 继续完善 config 函数

简版的 config 函数还缺失挺多功能，比如：

```
可由用户自定义路径
可由用户自定义解析编码规则
添加 debug 模式
完善报错输出，用户写的 env 文件自由度比较大，所以需要容错机制。
```

根据功能，我们很容易实现以下代码：

```js
function resolveHome (envPath) {
    return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath
}

const config = function(options){
    // 读取 node 执行的当前路径下的 .env 文件
    let dotenvPath = path.resolve(process.cwd(), '.env');
    // utf8
    let encoding = 'utf8';
    // debug 模式，输出提示等信息
    let debug = false;
    // 对象
    if (options) {
        if (options.path != null) {
            // 解析路径
            dotenvPath = resolveHome(options.path)
        }
        // 使用配置的编码方式
        if (options.encoding != null) {
            encoding = options.encoding
        }
        // 有配置就设置为 true
        if (options.debug != null) {
            debug = true
        }
    }

    try {
        // 按 utf-8 解析文件，得到对象
        // { NAME: '若川', ... }
        // debug 传递给 parse 函数 便于
        const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug });

        // 键值对形式赋值到 process.env 变量上，原先存在的不赋值
        Object.keys(parsed).forEach(function(key){
            if(!Object.prototype.hasOwnProperty.call(process.env, key)){
                process.env[key] = parsed[key];
            } else if (debug) {
                console.log(`"${key}" is already defined in \`process.env\` and will not be overwritten`);
            }
        });

        // 返回对象
        return parsed;
    }
    catch (e) {
        return { error: e };
    }
};
```

`dotenv` 源码中，`parse` 函数主要是一些正则和单双引号、跨平台等细致处理。这里就暂时不阐述，读者朋友可以查看[dotenv 源码](https://github.com/motdotla/dotenv/blob/master/lib/main.js)。

## 7. 总结

鉴于文章不宜过长，文章只比较深入的分析了 `config` 函数。`parse` 函数目前没有深入分析。

一句话总结 `dotenv` 库的原理。**用 `fs.readFileSync` 读取 `.env` 文件，并解析文件为键值对形式的对象，将最终结果对象遍历赋值到 `process.env` 上**。

我们也可以不看 `dotenv` 源码，根据 `api` 倒推，自己来实现这样的功能。最终看看和  `dotenv` 源码本身有什么差别。这样也许更能锻炼自己。或者用 `ts` 重构它。

本文同时也给我们启发：围绕工作常用的技术包和库值得深入学习，做到**知其然，知其所以然**。

值得一提的是：`dotenv` 源码使用的是 `flow` 类型。vue2 源码也是用的 `flow`。vue3 源码改用 `ts`了。

最后可以持续关注我@若川。欢迎加我微信 [ruochuan12](https://juejin.cn/pin/7005372623400435725) 交流，参与 [源码共读](https://juejin.cn/pin/7005372623400435725) 活动，每周大家一起学习200行左右的源码，共同进步。