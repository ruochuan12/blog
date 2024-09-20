import * as path from "path";
import { defineConfig } from "rspress/config";
import readingTime from "rspress-plugin-reading-time";
import { pluginGoogleAnalytics } from "rsbuild-plugin-google-analytics";
import { pluginFontOpenSans } from "rspress-plugin-font-open-sans";

export default defineConfig({
	root: path.join(__dirname, "docs"),
	//   root: 'docs',
	title: "若川的博客",
	lang: "zh",
	keywords:
		"若川，微信搜索「若川视野」关注我，长期交流学习。写有《学习源码整体架构系列》。包含jquery源码、underscore源码、lodash源码、sentry源码、vuex源码、axios源码、koa源码、redux源码、vue-devtools源码、vuex4源码。前端路上，PPT爱好者，所知甚少，唯善学。",
	description:
		"若川，微信搜索「若川视野」关注我，长期交流学习。写有《学习源码整体架构系列》。包含jquery源码、underscore源码、lodash源码、sentry源码、vuex源码、axios源码、koa源码、redux源码。前端路上，PPT爱好者，所知甚少，唯善学。",
	//   lang: 'zh',
	icon: "/favicon.ico",
	// logo: {
	// 	light: "/logo-2.jpg",
	// 	dark: "/logo-2.jpg",
	// },
	head: [
		["link", { rel: "icon", href: "/favicon.ico" }],
		["link", { rel: "mainfest", href: "/mainfest.json" }],
		// [
		// 	'script',
		// 	{ charset: 'utf-8', src: 'https://my.openwrite.cn/js/readmore.js' },
		// ],
		// 添加百度统计
		'<script defer src="https://hm.baidu.com/hm.js?b0077938fa555dbb43c9dd96d20e9b79"></script>',
		// [
		// 	"script",
		// 	{
		// 		defer: "defer",
		// 	},
		// 	`
		// var _hmt = _hmt || [];
		// (function() {
		// var hm = document.createElement("script");
		// hm.src = "https://hm.baidu.com/hm.js?b0077938fa555dbb43c9dd96d20e9b79";
		// var s = document.getElementsByTagName("script")[0];
		// s.parentNode.insertBefore(hm, s);
		// })();
		// `,
		// ],
	],
	route: {
		exclude: [
			"jquery",
			"mini-webpack",
			"**/images/**/*",
			"**/**/README.md",
			"debounce",
		],
		// exclude: ['**/fragments/**'],
		// extensions: ['.jsx', '.md', '.mdx'],
		cleanUrls: true,
	},

	plugins: [
		readingTime({ defaultLocale: "zh-CN" }),
		pluginGoogleAnalytics({
			id: "UA-145436866-1",
		}),
		pluginFontOpenSans(),
	],

	themeConfig: {
		enableContentAnimation: true,
		footer: {
			message: "© 2024 若川",
		},
		lastUpdated: true,
		// hideNavbar: 'auto',
		socialLinks: [
			{
				icon: "github",
				mode: "link",
				content: "https://github.com/ruochuan12",
			},
			//   {
			//     icon: 'discord',
			//     mode: 'link',
			//     content: 'https://discord.gg/mkVw5zPAtf',
			//   },
			{
				icon: "x",
				mode: "link",
				content: "https://x.com/ruochuan12",
			},
		],
		// locales: [
		//   {
		//     lang: 'zh',
		//     label: '简体中文',
		//     editLink: {
		//       docRepoBaseUrl:
		//         'https://github.com/web-infra-dev/rspress/tree/main/packages/document/docs',
		//       text: '📝 在 GitHub 上编辑此页',
		//     },
		//     prevPageText: '上一篇',
		//     nextPageText: '下一篇',
		//     outlineTitle: '目录',
		//     searchPlaceholderText: '搜索',
		//     searchNoResultsText: '未搜索到相关结果',
		//     searchSuggestedQueryText: '可更换不同的关键字后重试',
		//   },
		//   {
		//     lang: 'en',
		//     label: 'English',
		//     editLink: {
		//       docRepoBaseUrl:
		//         'https://github.com/web-infra-dev/rspress/tree/main/packages/document/docs',
		//       text: '📝 Edit this page on GitHub',
		//     },
		//     searchPlaceholderText: 'Search',
		//   },
		// ],

		nav: [
			{
				text: "主页",
				link: "/",
			},
			{
				text: "关于我",
				link: "/about/",
			},
			{
				text: "源码共读",
				link: '/read-source-code/'
			},
			{
				text: "源码共读",
				link: "https://www.yuque.com/ruochuan12/read-source-code/p0",
				items: [
					{
						text: "语雀链接",
						link: "https://www.yuque.com/ruochuan12/read-source-code/p0",
					},
					{
						text: "掘金链接",
						link: "https://juejin.cn/post/7079706017579139102",
					},
					{
						text: "自建网站",
						link: "https://ruochuan-f2e.github.io/read-source-code/",
					},
					{
						text: "github仓库",
						link: "https://github.com/ruochuan-f2e/read-source-code",
					},
				],
			},
			{
				text: '曾经写的"诗词"',
				link: "/poetry/2012-2016/",
			},
			{
				text: "掘金",
				link: "https://juejin.cn/column/6960551178908205093",
			},
			{
				text: "Github",
				link: "https://github.com/ruochuan12/blog",
			},
			{
				text: "公众号：若川视野",
				link: "https://image-static.segmentfault.com/355/182/3551821948-5df888aa1dc88_articlex",
			},

			{
				text: "知乎",
				link: "https://www.zhihu.com/people/lxchuan12/activities",
			},
			{
				text: "语雀",
				link: "https://www.yuque.com/lxchuan12/blog",
			},
			{
				text: "其他",
				items: [
					{
						text: "segmentFault",
						link: "https://segmentfault.com/u/lxchuan12/articles",
					},
					{
						text: "微博",
						link: "http://weibo.com/lxchuan12",
					},
					{
						text: "简书",
						link: "http://www.jianshu.com/users/83129d433d72/latest_articles",
					},
				],
			},
			{
				text: "友链",
				items: [
					{
						text: "程序员指北 koala",
						link: "http://www.inode.club",
					},
					{
						text: "山月",
						link: "https://shanyue.tech",
					},
					{
						text: "lucifer",
						link: "http://lucifer.ren",
					},
					{
						text: "童欧巴",
						link: "https://hungryturbo.com",
					},
					{
						text: "scarsu",
						link: "https://www.scarsu.com/",
					},
					{
						text: "lencx的博客",
						link: "https://mtc.nofwl.com/",
					},
					{
						text: "itclanCoder",
						link: "https://coder.itclan.cn/",
					},
					{
						text: "编程之上",
						link: "https://ruizhengyun.cn",
					},
					{
						text: "全栈大前端",
						link: "http://www.ffbig.cn",
					},
					{
						text: "JasonSubmara 的博客",
						link: "https://submara.com/Geek",
					},
				],
			},
		],

		sidebar: {
			"/": [
				{
					text: "目录", // 必要的
					prefix: "/", // 可选的, 应该是一个绝对路径
					// collapsible: true, // 可选的, 默认值是 true,
					// sidebarDepth: 2,    // 可选的, 默认值是 1
					// items: [
					// //   '../../',
					// ],
				},
				{
					text: "taro源码揭秘", // 必要的
					// path: '/about/',      // 可选的, 应该是一个绝对路径
					// collapsible: true, // 可选的, 默认值是 true,
					// sidebarDepth: 2, // 可选的, 默认值是 1
					items: [
						"/taro/cli-init/",
						"/taro/cli-plugins/",
						"/taro/cli-init-2/",
						"/taro/cli-build/",
						"/taro/events/",
						"/taro/native-apis/",
						"/taro/request/",
						"/taro/webpack5-runner/",
					],
				},
				{
					text: "vant组件库源码", // 必要的
					// path: '/about/',      // 可选的, 应该是一个绝对路径
					// collapsible: true, // 可选的, 默认值是 true,
					// sidebarDepth: 2, // 可选的, 默认值是 1
					items: [
						"/vant/highlight/",
						"/vant/lazyload/",
						"/vant/count-down/",
						"/vant/list/",
						"/vant/loading/",
						"/vant/dark-theme/",
					],
				},
				{
					text: "学习源码系列", // 必要的
					// path: '/about/',      // 可选的, 应该是一个绝对路径
					collapsible: true, // 可选的, 默认值是 true,
					// sidebarDepth: 2, // 可选的, 默认值是 1
					items: [
						"/vue-mini-analysis/",
						"/axios-build/",
						"/open-in-github/",
						"/react-use/",
						"/vue-debugger/",
						"/vant-weapp-stepper/",
						"/create-vite/",
						"/mini-ci/",
						"/dotenv/",
						"/delay/",
						"/install-pkg/",
						"/read-pkg/",
						"/only-allow/",
						"/element-new/",
						"/debug/",
						"/promisify/",
						"/open/",
						"/vue-utils/",
						"/ni/",
						"/vue-dev-server/",
						"/create-vue/",
						"/vue-this/",
						"/koa-compose/",
						"/vue-next-release/",
						"/vue-next-utils/",
						"/vue-devtools/",
						"/vuex-this/",
						"/vuex4/",
						"/open-in-editor/",
						"/redux/",
						"/koa/",
						"/axios/",
						"/vuex/",
						"/sentry/",
						"/lodash/",
						"/underscore/",
						//   '/jquery/',
					],
				},
				{
					text: "面试官问系列", // 必要的
					// path: '/about/',      // 可选的, 应该是一个绝对路径
					collapsible: true, // 可选的, 默认值是 true,
					// sidebarDepth: 2, // 可选的, 默认值是 1
					items: [
						"/js-extend/",
						"/js-this/",
						"/js-implement-call-apply/",
						"/js-implement-bind/",
						"/js-implement-new/",
					],
				},
				{
					text: "历史文章", // 必要的
					// path: '/about/',      // 可选的, 应该是一个绝对路径
					collapsible: true, // 可选的, 默认值是 true,
					// sidebarDepth: 2, // 可选的, 默认值是 1
					items: [
						"/puppeteer-create-pdf-and-merge/",
						"/vue-cli-2-webpack/",
						"/oh-my-zsh/",
						"/20180421-youzan-front-end-tech-open-day/",
						"/vue-2-qrcode/",
						"/js-object-api/",
						"/js-book/",
					],
				},
				{
					text: "杂文", // 必要的
					// path: '/about/',      // 可选的, 应该是一个绝对路径
					collapsible: true, // 可选的, 默认值是 true,
					// sidebarDepth: 2, // 可选的, 默认值是 1
					items: [
						"/goal/",
						"/20190612-after-3-year-work/",
						"/20170602-After-a-year-s-work-I-had-some-insights/",
						"/20160907-How-do-I-set-foot-on-the-front-end-of-the-road/",
					],
				},
				{
					text: '曾经写的"诗词"', // 必要的
					// path: '/about/',      // 可选的, 应该是一个绝对路径
					// collapsible: true, // 可选的, 默认值是 true,
					// sidebarDepth: 2, // 可选的, 默认值是 1
					items: ["/poetry/2012-2016/", "/poetry/2013/"],
				},
				{
					text: "年度总结", // 必要的
					// path: '/about/',      // 可选的, 应该是一个绝对路径
					collapsible: true, // 可选的, 默认值是 true,
					// sidebarDepth: 2, // 可选的, 默认值是 1
					items: [
						"/annual-summary/2021/",
						"/annual-summary/2020/",
						"/annual-summary/2019/",
						"/annual-summary/2018/",
						"/annual-summary/2017/",
						"/annual-summary/2016/",
					],
				},
				{
					text: "关于", // 必要的
					// path: '/about/',      // 可选的, 应该是一个绝对路径
					collapsible: true, // 可选的, 默认值是 true,
					// sidebarDepth: 2, // 可选的, 默认值是 1
					items: ["/about/"],
				},
			],
			'/read-source-code/': [
				{
				  text: '总则',
				  items: [{ text: '共读规则', link: '/read-source-code/index' }],
				},
				{
				  text: '公告',
				  items: [
					{
					  text: '第56期 | 开发小程序又一新选择 vue-mini，据说性能是 Taro 的 10 倍，遥遥领先',
					  link: '/read-source-code/p56',
					},
					{
					  text: '第55期 | Taro 源码揭秘 3. taro init',
					  link: '/read-source-code/p55',
					},
					{
					  text: '第54期 | Taro 源码揭秘 2. 插件机制',
					  link: '/read-source-code/p54',
					},
					{
					  text: '第53期 | Taro 源码揭秘 1. taro init 初始化项目',
					  link: '/read-source-code/p53',
					},
					{
					  text: '第52期 | 分析 vant4 组件库源码，写一个 Vue3 highlight 高亮文本的组件',
					  link: '/read-source-code/p52',
					},
					{
					  text: '第51期 | fileSaver 考虑周到的下载文件库',
					  link: '/read-source-code/p51',
					},
					{
					  text: '第50期 | 剖析 localForage 源码，学习本地存储库原理',
					  link: '/read-source-code/p50',
					},
					{
					  text: '第49期 | 剖析 hotkeys-js 源码，学会快捷键实现原理',
					  link: '/read-source-code/p49',
					},
					{
					  text: '第48期 | axios 是如何打包发布的，如何开发工具库',
					  link: '/read-source-code/p48',
					},
					{
					  text: '第47期 | vant4.0 正式发布了，分析其源码学会用 vue3 写一个图片懒加载组件！',
					  link: '/read-source-code/p47',
					},
					{
					  text: '第46期 _ 分析 vant4 源码，学会用 vue3 + ts 开发毫秒级渲染的倒计时组件，真是妙啊',
					  link: '/read-source-code/p46',
					},
					{
					  text: '第45期 | 分析 vant4 源码，如何用 vue3 + ts 开发一个瀑布流滚动加载的列表组件？',
					  link: '/read-source-code/p45',
					},
					{
					  text: '第44期 | 神器啊，从未想过 VSCode 还能这样直接打开仓库URL，原理揭秘~',
					  link: '/read-source-code/p44',
					},
					{
					  text: '第43期 | 学习 react-use 源码，写自定义 hooks 越来越顺',
					  link: '/read-source-code/p43',
					},
					{
					  text: '第42期 | 跟着 vant4 源码学习如何用 vue3+ts 开发一个 loading 组件，仅88行代码',
					  link: '/read-source-code/p42',
					},
					{
					  text: '第41期 | vant 4 正式发布了，支持暗黑主题，那么是如何实现的呢',
					  link: '/read-source-code/p41',
					},
					{
					  text: '第40期 | vite 是如何解析用户配置的 .env 的',
					  link: '/read-source-code/p40',
					},
					{
					  text: '第39期 | 如何发布一个 npm 库，自动化管理版本号、生成 changelog、tag 等',
					  link: '/read-source-code/p39',
					},
					{
					  text: '第38期 | 经常用 vant-weapp 开发小程序，却不知道如何开发一个组件？学！',
					  link: '/read-source-code/p38',
					},
					{
					  text: '第37期 | vite 3.0 都发布了，经常初始化 vite 项目，却不知 create-vite 原理？揭秘！',
					  link: '/read-source-code/p37',
					},
					{
					  text: '第36期 | 可能是历史上最简单的一期 omit.js 剔除对象中的属性',
					  link: '/read-source-code/p36',
					},
					{
					  text: '第35期 | 为 vite 项目自动添加 eslint 和 prettier',
					  link: '/read-source-code/p35',
					},
					{ text: '第34期 | tdesign-vue 初始化组件', link: '/read-source-code/p34' },
					{ text: '第33期 | arrify 转数组', link: '/read-source-code/p33' },
					{ text: '第32期 | yocto-queue 队列 链表', link: '/read-source-code/p32' },
					{ text: '第31期 | p-limit 限制并发数', link: '/read-source-code/p31' },
					{
					  text: '第30期 | @tarojs_plugin-mini-ci 小程序上传代码 ci',
					  link: '/read-source-code/p30',
					},
					{ text: '第29期 | quick-lru', link: '/read-source-code/p29' },
					{
					  text: '第28期 | vue react 小程序 message 组件',
					  link: '/read-source-code/p28',
					},
					{ text: '第27期 | read-pkg', link: '/read-source-code/p27' },
					{ text: '第26期 | classnames', link: '/read-source-code/p26' },
					{ text: '第25期 | 跟着underscore学防抖', link: '/read-source-code/p25' },
					{ text: '第24期 | vue2工具函数', link: '/read-source-code/p24' },
					{
					  text: '第23期 | 为什么 Vue2 this 能够直接获取到 data 和 methods',
					  link: '/read-source-code/p23',
					},
					{ text: '第22期 | dotenv', link: '/read-source-code/p22' },
					{ text: '第21期 | await-to-js', link: '/read-source-code/p21' },
					{ text: '第20期 | install-pkg', link: '/read-source-code/p20' },
					{ text: '第19期 | axios 工具函数', link: '/read-source-code/p19' },
					{
					  text: '第18期 | delay  带取消功能的延迟函数',
					  link: '/read-source-code/p18',
					},
					{ text: '第17期 | js-cookie', link: '/read-source-code/p17' },
					{ text: '第16期 | 一行代码统一规范 包管理器', link: '/read-source-code/p16' },
					{ text: '第15期 | element 初始化组件功能', link: '/read-source-code/p15' },
					{ text: '第14期 | promisify', link: '/read-source-code/p14' },
					{ text: '第13期 | open 打开浏览器', link: '/read-source-code/p13' },
					{ text: '第12期 | 尤雨溪推荐 的ni 神器', link: '/read-source-code/p12' },
					{ text: '第11期 | 玩具 vite', link: '/read-source-code/p11' },
					{ text: '第10期 | configstore 存储', link: '/read-source-code/p10' },
					{
					  text: '第9期 | create-vue Vue 团队公开的全新脚手架工具',
					  link: '/read-source-code/p9',
					},
					{ text: '第8期 | mitt、tiny-emitter 发布订阅', link: '/read-source-code/p8' },
					{
					  text: '第7期 | validate-npm-package-name 检测 npm 包是否符合标准',
					  link: '/read-source-code/p7',
					},
					{
					  text: '第6期 | update-notifier 检测 npm 包是否更新',
					  link: '/read-source-code/p6',
					},
					{
					  text: '第5期 | koa-compose 相对较难，觉得难可跳过',
					  link: '/read-source-code/p5',
					},
					{ text: '第4期 | co 源码 觉得较难可先跳过', link: '/read-source-code/p4' },
					{
					  text: '第3期 | vue 3.2 是怎么发布的 vue-release',
					  link: '/read-source-code/p3',
					},
					{ text: '第2期 | vue3 工具函数', link: '/read-source-code/p2' },
					{ text: '第1期 | vue-devtools', link: '/read-source-code/p1' },
				  ],
				},
			  ],
		},
	},
});
