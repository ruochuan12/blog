import { defineClientConfig } from '@vuepress/client'
// import Typed from './Typed.vue';
import VueTypedJs from 'vue-typed-js';

// import Vue from 'vue';
export default defineClientConfig({
//   rootComponents: [VueTypedJs],
  enhance: ({ app, router, siteData }) => {
    app.component("vue-typed-js", VueTypedJs);
	// app.use(VueTypedJs)
  },
})
