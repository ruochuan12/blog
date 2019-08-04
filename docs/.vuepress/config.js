console.log(__dirname, 'dirname');
module.exports = {
	title: '若川的博客',
	keywords: '若川，罗小川chuan，罗小川，luoxiaochuan，lxchuan12。前端路上，PPT爱好者，所知甚少，唯善学。',
    description: '若川的前端视野',
    head: [
        // ['link', { rel: 'icon', href: '/img/logo.ico' }],
        ['link', { rel: 'mainfest', href: '/mainfest.json' }],
    ],
    port: 4000,
    markdown: {
      lineNumbers: false
    },
    serviceWorker: true, // 是否开启 PWA
    themeConfig: {
        nav: [
            { text: '主页', link: '/' },
            { text: '博文',
              items: [
                {
                  text: '学习 jQuery 源码整体架构，打造属于自己的 js 类库',
				  link: '/jQuery/'
                },
				{
					text: '高考七年后、工作三年后的感悟',
					link: '/20190612-after-3-year-work/',
				},
                {
                  text: '面试官问：JS的继承',
				  link: '/inherit/'
				},
				{
					text: '工作一年后，我有些感悟',
					link: '/20170602-After-a-year-s-work-I-had-some-insights/',
				},
				{
					text: '我是如何踏上前端这条路的',
					link: '/20160907-How-do-I-set-foot-on-the-front-end-of-the-road/',
				}
              ]
            },
            {
				text: '关于我',
				link: '/about/'
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
				text: 'segmentFault',
				link: 'https://segmentfault.com/u/lxchuan12/',
			},
			{
				text: '其他',
				items: [
					{
						text: '简书',
						link: 'http://www.jianshu.com/users/83129d433d72/latest_articles',
					},
					{
						text: '知乎',
						link: 'https://www.zhihu.com/people/lxchuan12/activities',
					},
					{
						text: '微博',
						link: 'http://weibo.com/lxchuan12'
					},
				],
			}
        ],
		sidebar: 'auto',
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
