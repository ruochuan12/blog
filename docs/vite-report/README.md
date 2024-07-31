# vite 那些常用的小技巧

## 1. 前言

大家好，我是[若川](https://ruochuan12.github.io)，欢迎 `follow` [我的 github](https://github.com/ruochuan12)。我倾力持续组织了一年多[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（5.7k+人）第一的专栏，写有20余篇源码文章。


我常建议大家公司项目之外，有时间也可以多参与开源项目。

1. 分析的打包依赖大小
   1. 配置命令到 package.json
2. echarts 按需引入
3.

初始化项目

```bash
npm init vite
```

### 环境准备

## vite.config.ts 配置

## 配置别名

```js
{
  resolve: {
    // 起个别名，在引用资源时，可以用‘@/资源路径’直接访问
    alias: {
      '@': _resolve('src'),
    },
  },
}
```

## 生产环境 移除 console.log、debugger

```js
{
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}
```

## 打包分析依赖大小

用过 webpack 的小伙伴都知道，有一个很好用的打包文件可视化分析的插件，webpack-bundle-analyzer

rollup-plugin-bundle-analyzer

### rollup-plugin-bundle-analyzer

### rollup-plugin-visualizer


但每次打包编译都打开输出页面，也是不合适。
所以这时我们考虑加个命令行的参数。

```bash
npm run build:report
```

```json
{
  "scripts": {
    "build:report": "tsc && vite build -- report",
  }
}
```

vite 源码用的是 [cac](https://github.com/cacjs/cac) 。会报错。

minimist 解析命令行参数

[How to remove console.log ,when vite build use esbuild? #7920](https://github.com/vitejs/vite/discussions/7920)

行文至此，文章接近尾声。
完整代码。方便读者朋友们复制粘贴。

```js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import bundleAnalyzer from 'rollup-plugin-bundle-analyzer';
import { visualizer } from 'rollup-plugin-visualizer';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import minimist from 'minimist';

function _resolve(dir: string) {
  return resolve(__dirname, dir);
}

const params = process.argv.slice(2);
const paramsDefault = {
  default: {
    report: false,
  },
  boolean: ['report'],
};

const args = minimist(params);
let report = false;
try {
  report = params.includes('report');
} catch (e) {
  console.log('parse custom params error', e);
}

console.log(params, args, report, paramsDefault);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '');
  const plugins = !report
    ? []
    : [
        bundleAnalyzer({
          port: 9800,
          openBrowser: true,
        }),
        visualizer({
          gzipSize: true,
          brotliSize: true,
          emitFile: false,
          filename: 'report.html', //分析图生成的文件名
          open: true, //如果存在本地服务端口，将在打包后自动展示
        }),
      ];
  // console.log('env', env);
  return {
    // 起个别名，在引用资源时，可以用‘@/资源路径’直接访问
    resolve: {
      alias: {
        '@': _resolve('src'),
      },
    },
    // vite 配置
    define: {
      // __APP_ENV__: JSON.stringify(env.APP_ENV),
      BASE_URL: JSON.stringify(env.VITE_BASE_URL),
      __DEV__: JSON.stringify(env.NODE_ENV === 'development'),
    },
    plugins: [react(), ...plugins],
    // https://cn.vitejs.dev/config/server-options.html#server-proxy
    // server.cors
    server: {
      cors: true,
      proxy: {
        '/api': {
          target: 'https://ruochuan12.github.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});

```


## 8. 加源码共读交流群

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)，欢迎 `follow` [我的 github](https://github.com/ruochuan12)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（5.7k+人）第一的专栏，写有20余篇源码文章。

我倾力持续组织了一年多[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。

