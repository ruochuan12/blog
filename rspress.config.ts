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
	//   icon: '/favicon.ico',
	//   logo: {
	//     light: '/rspress-light-logo.png',
	//     dark: '/rspress-dark-logo.png',
	//   },
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
				link: "https://www.yuque.com/ruochuan12/notice/p0",
				items: [
					{
						text: "语雀链接",
						link: "https://www.yuque.com/ruochuan12/notice/p0",
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
		},
	},
});
