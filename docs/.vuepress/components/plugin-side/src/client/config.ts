import { defineClientConfig } from '@vuepress/client'
import RightSide from './RightSide.vue';

// import Vue from 'vue';
export default defineClientConfig({
  rootComponents: [RightSide],
  enhance: ({ app, router, siteData }) => {
    app.component("RightSide", RightSide);
  },
})
