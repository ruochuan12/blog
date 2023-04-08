# 前端使用puppeteer 爬虫生成《React.js 小书》PDF并合并

>`写于2018年08月29日`

>大家好，我是[若川](https://lxchuan12.gitee.io)。我倾力持续组织了一年[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（4.1k+人）第一的专栏，写有20余篇源码文章。
## 1、`puppeteer` 是什么？

`puppeteer`: `Google` 官方出品的 `headless` `Chrome` `node` 库<br/>
[`puppeteer` `github`仓库](https://github.com/GoogleChrome/puppeteer)<br/>
[`puppeteer` `API`](https://pptr.dev/)<br/>

**官方介绍：**
>您可以在浏览器中手动执行的大多数操作都可以使用`Puppeteer`完成！
>
>生成页面的屏幕截图和`PDF`。<br/>
抓取`SPA`并生成预渲染内容（即“`SSR`”）。<br/>
自动化表单提交，`UI`测试，键盘输入等。<br/>
创建最新的自动化测试环境。使用最新的`JavaScript`和浏览器功能直接在最新版本的`Chrome`中运行测试。<br/>
捕获时间线跟踪 您的网站，以帮助诊断性能问题。<br/>
测试`Chrome`扩展程序。<br/>

## 2、爬取网站生成`PDF`

### 2.1 安装 puppeteer

```bash
# 安装 puppeteer
# 可能会因为网络原因安装失败，可使用淘宝镜像
# npm install -g cnpm --registry=https://registry.npm.taobao.org
npm i puppeteer
# or "yarn add puppeteer"
```

### 2.2 《`React.js`小书》简介

> [《`React.js`小书》](http://huziketang.mangojuice.top/books/react/)简介 <br/>
[关于作者@胡子大哈](http://huziketang.mangojuice.top/books/react/me/)<br/>
这是⼀本关于 React.js 的⼩书。
因为⼯作中⼀直在使⽤ `React.js`，也⼀直以来想总结⼀下⾃⼰关于 `React.js` 的⼀些
知识、经验。于是把⼀些想法慢慢整理书写下来，做成⼀本**开源、免费、专业、简单**
的⼊⻔级别的⼩书，提供给社区。希望能够帮助到更多 `React.js` 刚⼊⻔朋友。<br/>
下图是《`React.js` 小书》部分截图：
![《`React.js` 小书》部分截图](./react-mini-book.jpg)

### 2.3 一些可能会用到的 `puppeteer API`

```js
// 新建 reactMiniBook.js, 运行 node reactMiniBook.js 生成pdf
const puppeteer = require('puppeteer');

(async () => {
  // 启动浏览器
  const browser = await puppeteer.launch({
        // 无界面 默认为true,改成false,则可以看到浏览器操作，目前生成pdf只支持无界面的操作。
        // headless: false,
        // 开启开发者调试模式，默认false, 也就是平时F12打开的面版
		// devtools: true,
  });
  // 打开一个标签页
  const page = await browser.newPage();
  // 跳转到页面 http://huziketang.mangojuice.top/books/react/
  await page.goto('http://huziketang.com/books/react/', {waitUntil: 'networkidle2'});
  // path 路径， format 生成pdf页面格式
  await page.pdf({path: 'react.pdf', format: 'A4'});
  // 关闭浏览器
  await browser.close();
})();
```
知道这启动浏览器打开页面关闭浏览器主流程后，再来看几个`API`。
```js
const args = 1;
let wh = await page.evaluate((args) => {
    // args 可以这样传递给这个函数。
    // 类似于 setTimeout(() => {console.log(args);}, 3000, args);
    console.log('args', args); // 1
    // 这里可以运行 dom操作等js
    // 返回通过dom操作等获取到的数据
    return {
        width: 1920,
        height: document.body.clientHeight,
    };
}, args);
// 设置视图大小
await page.setViewport(wh);
// 等待2s
await page.waitFor(2000);
```

```js
// 以iPhone X执行。
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone X'];
await page.emulate(iPhone);
```

### 2.4 知道了以上这些`API`后，就可以开始写主程序了。

简单说下：实现功能和主流程。从上面`React.js小书`截图来看。<br/>
1、打开浏览器，进入目录页，生成`0. React 小书 目录.pdf`<br/>
2、跳转到`1. React.js 简介`页面，获取左侧所有的导航`a`链接的`href`，标题。<br/>
3、用获取到的`a链接数组`进行`for`循环，这个循环里主要做了如下几件事：<br/>
>   3.1 隐藏左侧导航，便于生成`pdf`<br/>
>   3.2 给**`React.js简介`**等标题 加上序号，便于查看<br/>
>   3.3 设置`docment.title` 加上序号, 便于在页眉中使用。<br/>
>   3.4 隐藏 **传播一下知识也是一个很好的选择** 这一个模块（因为页眉页脚中设置了书的链接等信息，就隐藏这个了）<br/>
>   3.5 给 分页 上一节，下一节加上序号，便于查看。<br/>
>   3.6 最末尾声明下该`pdf`的说明，仅供学习交流，严禁用于商业用途。<br/>
>   3.7 返回宽高，用于设置视图大小<br/>
>   3.8 设置视图大小，创建生成`pdf`<br/>

4、关闭浏览器

具体代码：可以查看这里[爬虫生成《React.js小书》的`pdf`每一小节的代码](https://github.com/lxchuan12/learn-nodejs/blob/master/src/puppeteer/reactMiniBook.js)

```js
// node 执行这个文件
// 笔者这里是：
node src/puppeteer/reactMiniBook.js
```
即可生成如下图：每一小节（0-46小节）的`pdf`

![每一小节（0-46小节）的`pdf`](./react-mini-books.jpg)

生成这些后，那么问题来了，就是查看时总不能看一小节，打开一小节来看，这样很不方便。<br/>
于是接下来就是合并这些`pdf`成为一个`pdf`文件。

## 3、合并成一个PDF文件 `pdf-merge`

起初，我是使用在线网站[Smallpdf](https://smallpdf.com/cn)，合并`PDF`。合并的效果还是很不错的。这网站还是其他功能。比如`word`转`pdf`等。<br/>
后来找到社区提供的一个`npm` `package`[pdf merge](https://github.com/wubzz/pdf-merge)。 (毕竟笔者是写程序的，所以就用代码来实现合并了)

这个`pdf-merge`依赖 [pdftk](https://www.pdflabs.com/docs/pdftk-man-page/)<br/>

**安装 PDFtk**<br/>
**Windows**<br/>
[下载并安装](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/)<br/>
笔者安装后，重启电脑才能使用。

**Debian, Ubuntu 安装**<br/>
笔者在Ubuntu系统安装后，即可使用。<br/>
`apt-get install pdftk`

**使用例子**
```js
const PDFMerge = require('pdf-merge');

const files = [
	`${__dirname}/1.pdf`,
	`${__dirname}/2.pdf`,
];

// Buffer (Default)
PDFMerge(files)
.then((buffer) => {...});

// Stream
PDFMerge(files, {output: 'Stream'})
.then((stream) => {...});

// 笔者这里使用的是这个
// Save as new file
PDFMerge(files, {output: `${__dirname}/3.pdf`})
.then((buffer) => {...});
```
知道这些后，可以开始写主程序了。<br/>
简单说下主流程<br/>
1、读取到生成的所有`pdf`文件路径，并排序（0-46）<br/>
2、判断下输出文件夹是否存在，不存在则创建<br/>
3、合并这些小节的`pdf`保存到新文件 `React小书（完整版）-作者：胡子大哈-时间戳.pdf`<br/>

具体代码：可以查看这里[爬虫生成《React.js小书》的`pdf`合并`pdf`的代码](https://github.com/lxchuan12/learn-nodejs/blob/master/src/puppeteer/mergePdf.js)

最终合并的`pdf`文件在这里[React小书（完整版）-作者：胡子大哈](https://github.com/lxchuan12/learn-nodejs/blob/master/src/puppeteer/reactMiniBookMerged/React%E5%B0%8F%E4%B9%A6%EF%BC%88%E5%AE%8C%E6%95%B4%E7%89%88%EF%BC%89-%E4%BD%9C%E8%80%85%EF%BC%9A%E8%83%A1%E5%AD%90%E5%A4%A7%E5%93%88-1535335084919.pdf)，可供下载。

本想着还可以加下书签和页码，没找到合适的生成方案，那暂时先不加了。如果读者有好的方案，欢迎与笔者交流。


## 小结

1、`puppeteer`是`Google` 官方出品的 `headless` `Chrome` `node`库，可以在浏览器中手动执行的大多数操作都可以使用`Puppeteer`完成。总之可以用来做很多有趣的事情。<br/>
2、用 `puppeteer` 生成每一小节的`pdf`，用依赖`pdftk`的`pdf-merge` `npm`包, 合并成一个新的`pdf`文件。或者使用[Smallpdf](https://smallpdf.com/cn)等网站合并。<br/>
3、[《`React.js`小书》](http://huziketang.mangojuice.top/books/react/)，推荐给大家。爬虫生成`pdf`，应该不会对[作者@胡子大哈](http://huziketang.mangojuice.top/books/react/me/)有什么影响。作者写书服务社区不易，尽可能多支持作者。<br/>

最后推荐几个链接，方便大家学习 `puppeteer`。<br/>
[puppeteer入门教程](http://www.r9it.com/20171106/puppeteer.html)<br/>
[Puppeteer 初探之前端自动化测试](https://cloud.tencent.com/developer/article/1006000)<br/>
[爬虫生成ES6标准入门 pdf](https://github.com/zhentaoo/puppeteer-deep)<br/>
[大前端神器安利之 Puppeteer](https://jeffjade.com/2017/12/17/134-kinds-of-toss-using-puppeteer/)<br/>
[puppeteer API中文文档](https://github.com/zhaoqize/puppeteer-api-zh_CN/)<br/>

## 关于

作者：常以**若川**为名混迹于江湖。前端路上 | PPT爱好者 | 所知甚少，唯善学。<br>
[个人博客](https://lxchuan12.github.io/)<br>
[掘金专栏](https://juejin.im/user/1415826704971918/posts)，欢迎关注~<br>
[`segmentfault`前端视野专栏](https://segmentfault.com/blog/lxchuan12)，开通了**前端视野**专栏，欢迎关注~<br>
[知乎前端视野专栏](https://zhuanlan.zhihu.com/lxchuan12)，开通了**前端视野**专栏，欢迎关注~<br>
[github blog](https://github.com/lxchuan12/blog)，相关源码和资源都放在这里，求个`star`^_^~

## 微信公众号  若川视野

可能比较有趣的微信公众号，长按扫码关注。也可以加微信 `ruochuan12`，注明来源，拉您进【前端视野交流群】。

![若川视野](../about/wechat-official-accounts-mini.png)
