import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
	"/": [
		{
			text: "目录", // 必要的
			prefix: "/", // 可选的, 应该是一个绝对路径
			// collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2,    // 可选的, 默认值是 1
			children: [
			// '../../README.md',
			]
		},
		{
			text: "taro源码揭秘", // 必要的
			// path: '/about/',      // 可选的, 应该是一个绝对路径
			// collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			children: [
				"/taro/cli-init/",
				"/taro/cli-plugins/",
				"/taro/cli-init-2/",
			],
		},
		{
			text: "vant组件库源码", // 必要的
			// path: '/about/',      // 可选的, 应该是一个绝对路径
			// collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			children: [
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
			children: [
				"/vue-mini-analysis/",
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
				"/jquery/",
			],
		},
		{
			text: "面试官问系列", // 必要的
			// path: '/about/',      // 可选的, 应该是一个绝对路径
			collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			children: [
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
			children: [
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
			children: [
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
			children: ["/poetry/2012-2016/", "/poetry/2013/"],
		},
		{
			text: "年度总结", // 必要的
			// path: '/about/',      // 可选的, 应该是一个绝对路径
			collapsible: true, // 可选的, 默认值是 true,
			// sidebarDepth: 2, // 可选的, 默认值是 1
			children: [
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
			children: ["/about/"],
		},
	],
});
