// .vuepress/enhanceApp.js
// 全局注册 Element 组件库
import Vue from 'vue'
// import Element from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'

export default ({
  Vue,
  options,
  router
}) => {
	var script = document.createElement('script');
	script.src = 'https://s19.cnzz.com/z_stat.php?id=1273798602&web_id=1273798602';
	document.body.append(script);
}
