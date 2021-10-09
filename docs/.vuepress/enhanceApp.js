// .vuepress/enhanceApp.js
// 全局注册 Element 组件库
// import Vue from 'vue'
// import Element from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'

// export default ({
//   Vue,
//   options,
//   router
// }) => {
// 	var script = document && document.createElement('script');
// 	script.src = 'https://s19.cnzz.com/z_stat.php?id=1273798602&web_id=1273798602';
// 	document && document.body.append(script);
// }

export default ({ router }) => {
  /**
   * 路由切换事件处理
   */
  router.beforeEach((to, from, next) => {
    console.log("切换路由", to.fullPath, from.fullPath);

    //发送cnzz的pv统计
    if (typeof _czc !== "undefined") {
      if (to.path) {
        _czc.push(["_trackPageview", to.fullPath, from.fullPath]);
        console.log("上报cnzz统计", to.fullPath);
      }
    }

    // continue
    next();
  });
};