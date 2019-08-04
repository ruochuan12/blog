console.log(__dirname, 'dirname');
module.exports = {
    title: '若川的博客',
    description: '若川的前端视野',
    head: [
        ['link', { rel: 'icon', href: '/img/logo.ico' }],
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
				link: 'https://github.com/lxchuan12'
			},
        ],
        sidebar: 'auto',
        // sidebarDepth: 3,
        lastUpdated: '最后更新时间：',
    },
    configureWebpack: {
      resolve: {
        alias: {
          '@images': '../images/',
        }
      }
    }
}
