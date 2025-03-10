# 11. 读取文件


##

```ts
export default class TaroMiniPlugin {
  /**
   * 分析 app 入口文件，搜集页面、组件信息，
   * 往 this.dependencies 中添加资源模块
   */
  async run (compiler: Compiler) {
    if (this.options.isBuildPlugin) {
      this.getPluginFiles()
      this.getConfigFiles(compiler)
    } else {
      this.appConfig = await this.getAppConfig()
      this.getPages()
      this.getPagesConfig()
      this.getDarkMode()
      this.getConfigFiles(compiler)
      this.addEntries()
    }
  }
}
```
