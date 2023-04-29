import { path } from '@vuepress/shared-utils';

export default {
  enhanceAppFiles: [
    path.resolve(__dirname, 'enhanceAppFile.js')
  ],

  globalUIComponents: 'RightSide'
}
