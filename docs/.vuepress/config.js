console.log(__dirname, "dirname");
const TinyimgPlugin = require('tinyimg-webpack-plugin');
module.exports = {
	title: "若川的博客",
	keywords:
		"若川，微信搜索「若川视野」关注我，长期交流学习。写有《学习源码整体架构系列》。包含jquery源码、underscore源码、lodash源码、sentry源码、vuex源码、axios源码、koa源码、redux源码、vue-devtools源码、vuex4源码。前端路上，PPT爱好者，所知甚少，唯善学。",
	description: "若川，微信搜索「若川视野」关注我，长期交流学习。写有《学习源码整体架构系列》。包含jquery源码、underscore源码、lodash源码、sentry源码、vuex源码、axios源码、koa源码、redux源码。前端路上，PPT爱好者，所知甚少，唯善学。",
	head: [
		["link", { rel: "icon", href: "/favicon.ico" }],
		["link", { rel: "mainfest", href: "/mainfest.json" }],
		// [
		// 	'script',
		// 	{ charset: 'utf-8', src: 'https://my.openwrite.cn/js/readmore.js' },
		// ],
		// 添加cnzz统计
		[
			"script",
			{
				src: "https://s19.cnzz.com/z_stat.php?id=1273798602&web_id=1273798602",
				defer: "defer",
			}
		]
	],
	port: 4000,
	markdown: {
		lineNumbers: false
	},
	plugins: [
		require('./components/plugin-typed/index.js'),
		require('./components/plugin-side/index.js'),
		"@vuepress/back-to-top",
		[
			"@vuepress/google-analytics",
			{
				ga: "UA-145436866-1" // UA-00000000-0
			}
		],
		[
			"@vuepress/medium-zoom"
			// {
			// 	selector: 'img',
			// 	// medium-zoom options here
			// 	// See: https://github.com/francoischalifour/medium-zoom#options
			// 	options: {
			// 		margin: 16
			// 	}
			// }
		],
		[
			'@vuepress/pwa',
			{
				serviceWorker: true,
				// https://v1.vuepress.vuejs.org/zh/plugin/official/plugin-pwa.html
				updatePopup: {
					message: "发现博客有更新啦",
					buttonText: "刷新"
				}
			}
		]
	],
	serviceWorker: true, // 是否开启 PWA
	themeConfig: {
		nav: [
			// { text: '目录', link: '/posts/' },
			{ text: "公众号：若川视野", link: "https://image-static.segmentfault.com/355/182/3551821948-5df888aa1dc88_articlex" },
			{ text: "目录", link: "/" },
			// { text: '博文',
			//   items: [
			// 	{
			// 		text: '最新文章',
			// 		link: '/underscore/',
			// 	},
			// 	{
			// 		text: '学习 underscore 源码整体架构，打造属于自己的函数式编程类库',
			// 		link: '/underscore/',
			// 	},
			//     {
			//       text: '学习 jQuery 源码整体架构，打造属于自己的 js 类库',
			// 	  link: '/jquery/'
			//     },
			// 	{
			// 		text: '高考七年后、工作三年后的感悟',
			// 		link: '/20190612-after-3-year-work/',
			// 	},
			//     {
			//       text: '面试官问：JS的继承',
			// 	  link: '/js-extend/'
			// 	},
			//     {
			// 		text: '面试官问：JS的this指向',
			// 		link: '/js-this/'
			// 	},
			//     {
			// 		text: '面试官问：能否模拟实现JS的call和apply方法',
			// 		link: '/js-implement-call-apply/'
			// 	},
			//     {
			// 		text: '面试官问：能否模拟实现JS的bind方法',
			// 		link: '/js-implement-bind/'
			// 	},
			//     {
			// 		text: '面试官问：能否模拟实现JS的new操作符',
			// 		link: '/js-implement-new/'
			// 	},
			//     {
			// 		text: '前端使用puppeteer 爬虫生成《React.js 小书》PDF并合并',
			// 		link: '/puppeteer-create-pdf-and-merge/'
			// 	},
			//     {
			// 		text: '分析vue-cli@2.9.3 搭建的webpack项目工程',
			// 		link: '/vue-cli-2-webpack/'
			// 	},
			//     {
			// 		text: 'oh my zsh 和 windows git bash 设置别名提高效率',
			// 		link: '/oh-my-zsh/'
			// 	},
			//     {
			// 		text: 'vue 2.x项目 vue-qriously 生成二维码并下载、cliploard复制粘贴',
			// 		link: '/vue-2-qrcode/'
			// 	},
			//     {
			// 		text: 'JavaScript 对象所有API解析',
			// 		link: '/js-object-api/'
			// 	},
			//     {
			// 		text: '《JavaScript语言精粹 修订版》 读书笔记',
			// 		link: '/js-book/'
			// 	},
			// 	{
			// 		text: '工作一年后，我有些感悟',
			// 		link: '/20170602-After-a-year-s-work-I-had-some-insights/',
			// 	},
			// 	{
			// 		text: '我是如何踏上前端这条路的',
			// 		link: '/20160907-How-do-I-set-foot-on-the-front-end-of-the-road/',
			// 	}
			//   ]
			// },
			{
				text: "关于我",
				link: "/about/"
			},
			{
				text: '曾经写的"诗词"',
				link: "/poetry/2012-2016/"
			},
			{
				text: "Github",
				link: "https://github.com/lxchuan12/blog"
			},
			{
				text: "掘金",
				link: "https://juejin.im/user/1415826704971918/posts"
			},
			{
				text: "知乎",
				link: "https://www.zhihu.com/people/lxchuan12/activities"
			},
			{
				text: "语雀",
				link: "https://www.yuque.com/lxchuan12/blog"
			},
			{
				text: "其他",
				items: [
					{
						text: "segmentFault",
						link: "https://segmentfault.com/u/lxchuan12/articles"
					},
					{
						text: "微博",
						link: "http://weibo.com/lxchuan12"
					},
					{
						text: "简书",
						link: "http://www.jianshu.com/users/83129d433d72/latest_articles"
					}
				]
			},
			{
				text: "友链",
				items: [
					// {
					// 	text: "程序员指北 koala",
					// 	link: "http://www.inode.club"
					// },
					{
						text: "山月",
						link: "https://shanyue.tech"
					},
					{
						text: "lucifer",
						link: "http://lucifer.ren"
					},
					{
						text: "童欧巴",
						link: "https://hungryturbo.com"
					},
					{
						text: "scarsu",
						link: "https://www.scarsu.com/"
					},
					{
						text: "lencx的博客",
						link: "https://mtc.nofwl.com/",
					},
					{
						text: "itclanCoder",
						link: "https://coder.itclan.cn/"
					},
					{
						text: "编程之上",
						link: "https://ruizhengyun.cn"
					}
				]
			}
		],
		// sidebar: 'auto',
		sidebar: [
			{
				title: "目录", // 必要的
				path: "/" // 可选的, 应该是一个绝对路径
				// collapsable: true, // 可选的, 默认值是 true,
				// sidebarDepth: 2,    // 可选的, 默认值是 1
				// children: [
				// '../../README.md',
				// ]
			},
			{
				title: "学习源码系列", // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2, // 可选的, 默认值是 1
				children: [
					'/element-new/',
					'/debug/',
					'/promisify/',
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
					"/jquery/"
				]
			},
			{
				title: "面试官问系列", // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2, // 可选的, 默认值是 1
				children: [
					"/js-extend/",
					"/js-this/",
					"/js-implement-call-apply/",
					"/js-implement-bind/",
					"/js-implement-new/"
				]
			},
			{
				title: "历史文章", // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2, // 可选的, 默认值是 1
				children: [
					"/puppeteer-create-pdf-and-merge/",
					"/vue-cli-2-webpack/",
					"/oh-my-zsh/",
					"/20180421-youzan-front-end-tech-open-day/",
					"/vue-2-qrcode/",
					"/js-object-api/",
					"/js-book/"
				]
			},
			{
				title: "杂文", // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2, // 可选的, 默认值是 1
				children: [
					"/goal/",
					"/20190612-after-3-year-work/",
					"/20170602-After-a-year-s-work-I-had-some-insights/",
					"/20160907-How-do-I-set-foot-on-the-front-end-of-the-road/"
				]
			},
			{
				title: '曾经写的"诗词"', // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2, // 可选的, 默认值是 1
				children: ["/poetry/2012-2016/", "/poetry/2013/"]
			},
			{
				title: "年度总结", // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2, // 可选的, 默认值是 1
				children: [
					"/annual-summary/2020/",
					"/annual-summary/2019/",
					"/annual-summary/2018/",
					"/annual-summary/2017/",
					"/annual-summary/2016/"
				]
			},
			{
				title: "关于", // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2, // 可选的, 默认值是 1
				children: ["/about/"]
			}
		],
		// sidebarDepth: 3,
		lastUpdated: "最后更新时间"
	},
	// configureWebpack: {
	// 	resolve: {
	// 		alias: {
	// 			'@images': '../images/'
	// 		}
	// 	}
	// },
	chainWebpack (config, isServer) {
		config.resolve.alias.set("@images", "../images/");
		// config.module
		// 	.rule('images').uses.clear();
		config.module
		.rule('images')
		// .test(/\.(png|jpe?g|gif)(\?.*)?$/)
		.use('url-loader')
			.loader('url-loader')
			.tap(options => {
				options.esModule = false;
				return options;
			})
			.end()
			.use("image-webpack-loader")
		 	.loader("image-webpack-loader")
		 	.options({
				disable: true,
				esModule: false,
				// mozjpeg: {
				// 	quality: 65
				// },
				// pngquant: {
				// 	quality: [0.65, 0.9],
				// 	speed: 4
				// },
				// svgo: {
				// 	plugins: [
				// 		{
				// 			removeViewBox: false
				// 		},
				// 		{
				// 			removeEmptyAttrs: false
				// 		}
				// 	]
				// },
				// gifsicle: {
				// 	optimizationLevel: 7,
				// 	interlaced: false
				// },
				// optipng: {
				// 	optimizationLevel: 7,
				// 	interlaced: false
				// },
				// webp: {
				// 	quality: 75
				// }
			}
		);
	},
	configureWebpack: {
		plugins: [
			new TinyimgPlugin({
				enabled: process.env.NODE_ENV === "production",
				logged: true
			})
		],
	},
};
