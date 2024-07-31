import type { Plugin } from '@vuepress/core';
import { getDirname, path } from '@vuepress/utils';
// import pkg from '@vuepress/utils';
// const { getDirname, path } = pkg;

const __dirname = getDirname(import.meta.url)

export const typedPlugin = (): Plugin => ({
  name: 'plugin-vue-type-js',

  clientConfigFile: path.resolve(__dirname, '../client/config.ts'),
})

