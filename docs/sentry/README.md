# 学习 sentry 源码整体架构，打造属于自己的前端异常监控SDK

## 前言

这是学习源码整体架构第四篇。整体架构这词语好像有点大，姑且就算是源码整体结构吧，主要就是学习是代码整体结构，不深究其他不是主线的具体函数的实现。文章学习的是打包整合后的代码，不是实际仓库中的拆分的代码。

其余三篇分别是：
>1.[学习 jQuery 源码整体架构，打造属于自己的 js 类库](https://juejin.im/post/5d39d2cbf265da1bc23fbd42)

>2.[学习 underscore 源码整体架构，打造属于自己的函数式编程类库](https://juejin.im/post/5d4bf94de51d453bb13b65dc)

>3.[学习 lodash 源码整体架构，打造属于自己的函数式编程类库](https://juejin.im/post/5d767e1d6fb9a06b032025ea)

感兴趣的读者可以点击阅读。

开发微信小程序，想着搭建小程序错误监控方案。最近用了丁香园 开源的`Sentry` 小程序 `SDK`[sentry-miniapp](https://github.com/lizhiyao/sentry-miniapp)。
顺便研究下[`sentry-javascript`](https://github.com/getsentry/sentry-javascript) 的源码整体架构，于是有了这篇文章。

本文分析的是打包后未压缩的源码，源码总行数五千余行，链接地址是：[https://browser.sentry-cdn.com/5.7.1/bundle.js](https://browser.sentry-cdn.com/5.7.1/bundle.js)， 版本是`v5.7.1`。

看源码前先来梳理下前端错误监控的知识。

## 前端错误监控知识

摘抄自某视频教程。

### 前端错误的分类

>**1.即时运行错误：代码错误**

`try...catch`

`window.onerror` (也可以用`DOM2`事件监听)

>**2.资源加载错误**

 `object.onerror`: `dom`对象的`onerror`事件

`performance.getEntries()`

`Error`事件捕获

>3.**使用`performance.getEntries()`获取网页图片加载错误**

`var allImgs = document.getElementsByTagName('image')`

`var loadedImgs = performance.getEntries().filter(i => i.initiatorType === 'img')`

最后`allIms`和`loadedImgs`对比即可找出图片资源未加载项目

### Error事件捕获代码示例

```js
window.addEventListener('error', function(e) {
  console.log('捕获'，e)
}, true) // 这里只有捕获才能触发事件，冒泡是不能触发
```

### 上报错误的基本原理

1.采用`Ajax`通信的方式上报

2.利用`Image`对象上报 (主流方式)

`Image`上报错误方式：
` (new Image()).src = 'https://lxchuan12.cn/error?name=若川'`

## Sentry 前端异常监控原理

>1.重写 `window.onerror` 方法

```js
window.onerror = function (msg, url, line, column, error) {
	console.log('msg, url, line, column, error', msg, url, line, column, error);
}
```
`Sentry` 源码可以搜索 `global.onerror` 定位到具体位置
```js
 GlobalHandlers.prototype._installGlobalOnErrorHandler = function () {
            if (this._onErrorHandlerInstalled) {
                return;
            }
			var self = this; // tslint:disable-line:no-this-assignment

			// 这里的 this._global 在浏览器中就是 window
            this._oldOnErrorHandler = this._global.onerror;
			this._global.onerror = function (msg, url, line, column, error) {}
			// code ...
 }
```

>2.采用`Ajax`上传

支持 `fetch` 使用 `fetch` 否则使用　`XHR`。

```js
BrowserBackend.prototype._setupTransport = function () {
	// code ...
	if (supportsFetch()) {
		return new FetchTransport(transportOptions);
	}
	return new XHRTransport(transportOptions);
};
```

>2.1 `fetch`

```js
FetchTransport.prototype.sendEvent = function (event) {
	var defaultOptions = {
		body: JSON.stringify(event),
		method: 'POST',
		referrerPolicy: (supportsReferrerPolicy() ? 'origin' : ''),
	};
	return this._buffer.add(global$2.fetch(this.url, defaultOptions).then(function (response) { return ({
		status: exports.Status.fromHttpCode(response.status),
	}); }));
};
```

>2.2 `XMLHttpRequest`

```js
 XHRTransport.prototype.sendEvent = function (event) {
	 var _this = this;
	return this._buffer.add(new SyncPromise(function (resolve, reject) {
		var request = new XMLHttpRequest();
		// code ...
	};
 }
```

## Sentry 源码入口和出口

```js
var Sentry = (function(exports){
	// code ...

	exports.BrowserClient = BrowserClient;
    exports.Hub = Hub;
    exports.Integrations = INTEGRATIONS;
    exports.SDK_NAME = SDK_NAME;
    exports.SDK_VERSION = SDK_VERSION;
    exports.Scope = Scope;
    exports.Span = Span;
    exports.Transports = index;
    exports.addBreadcrumb = addBreadcrumb;
    exports.addGlobalEventProcessor = addGlobalEventProcessor;
    exports.captureEvent = captureEvent;
    exports.captureException = captureException;
    exports.captureMessage = captureMessage;
    exports.close = close;
    exports.configureScope = configureScope;
    exports.defaultIntegrations = defaultIntegrations;
    exports.flush = flush;
    exports.forceLoad = forceLoad;
    exports.getCurrentHub = getCurrentHub;
    exports.getHubFromCarrier = getHubFromCarrier;
    exports.init = init;
    exports.lastEventId = lastEventId;
    exports.onLoad = onLoad;
    exports.setContext = setContext;
    exports.setExtra = setExtra;
    exports.setExtras = setExtras;
    exports.setTag = setTag;
    exports.setTags = setTags;
    exports.setUser = setUser;
    exports.showReportDialog = showReportDialog;
    exports.withScope = withScope;
    exports.wrap = wrap$1;

    return exports;
}({}));
```

未完待续 ...
