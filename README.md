# 若川诚邀你加前端源码共读群，长期交流学习

>大家好，我是[若川](https://ruochuan12.github.io)。我倾力持续组织了一年[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有20余篇源码文章。

微信扫码或搜索「若川视野」<img src="./README-images/wechat-mini.jpg"  width="120px" height="120px" title="我的公众号若川视野，值得你关注" alt="我的公众号若川视野，值得你关注"/>关注我，专注前端技术分享。江西人，某不那么知名的陶瓷大学毕业生，目前在`杭州`从事`前端开发`工作。常以**若川**为名混迹于江湖。更详细的可以点击[关于我](https://ruochuan12.github.io/about/)<br>
我历时很久写了《**学习源码整体架构系列**》20余篇文章，包含[jQuery](https://ruochuan12.github.io/jquery)、[underscore](https://ruochuan12.github.io/underscore)、[lodash](https://ruochuan12.github.io/lodash)、[sentry](https://ruochuan12.github.io/sentry)、[vuex](https://ruochuan12.github.io/vuex)、[axios](https://ruochuan12.github.io/axios)、[koa](https://ruochuan12.github.io/koa)、[redux](https://ruochuan12.github.io/redux)、[vue-devtools](https://ruochuan12.github.io/open-in-editor)、[vuex4](https://ruochuan12.github.io/vuex4)、[vue3 工具函数](https://ruochuan12.github.io/vue-next-utils)、[vue3 发布](https://ruochuan12.github.io/vue-next-release)、[koa-compose](https://ruochuan12.github.io/koa-compose)、[vue-this](https://ruochuan12.github.io/vue-this)、[create-vue](https://ruochuan12.github.io/create-vue)、[玩具 vite](https://ruochuan12.github.io/vue-dev-server/)、[神器 ni](https://ruochuan12.github.io/ni/)、[vue-utils](https://ruochuan12.github.io/vue-utils/)、[open](https://ruochuan12.github.io/open/)、[promisify](https://ruochuan12.github.io/promisify/)、[element 初始化组件](https://ruochuan12.github.io/element-new/) 等源码，详细的写了我是如何看源码的，并且绘制了大量的关系图和原理图，应该算是比较好的**学习源码**的文章。[更多可参考我的这篇知乎回答：有哪些必看的js库？](https://mp.weixin.qq.com/s?__biz=MzA5MjQwMzQyNw==&mid=2650746362&idx=1&sn=afe3a26cdbde1d423aae4fa99355f369&chksm=88662e76bf11a760a7f0a8565b9e8d52f5e4f056dc2682f213eec6475127d71f6f1d203d6c3a&token=1233343990&lang=zh_CN#rd)

> 我的博客地址：[https://ruochuan12.github.io](https://ruochuan12.github.io)，**建议加个书签**，也可以百度搜索[**若川**](https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&tn=SE_Pclogo_6ysd4c7a&wd=%E8%8B%A5%E5%B7%9D&oq=%25E4%25BB%258A%25E6%2597%25A5%25E6%2596%25B0%25E9%25B2%259C%25E4%25BA%258B&rsv_pq=d5d2506b003fe4bc&rsv_t=9f60noZ4n6uVgTXKStiYbZUcvyfAkfkMCTUyAQKh6Bb2Kvsfkhq%2FmkhNpAfcTyhz2cKYaBIMw73l&rqlang=cn&rsv_enter=1&rsv_dl=tb&rsv_sug3=1&rsv_sug2=0&rsv_btype=t&inputT=1388&rsv_sug4=1388)，找到我。
>
另外，你可以在以下网站（点击图片跳转）关注我（你的关注是对我的肯定）：<br>

[![公众号](https://img.shields.io/badge/公众号-@若川视野-000000.svg?style=flat-square&logo=WeChat)](https://image-static.segmentfault.com/355/182/3551821948-5df888aa1dc88_articlex)
[![知乎](https://img.shields.io/badge/dynamic/json?color=0084ff&label=知乎@若川&query=%24.data.totalSubs&url=https%3A%2F%2Fapi.spencerwoo.com%2Fsubstats%2F%3Fsource%3Dzhihu%26queryKey%3Dlxchuan12)](https://www.zhihu.com/people/lxchuan12)
[![掘金](https://img.shields.io/badge/%E6%8E%98%E9%87%91-@%E8%8B%A5%E5%B7%9D-000000.svg?style=flat-square&logo=Juejin)](https://juejin.cn/user/1415826704971918/posts)
[![segmentfault](https://img.shields.io/badge/segmentfault-@%E8%8B%A5%E5%B7%9D-000000.svg?style=flat-square&logo=Segmentfault)](https://segmentfault.com/blog/lxchuan12)
[![语雀](https://img.shields.io/badge/语雀-@%E8%8B%A5%E5%B7%9D-000000.svg?style=flat-square&logo=Segmentfault)](https://www.yuque.com/lxchuan12/blog)
[![github](https://img.shields.io/github/stars/lxchuan12/blog?label=Stars&style=flat-square&logo=GitHub)](https://github.com/ruochuan12/blog)

我运营了公众号「若川视野」，关注回复「pdf」限时获取前端优质书籍pdf。**公众号经常更新，值得你关注学习，每天进步一点点**。

欢迎加我微信`ruochuan02`，拉你进「若川视野前端交流群」，**长期交流学习，经常有福利**~

## 知乎高赞回答

[若川知乎回答：做了两年前端开发，平时就是拿 Vue 写写页面和组件，简历的项目经历应该怎么写得好看？](https://www.zhihu.com/question/384048633/answer/1134746899)<br>
[若川知乎问答：有哪些必看的js库？](https://www.zhihu.com/question/429436558/answer/1575251772)<br>
[若川知乎回答：一年内的前端看不懂前端框架源码怎么办？](https://www.zhihu.com/question/350289336/answer/910970733)<br>
[若川知乎回答：怎么才能学好前端？](https://www.zhihu.com/question/372962058/answer/1026884916)<br>
如果觉得不错，可以点个赞^_^

## 文章列表

**taro 源码揭秘系列：**

- [Taro 源码揭秘 - 1. 揭开整个架构的入口 CLI => taro init 初始化项目的秘密](https://ruochuan12.github.io/taro/cli-init/)
- [Taro 源码揭秘 - 2. 揭开整个架构的插件系统的秘密](https://ruochuan12.github.io/taro/cli-plugins/)
- [Taro 源码揭秘 - 3. 每次创建新的 taro 项目（taro init）的背后原理是什么](https://ruochuan12.github.io/taro/cli-init-2/)
- [Taro 4.0 已正式发布 - 4. 每次 npm run dev:weapp 开发小程序，build 编译打包是如何实现的？](https://ruochuan12.github.io/taro/cli-build)
- [Taro 4.0 已发布 - 5.高手都在用的发布订阅机制 Events 在 Taro 中是如何实现的？](https://ruochuan12.github.io/taro/events/)

**vant 组件库源码分析系列：**

- [分析 vant4 组件库源码，写一个常用的 highlight 高亮文本的组件](https://ruochuan12.github.io/vant/vant/highlight)

- [vant4.0 正式发布了，分析其源码学会用 vue3 写一个图片懒加载组件！](https://ruochuan12.github.io/vant/lazyload/)

- [分析 vant4 源码，学会用 vue3 + ts 开发毫秒级渲染的倒计时组件，真是妙啊](https://ruochuan12.github.io/vant/count-down/)

- [分析 vant4 源码，如何用 vue3 + ts 开发一个瀑布流滚动加载的列表组件？](https://ruochuan12.github.io/vant/list/)

- [跟着 vant4 源码学习如何用 vue3+ts 开发一个 loading 组件，仅88行代码](https://ruochuan12.github.io/vant/loading/)

- [vant 4 即将正式发布，支持暗黑主题，那么是如何实现的呢](https://ruochuan12.github.io/vant/dark-theme/)

**学习源码整体架构系列：**

- 48.[开发小程序又一新选择 vue-mini，据说性能是 Taro 的 10 倍，遥遥领先](https://ruochuan12.github.io/vue-mini-analysis/)

- 47.[神器啊，从未想过 VSCode 还能这样直接打开仓库URL，原理揭秘~](https://ruochuan12.github.io/open-in-github/)

- 46.[自从学了 react-use 源码，我写自定义 React Hooks 越来越顺了~
](https://ruochuan12.github.io/react-use/)

- 45.[据说90%的人不知道可以用测试用例(Vitest)调试开源项目(Vue3) 源码](https://ruochuan12.github.io/vue-debugger/)

- 44.[经常用 vant-weapp 开发小程序，却不知道如何开发一个组件？学！](https://ruochuan12.github.io/vant-weapp-stepper/)

- 43.[vite 3.0 都发布了，经常初始化 vite 项目，却不知 create-vite 原理？揭秘！](https://ruochuan12.github.io/create-vite/)

- 42.[还在用开发者工具上传小程序? 快来试试 miniprogram-ci 提效摸鱼](https://ruochuan12.github.io/mini-ci/)

- 41.[面试官：项目中常用的 .env 文件原理是什么？如何实现？](https://ruochuan12.github.io/dotenv/)

- 40.[面试官：请手写一个带取消功能的延迟函数，axios 取消功能的原理是什么](https://ruochuan12.github.io/delay/)

- 39.[Vue团队核心成员开发的39行小工具 install-pkg 安装包，值得一学！](https://ruochuan12.github.io/install-pkg/)

- 38.[从 vue-cli 源码中，我发现了27行读取 json 文件有趣的 npm 包](https://ruochuan12.github.io/read-pkg/)

- 37.[从 vue3 和 vite 源码中，我学到了一行代码统一规范团队包管理器的神器](https://ruochuan12.github.io/only-allow/)

- 36.[每次新增页面复制粘贴？100多行源码的 element-ui 新增组件功能告诉你减少重复工作](https://ruochuan12.github.io/element-new/)

- 35.[新手向：前端程序员必学基本技能——调试JS代码](https://ruochuan12.github.io/debug/)

- 34.[从22行有趣的源码库中，我学到了 callback promisify 化的 Node.js 源码实现](https://ruochuan12.github.io/promisify/)

- 33.[每次启动项目的服务，电脑竟然乖乖的帮我打开了浏览器，100行源码揭秘！](https://ruochuan12.github.io/open/)

- 32.[初学者也能看懂的 Vue2 源码中那些实用的基础工具函数](https://ruochuan12.github.io/vue-utils/)

- 31.[尤雨溪推荐神器 ni ，能替代 npm/yarn/pnpm ？简单好用！源码揭秘！](https://ruochuan12.github.io/ni/)

- 30.[尤雨溪几年前开发的“玩具 vite”，才100多行代码，却十分有助于理解 vite 原理](https://ruochuan12.github.io/vue-dev-server/)

- 29.[Vue 团队公开快如闪电的全新脚手架工具 create-vue，未来将替代 Vue-CLI，才300余行代码，学它！](https://ruochuan12.github.io/create-vue/)

- 28.[为什么 Vue2 this 能够直接获取到 data 和 methods](https://ruochuan12.github.io/vue-this/)

- 27.[50行代码串行Promise，koa洋葱模型原来是这么实现？](https://ruochuan12.github.io/koa-compose/)

- 26.[Vue 3.2 发布了，那尤雨溪是怎么发布 Vue.js 的？](https://ruochuan12.github.io/vue-next-release/)

- 25.[初学者也能看懂的 Vue3 源码中那些实用的基础工具函数](https://ruochuan12.github.io/vue-next-utils/)

- 24.[尤雨溪开发的 vue-devtools 如何安装，为何打开文件的功能鲜有人知？](https://ruochuan12.github.io/vue-devtools/)

- 23.[面对 this 指向丢失，尤雨溪在 Vuex 源码中是怎么处理的](https://ruochuan12.github.io/vuex-this/)

- 22.[一文读懂vuex4源码，原来provide/inject就是妙用了原型链？](https://ruochuan12.github.io/vuex4/)

- 21.[据说 99% 的人不知道 vue-devtools 还能直接打开对应组件文件？本文原理揭秘](https://ruochuan12.github.io/open-in-editor/)

- 20.[学习 redux 源码整体架构，深入理解 redux 及其中间件原理](https://ruochuan12.github.io/redux/)

- 19.[学习 koa 源码的整体架构，浅析koa洋葱模型原理和co原理](https://ruochuan12.github.io/koa/)

- 18.[学习 axios 源码整体架构，打造属于自己的请求库](https://ruochuan12.github.io/axios/)

- 17.[学习 vuex 源码整体架构，打造属于自己的状态管理库](https://ruochuan12.github.io/vuex/)

- 16.[学习 sentry 源码整体架构，打造属于自己的前端异常监控SDK](https://ruochuan12.github.io/sentry/)

- 15.[学习 lodash 源码整体架构，打造属于自己的函数式编程类库](https://ruochuan12.github.io/lodash/)

- 14.[学习 underscore 源码整体架构，打造属于自己的函数式编程类库](https://ruochuan12.github.io/underscore/)

- 13.[学习 jQuery 源码整体架构，打造属于自己的 js 类库](https://ruochuan12.github.io/jquery/)

**面试官问系列：**

- 12.[面试官问：JS的继承](https://ruochuan12.github.io/js-extend/)

- 11.[面试官问：JS的this指向](https://ruochuan12.github.io/js-this/)

- 10.[面试官问：能否模拟实现JS的call和apply方法](https://ruochuan12.github.io/js-implement-call-apply/)

- 9.[面试官问：能否模拟实现JS的bind方法](https://ruochuan12.github.io/js-implement-bind/)

- 8.[面试官问：能否模拟实现JS的new操作符](https://ruochuan12.github.io/js-implement-new/)

**其他：**

- 7.[前端使用puppeteer 爬虫生成《React.js 小书》PDF并合并](https://ruochuan12.github.io/puppeteer-create-pdf-and-merge/)

- 6.[分析vue-cli@2.9.3 搭建的webpack项目工程](https://ruochuan12.github.io/vue-cli-2-webpack/)

- 5.[oh my zsh 和 windows git bash 设置别名提高效率](https://ruochuan12.github.io/oh-my-zsh/)

- 4.[vue 2.x项目 vue-qriously 生成二维码并下载、cliploard复制粘贴](https://ruochuan12.github.io/vue-2-qrcode/)

- 3.[参加有赞前端技术开放日所感所想](https://ruochuan12.github.io/20180421-youzan-front-end-tech-open-day/)

- 2.[JavaScript 对象所有API解析](https://ruochuan12.github.io/js-object-api/)

- 1.[《JavaScript语言精粹 修订版》 读书笔记](https://ruochuan12.github.io/js-book/)

## 免费的知识星球 前端视野

<img src="./README-images/zsxq.png"  width="250px" height="325px" title="前端视野知识星球" alt="前端视野知识星球"/>

主要发表一些前端所见所想，Vue、React、构建工具(比如：gulp、webpack)、设计模式等。一个人走得快，一群人走得远。
