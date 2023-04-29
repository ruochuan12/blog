import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
	{ text: "目录", link: "/" },
	{
		text: "关于我",
		link: "/about/"
	},
	{
		text: '曾经写的"诗词"',
		link: "/poetry/2012-2016/"
	},
	{
		text: "掘金",
		link: "https://juejin.cn/user/1415826704971918/columns"
	},
	{
		text: "Github",
		link: "https://github.com/lxchuan12/blog"
	},
	{ text: "公众号：若川视野", link: "https://image-static.segmentfault.com/355/182/3551821948-5df888aa1dc88_articlex" },

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
		children: [
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
		children: [
			{
				text: "程序员指北 koala",
				link: "http://www.inode.club"
			},
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
			},
			{
				text: "全栈大前端",
				link: "http://www.ffbig.cn"
			},
			{
				text: "JasonSubmara 的博客",
				link: 'https://submara.com/Geek'
			}
		]
	}
]);
