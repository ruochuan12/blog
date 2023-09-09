# vue 2.x项目 vue-qriously 生成二维码并下载、cliploard复制粘贴

>`写于2018年05月15日`

近日，重构项目某一老模块时，有一个功能是生成二维码并下载，还可以复制链接。列表每项都有二维码、下载二维码和复制链接和列表上方总的二维码。
老模块是用的[qrocode中文文档](http://code.ciaoca.com/javascript/qrcode/)，[qrcode github](https://github.com/davidshimjs/qrcodejs)。

先想着新模块中是否有生成二维码的插件，看了下`package.json`。
有安装一个[vue-qriously](https://github.com/theomessin/vue-qriously)。但搜索了一下，竟然没有使用，可能是因为很多二维码都是后端生成返回链接给前端的。而在其他H5、微信项目中使用了。看了下这个项目`star`数是`113`。但我不想重新引入老模块的`qrcodejs`，重新引入其他的二维码插件，相对比较麻烦。于是就保持统一用`vue-qriously`了。
猜想当时引入这个是[vue 资源合集`awesome-vue`](https://github.com/vuejs/awesome-vue)中，`qrcode`相关第一个就是`vue-qriously`。

## `vue-qriously`插件使用

```js
// 入口js文件
// npm install vue-qriously -S
import Vue from 'vue';
import VueQriously from 'vue-qriously';
Vue.use(VueQriously);
```

```js
// vue 文件
<template>
    <qriously :value="value" size="size" :backgroundAlpha="backgroundAlpha"/>
</template>

<script>
export default {
    name: 'app',
    data(){
        return {
            // 可以自定义，必填项。
            value: 'http://lxchuan12.github.io/',
            // 二维码大小 默认 100
            size: 80,
            // 背景透明度，默认透明 0
            backgroundAlpha： 1,
        }
    }
}
</script>
```
更多参数配置可以查看：[github 仓库 v-qriously.vue源码](https://github.com/theomessin/vue-qriously/blob/master/src/components/v-qriously.vue)
查看代码可以发现，开头引用了`qrious`，这个`star`就多一点，`600`多。
```js
import Qrious from 'qrious'
```
[`qrious` github 地址](https://github.com/neocotic/qrious)
[`qrious` 文档](https://neocotic.com/qrious/)

## 下载二维码

粗略的翻看下以上相关文档，写完正准备要做下载功能。这时发现，哎呀，竟然就是只生成了一个`canvas`。
于是百度(暴露了用百度...我也想用谷歌，但现在不行...)了下`canvas`如何转图片。
[stackoverflow Capture HTML Canvas as gif/jpg/png/pdf?](https://stackoverflow.com/questions/923885/capture-html-canvas-as-gif-jpg-png-pdf)
```js
var canvas = document.getElementById("mycanvas");
var imgSrc    = canvas.toDataURL("image/png");
document.write('<img src="'+img+'"/>');
// 搜索到一些其他的方案，感觉挺麻烦。
// 嗯，这个简单。想着我们项目兼容性没什么要求，于是就用这个了。
```
生成了`img`的`src`资源，那么就可以下载了。
```js
// 老模块是用的`jquery` + `seajs` + `vue1.x`
// 新模块尽量要去除`jquery`。
let src = $('.img').src;
let aLink = $('<a></a>').attr('href', src).attr('download', 'xxx二维码.png').appendTo('body');
aLink[0].click();
aLink.remove();
```
```js
// 新模块 去除jquery
let elem = document.createElement('a');
elem.setAttribute('href', imgSrc);
elem.setAttribute('download', 'xxx二维码.png');
document.body.appendChild(elem);
elem.click();
document.body.removeChild(elem);
```

但这样写也相对比较麻烦。
项目中封装了一个`v-click`指令。
```js
/**
 * vClick 触发点击
 * @type {Object}
 */
export const vClick = {
	directives: {
		click: {
			/**
			 * 值更新时候触发点击
			 * @author 若川 <lxchuan12@163.com>
			 * @date   2018-05-15
			 * @param  {HTMLElement} el                指令所绑定的元素
			 * @param  {Boolean}     options.value     绑定值(新)
			 * @param  {Boolean}     options.oldValue  绑定值(旧)
			 */
			update(el, { value, oldValue }){
				if(value && !oldValue){
					el.click();
				}
			},
		},
	},
};
```
```js
<template>
<div>
    <div class="img" v-show="listShareShow">
        <qriously id="qriously" :backgroundAlpha="1" :value="listSharingLink" :size="160" v-show="false"/>
        <img :src="listSharingLinkSrc" alt="xxx二维码">
    </div>
    <a :href="exportLink" v-click="download" :download="downloadFilename"></a>
    <a  @click.stop="listShare">查看链接/二维码</a>
</div>
</template>
<script>
export default {
    // 提取出主要代码
    data(){
        retrun {
            // 下载
			download: false,
			downloadFilename: 'xxx二维码',
			listSharingLinkSrc: '',
            listSharingLinkSrc: '',
            listShareShow: false,
        }
    },
    // ...
    methods: {
        /**
		 * 查看链接/二维码
		 * @author 若川 <lxchuan12@163.com>
		 * @date   2018-05-15
		 */
		listShare(event){
			if(!this.listSharingLinkSrc){
				let canvas = document.querySelector('#qriously canvas');
				let imgSrc = canvas.toDataURL('image/png');
				this.listSharingLinkSrc = imgSrc;
			}
			this.listShareShow = !this.listShareShow;
		},
        /**
		 * 表格上方：下载二维码列表
		 * @author 若川 <lxchuan12@163.com>
		 * @date   2018-05-15
		 */
		downloadQrcode(event, linkSrc, downloadFilename){
			event.stopPropagation();
			this.exportLink = linkSrc;
			this.downloadFilename = downloadFilename;
			this.download = true;
			this.$nextTick(() => {
				this.exportLink = '';
				this.download = false;
				this.downloadFilename = '';
			});
		},
    },
};
</script>
```
代码写到这里，嗯，实现完了下载。但又发现又一需求，显示大小是`80 * 80`，下载需要是`160 * 160`。

## 显示大小和下载大小不一样

参考了下老模块，`qrcodejs`渲染出来的`html`,
```html
//  跟这个类似
<div id="qrcode_1" title="your content">
    <canvas width="256" height="256" style="display: none;"></canvas>
    <img alt="Scan me!" style="display: block;" src="data:image/png;base64,xxx">
</div>
```
`vue-qriously`渲染出来是
```js
<div>
    <canvas width="80" width="80"></canvas>
</div>
```
于是我可以把生成的`imgSrc`资源,
```js
<template>
<div>
    <canvas width="160" width="160" v-show="false"></canvas>
    <img class="img" :src="imgSrc"/>
</div>
</template>
<style lang="less">
.img{
    width: 80px;
    height: 80px;
}
</style>
```
这就实现了下载的资源是`160 * 160`，用样式控制图片显示`80 * 80`。
代码写完，觉得应该给`vue-qriously`写个`pr`,实现 不仅仅是渲染`canvas`，而是让大家可以选择时`img`还是`canvas`。又去翻了翻这个项目的`issue`,有一个`issue`[链接：how to make this canvas exchange to img](https://github.com/theomessin/vue-qriously/issues/10) 就是说的这个。还没关闭。
```
i think u can create type let user select img and canvas.
```
```
// 有一个回复
If you want to make it become downloadable, maybe you can transform it from canvas easily by canvas.toDataURL()
```

文章写到这里，我发现这样似乎不太妥。我的场景，是点击时显示浮层（浮层有二维码和复制链接地址和下载二维码按钮等），获取`canvas`元素，去转成`img` `src`，再去渲染到页面，而且图片可能会闪，因为是实际大小是`160`，样式强制控制在`80`。
何不生成两份，一份是用来获取资源下载的。一份用来显示的。嗯，之后去优化下。
顺带说一下，复制粘贴

## cliploard 复制粘贴

老模块中是用的`cliploard`[clipboard github仓库](https://github.com/zenorocha/clipboard.js)。就是我引入的。

新模块还没使用过，但依然使用这个。
```js
// 安装
// npm install clipboard --save
<template @click="Clip($event, '快来复制')"><template>
// 封装成一个函数
import Clipboard from 'clipboard';
export default function Clip(event，text) {
  const clipboard = new Clipboard(event.target, {
    text: () => text
  });
  clipboard.on('success', () => {
    console.log('复制成功');
    clipboard.off('error');
    clipboard.off('success');
    clipboard.destroy();
  });
  clipboard.on('error', () => {
    console.log('复制失败，请刷新试试');
    clipboard.off('error')
    clipboard.off('success')
    clipboard.destroy()
  });
  clipboard.onClick(event);
}
```

当然也可以封装成`vue`指令。
可以参考[vue-element-admin这个项目](https://github.com/PanJiaChen/vue-element-admin)
之前我看的时候还是`3000`多`star`，现在`1.2w+`，说明值得学习。
另外推荐[`awesomes`网站 工具类库合集](https://www.awesomes.cn/)

## 小结

1、引入第三方插件等使用时，多查看`github` 文档 `issue`等，在技术社区搜索别人使用的方案。<br>
2、选用第三方插件时，尽可能挑选`star`比较多的，`issue`处理比较及时的，在更新维护的。<br>
3、富余时间可以多研究下别人的项目是如何组织文件，和实现的一些常用功能的。<br>
4、尽可能去优化自己的代码，总结回顾。<br>

## 关于

作者：常以**若川**为名混迹于江湖。前端路上 | PPT爱好者 | 所知甚少，唯善学。<br>
[个人博客](https://lxchuan12.github.io/)<br>
[掘金专栏](https://juejin.im/user/1415826704971918/posts)，欢迎关注~<br>
[`segmentfault`前端视野专栏](https://segmentfault.com/blog/lxchuan12)，开通了**前端视野**专栏，欢迎关注~<br>
[知乎前端视野专栏](https://zhuanlan.zhihu.com/lxchuan12)，开通了**前端视野**专栏，欢迎关注~<br>
[github blog](https://github.com/ruochuan12/blog)，相关源码和资源都放在这里，求个`star`^_^~

## 微信公众号  若川视野

可能比较有趣的微信公众号，长按扫码关注。也可以加微信 `ruochuan12`，注明来源，拉您进【前端视野交流群】。

![若川视野](../about/wechat-official-accounts-mini.png)
