console.log(__dirname, 'dirname');
module.exports = {
	title: '若川的博客',
	keywords: '若川，罗小川chuan，罗小川，luoxiaochuan，lxchuan12。前端路上，PPT爱好者，所知甚少，唯善学。',
    description: '若川的前端视野',
    head: [
        ['link', { rel: 'icon', href: '/favicon.ico' }],
        ['link', { rel: 'mainfest', href: '/mainfest.json' }],
    ],
    port: 4000,
    markdown: {
      lineNumbers: false,
	},
	plugins: [
		'@vuepress/back-to-top',
		[
			'@vuepress/google-analytics',
			{
				'ga': 'UA-145436866-1' // UA-00000000-0
			},
		],
		[
			'@vuepress/medium-zoom',
			// {
			// 	selector: 'img',
			// 	// medium-zoom options here
			// 	// See: https://github.com/francoischalifour/medium-zoom#options
			// 	options: {
			// 		margin: 16
			// 	}
			// }
		],
	],
    serviceWorker: true, // 是否开启 PWA
    themeConfig: {
        nav: [
			{ text: '主页', link: '/' },
			{ text: '目录', link: '/posts/' },
			{ text: '最新文章', link: '/axios/' },
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
			// 	  link: '/jQuery/'
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
				text: '关于我',
				link: '/about/'
			},
			{
				text: '曾经写的"诗词"',
				link: '/poetry/2012-2016/',
			},
            {
				text: 'Github',
				link: 'https://github.com/lxchuan12/blog'
			},
            {
				text: '掘金',
				link: 'https://juejin.im/user/57974dc55bbb500063f522fd/posts'
			},
			{
				text: '知乎',
				link: 'https://www.zhihu.com/people/lxchuan12/activities',
			},
			{
				text: '其他',
				items: [
					{
						text: 'segmentFault',
						link: 'https://segmentfault.com/u/lxchuan12/',
					},
					{
						text: '简书',
						link: 'http://www.jianshu.com/users/83129d433d72/latest_articles',
					},
					{
						text: '微博',
						link: 'http://weibo.com/lxchuan12'
					},
					// {
					// 	text: 'hexo 博客 lxchuan12.cn',
					// 	link: 'http://lxchuan12.cn'
					// },
				],
			}
        ],
		// sidebar: 'auto',
		sidebar: [
			{
				title: '目录',   // 必要的
				path: '/posts/',      // 可选的, 应该是一个绝对路径
				// collapsable: true, // 可选的, 默认值是 true,
				// sidebarDepth: 2,    // 可选的, 默认值是 1
				// children: [
				// '../../README.md',
				// ]
			},
			{
				title: '学习源码系列',   // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2,    // 可选的, 默认值是 1
				children: [
				'/axios/',
				'/vuex/',
				'/sentry/',
				'/lodash/',
				'/underscore/',
				'/jQuery/',
				]
			},
			{
				title: '面试官问系列',   // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2,    // 可选的, 默认值是 1
				children: [
				'/js-extend/',
				'/js-this/',
				'/js-implement-call-apply/',
				'/js-implement-bind/',
				'/js-implement-new/',
				]
			},
			{
				title: '历史文章',   // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2,    // 可选的, 默认值是 1
				children: [
				'/puppeteer-create-pdf-and-merge/',
				'/vue-cli-2-webpack/',
				'/oh-my-zsh/',
				'/20180421-youzan-front-end-tech-open-day/',
				'/vue-2-qrcode/',
				'/js-object-api/',
				'/js-book/',
				]
			},
			{
				title: '杂文',   // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2,    // 可选的, 默认值是 1
				children: [
				'/20190612-after-3-year-work/',
				'/20170602-After-a-year-s-work-I-had-some-insights/',
				'/20160907-How-do-I-set-foot-on-the-front-end-of-the-road/',
				]
			},
			{
				title: '曾经写的"诗词"',   // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2,    // 可选的, 默认值是 1
				children: [
				'/poetry/2012-2016/',
				'/poetry/2013/',
				]
			},
			{
				title: '年度总结',   // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2,    // 可选的, 默认值是 1
				children: [
				'/annual-summary/2019/',
				'/annual-summary/2018/',
				'/annual-summary/2017/',
				'/annual-summary/2016/',
				]
			},
			{
				title: '关于',   // 必要的
				// path: '/about/',      // 可选的, 应该是一个绝对路径
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 2,    // 可选的, 默认值是 1
				children: [
				'/about/'
				]
			},
		],
        // sidebarDepth: 3,
        lastUpdated: '最后更新时间',
    },
    configureWebpack: {
      resolve: {
        alias: {
          '@images': '../images/',
        }
      }
    }
}
