import { defineUserConfig } from "vuepress";
// import pluginTyped from "./components/plugin-typed/node/index";
import pluginSide from "./components/plugin-side/src/node/index";
// import { backToTopPlugin } from "@vuepress/plugin-back-to-top";
import { googleAnalyticsPlugin } from "@vuepress/plugin-google-analytics";
import { searchProPlugin } from "vuepress-plugin-search-pro";
import theme from "./theme.js";

export default defineUserConfig({
	// 设置正在使用的语言
	lang: "zh-CN",
	base: "/",
	title: "若川的博客",
	keywords:
		"若川，微信搜索「若川视野」关注我，长期交流学习。写有《学习源码整体架构系列》。包含jquery源码、underscore源码、lodash源码、sentry源码、vuex源码、axios源码、koa源码、redux源码、vue-devtools源码、vuex4源码。前端路上，PPT爱好者，所知甚少，唯善学。",
	description:
		"若川，微信搜索「若川视野」关注我，长期交流学习。写有《学习源码整体架构系列》。包含jquery源码、underscore源码、lodash源码、sentry源码、vuex源码、axios源码、koa源码、redux源码。前端路上，PPT爱好者，所知甚少，唯善学。",
	//   locales: {
	//     "/": {
	//       lang: "en-US",
	//       title: "Docs Demo",
	//       description: "A docs demo for vuepress-theme-hope",
	//     },
	//     "/zh/": {
	//       lang: "zh-CN",
	//       title: "文档演示",
	//       description: "vuepress-theme-hope 的文档演示",
	//     },
	//   },
	head: [
		["link", { rel: "icon", href: "/favicon.ico" }],
		["link", { rel: "mainfest", href: "/mainfest.json" }],
		// [
		// 	'script',
		// 	{ charset: 'utf-8', src: 'https://my.openwrite.cn/js/readmore.js' },
		// ],
		/**
	 *
	// 添加cnzz统计
	[
		"script",
		{
			src: "https://s19.cnzz.com/z_stat.php?id=1273798602&web_id=1273798602",
			defer: "defer",
		}
	],
	 */
		// 添加百度统计
		[
			"script",
			{
				defer: "defer",
			},
			`
		var _hmt = _hmt || [];
		(function() {
		  var hm = document.createElement("script");
		  hm.src = "https://hm.baidu.com/hm.js?b0077938fa555dbb43c9dd96d20e9b79";
		  var s = document.getElementsByTagName("script")[0];
		  s.parentNode.insertBefore(hm, s);
		})();
		`,
		],
	],
	theme,
	// Enable it with pwa
	// shouldPrefetch: false,
	plugins: [
		// pluginTyped,
		pluginSide,
		// backToTopPlugin(),
		googleAnalyticsPlugin({
			// 配置项
			// ga: "UA-145436866-1", // UA-00000000-0
			id: "UA-145436866-1",
		}),
		searchProPlugin({
			// 配置选项
			indexContent: true,
		}),
	],
});
