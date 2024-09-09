import * as path from 'path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
//   root: 'docs',
  title: '若川的博客',
  description: '若川的博客',
//   lang: 'zh',
//   icon: '/favicon.ico',
//   logo: {
//     light: '/rspress-light-logo.png',
//     dark: '/rspress-dark-logo.png',
//   },
  route: {
    exclude: ['jquery', 'mini-webpack', '**/images/**/*', '**/**/README.md'],
    // exclude: ['**/fragments/**'],
	// extensions: ['.jsx', '.md', '.mdx'],
	cleanUrls: true,
  },

  themeConfig: {
    enableContentAnimation: true,
    footer: {
      message: '© 2024 若川',
    },
    hideNavbar: 'auto',
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/web-infra-dev/rspress',
      },
      {
        icon: 'discord',
        mode: 'link',
        content: 'https://discord.gg/mkVw5zPAtf',
      },
      {
        icon: 'x',
        mode: 'link',
        content: 'https://x.com/rspack_dev',
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

    sidebar: {
		'/': [
		  {
			text: '目录', // 必要的
			// prefix: '/README.md', // 可选的, 应该是一个绝对路径
			// collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2,    // 可选的, 默认值是 1
			items: [
			//   '../../README.md',
			],
		  },
		  {
			text: 'taro源码揭秘', // 必要的
			// path: '/about/README.md',      // 可选的, 应该是一个绝对路径
			// collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			items: [
			  '/taro/cli-init/README.md',
			  '/taro/cli-plugins/README.md',
			  '/taro/cli-init-2/README.md',
			  '/taro/cli-build/README.md',
			  '/taro/events/README.md',
			  '/taro/native-apis/README.md',
			],
		  },
		  {
			text: 'vant组件库源码', // 必要的
			// path: '/about/README.md',      // 可选的, 应该是一个绝对路径
			// collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			items: [
			  '/vant/highlight/README.md',
			  '/vant/lazyload/README.md',
			  '/vant/count-down/README.md',
			  '/vant/list/README.md',
			  '/vant/loading/README.md',
			  '/vant/dark-theme/README.md',
			],
		  },
		  {
			text: '学习源码系列', // 必要的
			// path: '/about/README.md',      // 可选的, 应该是一个绝对路径
			collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			items: [
			  '/vue-mini-analysis/README.md',
			  '/axios-build/README.md',
			  '/open-in-github/README.md',
			  '/react-use/README.md',
			  '/vue-debugger/README.md',
			  '/vant-weapp-stepper/README.md',
			  '/create-vite/README.md',
			  '/mini-ci/README.md',
			  '/dotenv/README.md',
			  '/delay/README.md',
			  '/install-pkg/README.md',
			  '/read-pkg/README.md',
			  '/only-allow/README.md',
			  '/element-new/README.md',
			  '/debug/README.md',
			  '/promisify/README.md',
			  '/open/README.md',
			  '/vue-utils/README.md',
			  '/ni/README.md',
			  '/vue-dev-server/README.md',
			  '/create-vue/README.md',
			  '/vue-this/README.md',
			  '/koa-compose/README.md',
			  '/vue-next-release/README.md',
			  '/vue-next-utils/README.md',
			  '/vue-devtools/README.md',
			  '/vuex-this/README.md',
			  '/vuex4/README.md',
			  '/open-in-editor/README.md',
			  '/redux/README.md',
			  '/koa/README.md',
			  '/axios/README.md',
			  '/vuex/README.md',
			  '/sentry/README.md',
			  '/lodash/README.md',
			  '/underscore/README.md',
			//   '/jquery/README.md',
			],
		  },
		  {
			text: '面试官问系列', // 必要的
			// path: '/about/README.md',      // 可选的, 应该是一个绝对路径
			collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			items: [
			  '/js-extend/README.md',
			  '/js-this/README.md',
			  '/js-implement-call-apply/README.md',
			  '/js-implement-bind/README.md',
			  '/js-implement-new/README.md',
			],
		  },
		  {
			text: '历史文章', // 必要的
			// path: '/about/README.md',      // 可选的, 应该是一个绝对路径
			collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			items: [
			  '/puppeteer-create-pdf-and-merge/README.md',
			  '/vue-cli-2-webpack/README.md',
			  '/oh-my-zsh/README.md',
			  '/20180421-youzan-front-end-tech-open-day/README.md',
			  '/vue-2-qrcode/README.md',
			  '/js-object-api/README.md',
			  '/js-book/README.md',
			],
		  },
		  {
			text: '杂文', // 必要的
			// path: '/about/README.md',      // 可选的, 应该是一个绝对路径
			collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			items: [
			  '/goal/README.md',
			  '/20190612-after-3-year-work/README.md',
			  '/20170602-After-a-year-s-work-I-had-some-insights/README.md',
			  '/20160907-How-do-I-set-foot-on-the-front-end-of-the-road/README.md',
			],
		  },
		  {
			text: '曾经写的"诗词"', // 必要的
			// path: '/about/README.md',      // 可选的, 应该是一个绝对路径
			// collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			items: ['/poetry/2012-2016/README.md', '/poetry/2013/'],
		  },
		  {
			text: '年度总结', // 必要的
			// path: '/about/README.md',      // 可选的, 应该是一个绝对路径
			collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			items: [
			  '/annual-summary/2021/README.md',
			  '/annual-summary/2020/README.md',
			  '/annual-summary/2019/README.md',
			  '/annual-summary/2018/README.md',
			  '/annual-summary/2017/README.md',
			  '/annual-summary/2016/README.md',
			],
		  },
		  {
			text: '关于', // 必要的
			// path: '/about/README.md',      // 可选的, 应该是一个绝对路径
			collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			items: ['/about/README.md'],
		  },
		],
	  },
  },
});
