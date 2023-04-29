import { hopeTheme } from "vuepress-theme-hope";
import {
	// enNavbar,
	zhNavbar,
} from "./navbar/index.js";
import {
	// enSidebar,
	zhSidebar,
} from "./sidebar/index.js";

export default hopeTheme({
	hostname: "https://lxchuan12.cn",

	author: {
		name: "若川",
		url: "https://lxchuan12.cn",
	},

	iconAssets: "iconfont",

	logo: "/logo.jpg",

	repo: "lxchuan12/blog",

	docsDir: "docs",

	locales: {
		// "/": {
		//   // navbar
		//   navbar: enNavbar,

		//   // sidebar
		//   sidebar: enSidebar,

		//   footer: "Default footer",

		//   displayFooter: true,

		//   metaLocales: {
		//     editLink: "Edit this page on GitHub",
		//   },
		// },

		/**
		 * Chinese locale config
		 */
		"/": {
			// navbar
			navbar: zhNavbar,

			// sidebar
			sidebar: zhSidebar,

			footer: "欢迎加我微信 <a href='https://juejin.cn/pin/7217386885793595453'>ruochuan02</a>，参加源码共读，一起学习源码",

			displayFooter: true,

			// page meta
			metaLocales: {
				editLink: "在 GitHub 上编辑此页",
				lastUpdated: "最后更新时间",
			},
		},
	},

	encrypt: {
		config: {
			"/demo/encrypt.html": ["1234"],
			"/zh/demo/encrypt.html": ["1234"],
		},
	},

	plugins: {
		comment: {
			// @ts-expect-error: You should generate and use your own comment service
			// provider: "Waline",
		},

		// all features are enabled for demo, only preserve features you need here
		mdEnhance: {
			align: true,
			attrs: true,
			chart: true,
			codetabs: true,
			demo: true,
			echarts: true,
			figure: true,
			flowchart: true,
			gfm: true,
			imgLazyload: true,
			imgSize: true,
			include: true,
			katex: true,
			mark: true,
			mermaid: true,
			playground: {
				presets: ["ts", "vue"],
			},
			presentation: {
				plugins: ["highlight", "math", "search", "notes", "zoom"],
			},
			stylize: [
				{
					matcher: "Recommended",
					replacer: ({ tag }) => {
						if (tag === "em")
							return {
								tag: "Badge",
								attrs: { type: "tip" },
								content: "Recommended",
							};
					},
				},
			],
			sub: true,
			sup: true,
			tabs: true,
			vPre: true,
			vuePlayground: true,
		},

		// uncomment these if you want a pwa
		pwa: {
			favicon: "/favicon.ico",
			cacheHTML: true,
			cachePic: true,
			appendBase: true,
			apple: {
				icon: "/assets/icon/apple-icon-152.png",
				statusBarColor: "black",
			},
			msTile: {
				image: "/assets/icon/ms-icon-144.png",
				color: "#ffffff",
			},
			manifest: {
				icons: [
					{
						src: "/assets/icon/chrome-mask-512.png",
						sizes: "512x512",
						purpose: "maskable",
						type: "image/png",
					},
					{
						src: "/assets/icon/chrome-mask-192.png",
						sizes: "192x192",
						purpose: "maskable",
						type: "image/png",
					},
					{
						src: "/assets/icon/chrome-512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "/assets/icon/chrome-192.png",
						sizes: "192x192",
						type: "image/png",
					},
				],
				shortcuts: [
					{
						name: "Demo",
						short_name: "Demo",
						url: "/demo/",
						icons: [
							{
								src: "/assets/icon/guide-maskable.png",
								sizes: "192x192",
								purpose: "maskable",
								type: "image/png",
							},
						],
					},
				],
			},
		},

		copyright: true,
	},

	themeColor: {
		blue: "#2196f3",
		red: "#f26d6d",
		green: "#3eaf7c",
		orange: "#fb9b5f",
	},

	fullscreen: true,
	contributors: false,
});
