# 分析vue-cli@2.9.3 搭建的webpack项目工程

>`写于2018年06月11日`

## 前言

>已经有很多分析`Vue-cli`搭建工程的文章，为什么自己还要写一遍呢。学习就好比是座大山，人们沿着不同的路登山，分享着自己看到的风景。你不一定能看到别人看到的风景，体会到别人的心情。只有自己去登山，才能看到不一样的风景，体会才更加深刻。

**项目放在笔者的`github`上，[分析vue-cli@2.9.3 搭建的webpack项目工程](https://github.com/lxchuan12/analyse-vue-cli)。方便大家克隆下载，或者在线查看。同时也求个`star` `^_^`，也是对笔者的一种鼓励和支持。**

正文从这里开始～

## 使用`vue-cli`初始化`webpack`工程

```bash
#	# 安装
npm install -g vue-cli
#	安装完后vue命令就可以使用了。实际上是全局注册了vue、vue-init、vue-list几个命令

# ubuntu 系统下
#	[vue-cli@2.9.3] link /usr/local/bin/vue@ -> /usr/local/lib/node_modules/vue-cli/bin/vue
#	[vue-cli@2.9.3] link /usr/local/bin/vue-init@ -> /usr/local/lib/node_modules/vue-cli/bin/vue-init
#	[vue-cli@2.9.3] link /usr/local/bin/vue-list@ -> /usr/local/lib/node_modules/vue-cli/bin/vue-list

vue list
#	可以发现有browserify、browserify-simple、pwa、simple、webpack、webpack-simple几种模板可选，这里选用webpack。

#	使用 vue init
vue init <template-name> <project-name>

#	例子
vue init webpack analyse-vue-cli
```
更多`vue-cli`如何工作的可以查看这篇文章[vue-cli是如何工作的](https://juejin.im/post/5a7b1b86f265da4e8f049081)，或者分析Vue-cli源码查看这篇[走进Vue-cli源码，自己动手搭建前端脚手架工具](https://segmentfault.com/a/1190000013975247)，再或者直接查看[vue-cli github仓库源码](https://github.com/vuejs/vue-cli/tree/master)

如果对`webpack`还不是很了解，可以查看[webpack官方文档中的概念](https://webpack.docschina.org/concepts/)，虽然是最新版本的，但概念都是差不多的。

## `package.json`

分析一个项目，一般从`package.json`的命令入口`scripts`开始。
```js
"scripts": {
  // dev webpack-dev-server --inline 模式 --progress 显示进度 --config 指定配置文件（默认是webpack.config.js）
  "dev": "webpack-dev-server --inline --progress --config build/webpack.dev.conf.js",
  "start": "npm run dev",
  // jest测试
  "unit": "jest --config test/unit/jest.conf.js --coverage",
  // e2e测试
  "e2e": "node test/e2e/runner.js",
  // 运行jest测试和e2e测试
  "test": "npm run unit && npm run e2e",
  // eslint --ext 指定扩展名和相应的文件
  "lint": "eslint --ext .js,.vue src test/unit test/e2e/specs",
  // node 执行build/build.js文件
  "build": "node build/build.js"
},
```
`Npm Script` 底层实现原理是通过调用 `Shell` 去运行脚本命令。`npm run start`等同于运行`npm run dev`。

`Npm Script` 还有一个重要的功能是能运行安装到项目目录里的 `node_modules` 里的可执行模块。

例如在通过命令`npm i -D webpack-dev-server`将`webpack-dev-server`安装到项目后，是无法直接在项目根目录下通过命令 `webpack-dev-server` 去执行 `webpack-dev-server` 构建的，而是要通过命令 `./node_modules/.bin/webpack-dev-server` 去执行。

`Npm Script` 能方便的解决这个问题，只需要在 `scripts` 字段里定义一个任务，例如：
```js
"dev": "webpack-dev-server --inline --progress --config build/webpack.dev.conf.js"
```
`Npm Script` 会先去项目目录下的 `node_modules` 中寻找有没有可执行的 `webpack-dev-server` 文件，如果有就使用本地的，如果没有就使用全局的。 所以现在执行 `webpack-dev-server` 启动服务时只需要通过执行 `npm run dev` 去实现。
> 再来看下 npm run dev
 `webpack-dev-server` 其实是一个`node.js`的应用程序，它是通过`JavaScript`开发的。在命令行执行`npm run dev`命令等同于执行`node ./node_modules/webpack-dev-server/bin/webpack-dev-server.js --inline --progress --config build/webpack.dev.conf.js`。你可以试试。

更多`package.json`的配置项，可以查看[阮一峰老师的文章 package.json文件](http://javascript.ruanyifeng.com/nodejs/packagejson.html)

`npm run dev`指定了`build/webpack.dev.conf.js`配置去启动服务，那么我们来看下这个文件做了什么。

## `build/webpack.dev.conf.js` `webpack`开发环境配置

这个文件主要做了以下几件事情：<br>
1、引入各种依赖，同时也引入了`config`文件夹下的变量和配置，和一个工具函数`build/utils.js`，<br>
2、合并`build/webpack.base.conf.js`配置文件，<br>
3、配置开发环境一些`devServer`，`plugin`等配置，<br>
4、最后导出了一个`Promise`，根据配置的端口，寻找可用的端口来启动服务。

具体可以看`build/webpack.dev.conf.js`这个文件注释：

```js
'use strict'
// 引入工具函数
const utils = require('./utils')
// 引入webpack
const webpack = require('webpack')
// 引入config/index.js配置
const config = require('../config')
// 合并webpack配置
const merge = require('webpack-merge')
const path = require('path')
// 基本配置
const baseWebpackConfig = require('./webpack.base.conf')
// 拷贝插件
const CopyWebpackPlugin = require('copy-webpack-plugin')
// 生成html的插件
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 友好提示的插件 https://github.com/geowarin/friendly-errors-webpack-plugin
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
// 查找可用端口 // github仓库 https://github.com/indexzero/node-portfinder
const portfinder = require('portfinder')


// process模块用来与当前进程互动，可以通过全局变量process访问，不必使用require命令加载。它是一个EventEmitter对象的实例。

// 后面有些process模块用到的，所以这里统一列举下。
// 更多查看这篇阮一峰的这篇文章 http://javascript.ruanyifeng.com/nodejs/process.html

// process对象提供一系列属性，用于返回系统信息。
// process.pid：当前进程的进程号。
// process.version：Node的版本，比如v0.10.18。
// process.platform：当前系统平台，比如Linux。
// process.title：默认值为“node”，可以自定义该值。
// process.argv：当前进程的命令行参数数组。
// process.env：指向当前shell的环境变量，比如process.env.HOME。
// process.execPath：运行当前进程的可执行文件的绝对路径。
// process.stdout：指向标准输出。
// process.stdin：指向标准输入。
// process.stderr：指向标准错误。

// process对象提供以下方法：
// process.exit()：退出当前进程。
// process.cwd()：返回运行当前脚本的工作目录的路径。_
// process.chdir()：改变工作目录。
// process.nextTick()：将一个回调函数放在下次事件循环的顶部。

// host
const HOST = process.env.HOST
// 端口
const PORT = process.env.PORT && Number(process.env.PORT)

// 合并基本的webpack配置
const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    // cssSourceMap这里配置的是true
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  // 在开发环境是cheap-module-eval-source-map选项更快
  // 这里配置的是cheap-module-eval-source-map
  // 更多可以查看中文文档：https://webpack.docschina.org/configuration/devtool/#devtool
  // 英文 https://webpack.js.org/configuration/devtool/#development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    // 配置在客户端的日志等级，这会影响到你在浏览器开发者工具控制台里看到的日志内容。
    // clientLogLevel 是枚举类型，可取如下之一的值 none | error | warning | info。
    // 默认为 info 级别，即输出所有类型的日志，设置成 none 可以不输出任何日志。
    clientLogLevel: 'warning',
    // historyApiFallback boolean object 用于方便的开发使用了 HTML5 History API 的单页应用。
    // 可以简单true 或者 任意的 404 响应可以提供为 index.html 页面。
    historyApiFallback: {
      rewrites: [
        // config.dev.assetsPublicPath 这里是 /
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    // 开启热更新
    hot: true,
    // contentBase 配置 DevServer HTTP 服务器的文件根目录。
    // 默认情况下为当前执行目录，通常是项目根目录，所有一般情况下你不必设置它，除非你有额外的文件需要被 DevServer 服务。
    contentBase: false, // since we use CopyWebpackPlugin.
    // compress 配置是否启用 gzip 压缩。boolean 为类型，默认为 false。
    compress: true,
    // host
    // 例如你想要局域网中的其它设备访问你本地的服务，可以在启动 DevServer 时带上 --host 0.0.0.0
    // 或者直接设置为 0.0.0.0
    // 这里配置的是localhost
    host: HOST || config.dev.host,
    // 端口号 这里配置的是8080
    port: PORT || config.dev.port,
    // 打开浏览器，这里配置是不打开false
    open: config.dev.autoOpenBrowser,
    // 是否在浏览器以遮罩形式显示报错信息 这里配置的是true
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
      // 这里配置的是 /
    publicPath: config.dev.assetsPublicPath,
    // 代理 这里配置的是空{},有需要可以自行配置
    proxy: config.dev.proxyTable,
    // 启用 quiet 后，除了初始启动信息之外的任何内容都不会被打印到控制台。这也意味着来自 webpack 的错误或警告在控制台不可见。
    // 开启后一般非常干净只有类似的提示 Your application is running here: http://localhost:8080
    quiet: true, // necessary for FriendlyErrorsPlugin
    // webpack-dev-middleware
    // watch: false,
    // 启用 Watch 模式。这意味着在初始构建之后，webpack 将继续监听任何已解析文件的更改。Watch 模式默认关闭。
    // webpack-dev-server 和 webpack-dev-middleware 里 Watch 模式默认开启。
    // Watch 模式的选项
    watchOptions: {
      // 或者指定毫秒为单位进行轮询。
      // 这里配置为false
      poll: config.dev.poll,
    }
    // 更多查看中文文档：https://webpack.docschina.org/configuration/watch/#src/components/Sidebar/Sidebar.jsx
  },
  plugins: [
    // 定义为开发环境
    new webpack.DefinePlugin({
      // 这里是 { NODE_ENV: '"development"' }
      'process.env': require('../config/dev.env')
    }),
    // 热更新插件
    new webpack.HotModuleReplacementPlugin(),
    // 热更新时显示具体的模块路径
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    // 在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。
    new webpack.NoEmitOnErrorsPlugin(),
    // github仓库 https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      // inject 默认值 true，script标签位于html文件的 body 底部
      // body 通true, header, script 标签位于 head 标签内
      // false 不插入生成的 js 文件，只是单纯的生成一个 html 文件
      inject: true
    }),
    // copy custom static assets
    // 把static资源复制到相应目录。
    new CopyWebpackPlugin([
      {
        // 这里是 static
        from: path.resolve(__dirname, '../static'),
        // 这里是 static
        to: config.dev.assetsSubDirectory,
        // 忽略.开头的文件。比如这里的.gitkeep，这个文件是指空文件夹也提交到git
        ignore: ['.*']
      }
    ])
  ]
})
// 导出一个promise
module.exports = new Promise((resolve, reject) => {
  // process.env.PORT 可以在命令行指定端口号，比如PORT=2000 npm run dev，那访问就是http://localhost:2000
  // config.dev.port 这里配置是 8080
  portfinder.basePort = process.env.PORT || config.dev.port
  // 以配置的端口为基准，寻找可用的端口，比如：如果8080占用，那就8081,以此类推
  // github仓库 https://github.com/indexzero/node-portfinder
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        // notifyOnErrors 这里配置是 true
        // onErrors 是一个函数，出错输出错误信息，系统原生的通知
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
```

## `build/utils.js` 工具函数

上文`build/webpack.dev.conf.js`提到引入了`build/utils.js`工具函数。<br>
该文件主要写了以下几个工具函数：<br>
1、`assetsPath`返回输出路径，<br>
2、`cssLoaders`返回相应的`css-loader`配置，<br>
3、`styleLoaders`返回相应的处理样式的配置，<br>
4、`createNotifierCallback`创建启动服务时出错时提示信息回调。

具体配置可以看该文件注释：

```js
'use strict'
const path = require('path')
// 引入配置文件config/index.js
const config = require('../config')
// 提取css的插件
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// 引入package.json配置
const packageConfig = require('../package.json')
// 返回路径
exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    // 二级目录 这里是 static
    ? config.build.assetsSubDirectory
    // 二级目录 这里是 static
    : config.dev.assetsSubDirectory

  // 生成跨平台兼容的路径
  // 更多查看Node API链接：https://nodejs.org/api/path.html#path_path_posix
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  // 作为参数传递进来的options对象
  // {
  //   // sourceMap这里是true
  //   sourceMap: true,
  //   // 是否提取css到单独的css文件
  //   extract: true,
  //   // 是否使用postcss
  //   usePostCSS: true
  // }
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  // 创建对应的loader配置
  function generateLoaders (loader, loaderOptions) {
    // 是否使用usePostCSS，来决定是否采用postcssLoader
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        // 合并 loaderOptions 生成options
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      // 如果提取使用ExtractTextPlugin插件提取
      // 更多配置 看插件中文文档：https://webpack.docschina.org/plugins/extract-text-webpack-plugin/
      return ExtractTextPlugin.extract({
        // 指需要什么样的loader去编译文件
        // loader 被用于将资源转换成一个 CSS 导出模块 (必填)
        use: loaders,
        // loader（例如 'style-loader'）应用于当 CSS 没有被提取(也就是一个额外的 chunk，当 allChunks: false)
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    // sass indentedSyntax 语法缩进，类似下方格式
    // #main
    //   color: blue
    //   font-size: 0.3em
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
// 最终会返回webpack css相关的配置
exports.styleLoaders = function (options) {
  // {
  //   // sourceMap这里是true
  //   sourceMap: true,
  //   // 是否提取css到单独的css文件
  //   extract: true,
  //   // 是否使用postcss
  //   usePostCSS: true
  // }
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

// npm run dev 出错时， FriendlyErrorsPlugin插件 配置 onErrors输出错误信息
exports.createNotifierCallback = () => {
  // 'node-notifier'是一个跨平台系统通知的页面，当遇到错误时，它能用系统原生的推送方式给你推送信息
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

```

## `build/webpack.base.conf.js` `webpack`基本配置文件

上文`build/webpack.dev.conf.js`提到引入了`build/webpack.base.conf.js`这个`webpack`基本配置文件。<br>
这个文件主要做了以下几件事情：<br>
1、引入各种插件、配置等，其中引入了`build/vue-loader.conf.js`相关配置，<br>
2、创建`eslint`规则配置，默认启用，<br>
3、导出`webpack`配置对象，其中包含`context`，入口`entry`，输出`output`，`resolve`，`module`下的`rules`（处理对应文件的规则），和`node`相关的配置等。

具体可以看这个文件注释：

```js
// 使用严格模式，更多严格模式可以查看
// [阮一峰老师的es标准入门](http://es6.ruanyifeng.com/?search=%E4%B8%A5%E6%A0%BC%E6%A8%A1%E5%BC%8F&x=0&y=0#docs/function#%E4%B8%A5%E6%A0%BC%E6%A8%A1%E5%BC%8F)
'use strict'
const path = require('path')
// 引入工具函数
const utils = require('./utils')
// 引入配置文件，也就是config/index.js文件
const config = require('../config')
// 引入vue-loader的配置文件
const vueLoaderConfig = require('./vue-loader.conf')
// 定义获取绝对路径函数
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
// 创建eslint配置
const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  // 执行顺序，前置，还有一个选项是post是后置
  // 把 eslint-loader 的执行顺序放到最前面，防止其它 Loader 把处理后的代码交给 eslint-loader 去检查
  enforce: 'pre',
  // 包含文件夹
  include: [resolve('src'), resolve('test')],
  options: {
    // 使用友好的eslint提示插件
    formatter: require('eslint-friendly-formatter'),
    // eslint报错提示是否显示以遮罩形式显示在浏览器中
    // 这里showEslintErrorsInOverlay配置是false
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

module.exports = {
  // 运行环境的上下文，就是实际的目录，也就是项目根目录
  context: path.resolve(__dirname, '../'),
  // 入口
  entry: {
    app: './src/main.js'
  },
  // 输出
  output: {
    // 路径 这里是根目录下的dist
    path: config.build.assetsRoot,
    // 文件名
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      // 这里是 /，但要上传到github pages等会路径不对，需要修改为./
      ? config.build.assetsPublicPath
      // 这里配置是 /
      : config.dev.assetsPublicPath
  },
  // Webpack 在启动后会从配置的入口模块出发找出所有依赖的模块，Resolve 配置 Webpack 如何寻找模块所对应的文件。
  resolve: {
    // 配置了这个，对应的扩展名可以省略
    extensions: ['.js', '.vue', '.json'],
    alias: {
      // 给定对象的键后的末尾添加 $，以表示精准匹配 node_modules/vue/dist/vue.esm.js
      // 引用 import Vue from 'vue'就是引入的这个文件最后export default Vue 导出的Vue;
      // 所以这句可以以任意大写字母命名 比如：import V from 'vue'
      'vue$': 'vue/dist/vue.esm.js',
      // src别名 比如 ：引入import HelloWorld from '@/components/HelloWorld'
      '@': resolve('src'),
    }
  },
  // 定义一些文件的转换规则
  module: {
    rules: [
      // 是否使用eslint 这里配置是true
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.vue$/,
        // vue-loader中文文档：https://vue-loader-v14.vuejs.org/zh-cn/
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        // js文件使用babel-loader转换
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        // 图片文件使用url-loader转换
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          // 限制大小10000B(bytes)以内，转成base64编码的dataURL字符串
          limit: 10000,
          // 输出路径 img/名称.7位hash.扩展名
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        // 视频文件使用url-loader转换
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  // 这里的node是一个对象，其中每个属性都是 Node.js 全局变量或模块的名称，每个 value 是以下其中之一
  // empty 提供空对象。
  // false 什么都不提供。
  // 更多查看 中文文档：https://webpack.docschina.org/configuration/node/
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    // 防止webpack注入一些polyfill 因为Vue已经包含了这些。
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
```

## `build/vue-loader.conf.js` `vue-loader`配置文件

上文`build/webpack.dev.conf.js`提到引入了`build/vue-loader.conf.js`。

这个文件主要导出了一份`Vue-loader`的配置，
主要有：`loaders`，`cssSourceMap`，`cacheBusting`，`transformToRequire`。

具体看该文件注释：
```js
'use strict'
const utils = require('./utils')
const config = require('../config')
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction
  // 这里是true
  ? config.build.productionSourceMap
  // 这里是true
  : config.dev.cssSourceMap
// 更多配置 可以查看vue-loader中文文档：https://vue-loader-v14.vuejs.org/zh-cn/
module.exports = {
  // cssLoaders 生成相应loader配置，具体看utils文件中的cssLoader
  loaders: utils.cssLoaders({
    // 是否开启sourceMap，便于调试
    sourceMap: sourceMapEnabled,
    // 是否提取vue单文件的css
    extract: isProduction
  }),
  // 是否开启cssSourceMap，便于调试
  cssSourceMap: sourceMapEnabled,
  // 这里是true
  // 缓存破坏，进行sourceMap debug时，设置成false很有帮助。
  cacheBusting: config.dev.cacheBusting,
  // vue单文件中，在模板中的图片等资源引用转成require的形式。以便目标资源可以由 webpack 处理。
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    // 默认配置会转换 <img> 标签上的 src 属性和 SVG 的 <image> 标签上的 xlink：href 属性。
    image: 'xlink:href'
  }
}

```

看完了这些文件相应配置，开发环境的相关配置就串起来了。其中`config/`文件夹下的配置，笔者都已经注释在`build/`文件夹下的对应的文件中，所以就不单独说明了。

那回过头来看，`package.json`的`scripts`中的`npm run build`配置，`node build/build.js`，其实就是用`node`去执行`build/build.js`文件。

## `build/build.js` `npm run build` 指定执行的文件

这个文件主要做了以下几件事情：<br>
1、引入`build/check-versions`文件，检查`node`和`npm`的版本，<br>
2、引入相关插件和配置，其中引入了`webpack`生产环境的配置`build/webpack.prod.conf.js`，<br>
3、先控制台输出`loading`，删除`dist`目录下的文件，开始构建，构建失败和构建成功都给出相应的提示信息。

具体可以查看相应的注释：

```js
'use strict'
// 检查node npm的版本
require('./check-versions')()

process.env.NODE_ENV = 'production'
// 命令行中的loading
const ora = require('ora')
// 删除文件或文件夹
const rm = require('rimraf')
// 路径相关
const path = require('path')
// 控制台输入样式 chalk 更多查看：https://github.com/chalk/chalk
const chalk = require('chalk')
// 引入webpack
const webpack = require('webpack')
// 引入config/index.js
const config = require('../config')
// 引入 生产环境webpack配置
const webpackConfig = require('./webpack.prod.conf')

// 控制台输入开始构建loading
const spinner = ora('building for production...')
spinner.start()

// 删除原有构建输出的目录文件 这里是dist 和 static
rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  // 如果出错，抛出错误
  if (err) throw err
  webpack(webpackConfig, (err, stats) => {
    // 关闭 控制台输入开始构建loading
    spinner.stop()
    // 如果出错，抛出错误
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    // 如果有错，控制台输出构建失败
    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    // 控制台输出构建成功相关信息
    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})

```

## `build/check-versions` 检查`node`和`npm`版本

上文提到`build/check-versions` 检查`node`和`npm`版本，这个文件主要引入了一些插件和配置，最后导出一个函数，版本不符合预期就输出警告。

具体查看这个配置文件注释：

```js
'use strict'
// 控制台输入样式 chalk 更多查看：https://github.com/chalk/chalk
const chalk = require('chalk')
// 语义化控制版本的插件 更多查看：https://github.com/npm/node-semver
const semver = require('semver')
// package.json配置
const packageConfig = require('../package.json')
// shell 脚本 Unix shell commands for Node.js 更多查看：https://github.com/shelljs/shelljs
const shell = require('shelljs')

function exec (cmd) {
  return require('child_process').execSync(cmd).toString().trim()
}

const versionRequirements = [
  {
    name: 'node',
    currentVersion: semver.clean(process.version),
    // 这里配置是"node": ">= 6.0.0",
    versionRequirement: packageConfig.engines.node
  }
]
// 需要使用npm
if (shell.which('npm')) {
  versionRequirements.push({
    name: 'npm',
    currentVersion: exec('npm --version'),
    // 这里配置是"npm": ">= 3.0.0"
    versionRequirement: packageConfig.engines.npm
  })
}
// 导出一个检查版本的函数
module.exports = function () {
  const warnings = []

  for (let i = 0; i < versionRequirements.length; i++) {
    const mod = versionRequirements[i]

    // 当前版本不大于所需版本
    if (!semver.satisfies(mod.currentVersion, mod.versionRequirement)) {
      warnings.push(mod.name + ': ' +
        chalk.red(mod.currentVersion) + ' should be ' +
        chalk.green(mod.versionRequirement)
      )
    }
  }

  // 如果有警告，全部输出到控制台
  if (warnings.length) {
    console.log('')
    console.log(chalk.yellow('To use this template, you must update following to modules:'))
    console.log()

    for (let i = 0; i < warnings.length; i++) {
      const warning = warnings[i]
      console.log('  ' + warning)
    }

    console.log()
    process.exit(1)
  }
}

```

## `build/webpack.prod.conf.js` `webpack`生产环境配置

上文`build/build.js`提到，引入了这个配置文件。<br>
这个文件主要做了以下几件事情：<br>
1、引入一些插件和配置，其中引入了`build/webpack.base.conf.js` `webpack`基本配置文件，<br>
2、用`DefinePlugin`定义环境，<br>
3、合并基本配置，定义自己的配置`webpackConfig`，配置了一些`modules`下的`rules`，`devtools`配置，`output`输出配置，一些处理`js`、提取`css`、压缩`css`、输出`html`插件、提取公共代码等的
`plugins`，<br>
4、如果启用`gzip`，再使用相应的插件处理，<br>
5、如果启用了分析打包后的插件，则用`webpack-bundle-analyzer`，<br>
6、最后导出这份配置。

具体可以查看这个文件配置注释：

```js
'use strict'
// 引入node路径相关
const path = require('path')
// 引入utils工具函数
const utils = require('./utils')
// 引入webpack
const webpack = require('webpack')
// 引入config/index.js配置文件
const config = require('../config')
// 合并webpack配置的插件
const merge = require('webpack-merge')
// 基本的webpack配置
const baseWebpackConfig = require('./webpack.base.conf')
// 拷贝文件和文件夹的插件
const CopyWebpackPlugin = require('copy-webpack-plugin')
// 压缩处理HTML的插件
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// 压缩处理css的插件
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
// 压缩处理js的插件
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

// 用DefinePlugin定义环境
const env = process.env.NODE_ENV === 'testing'
  // 这里是 { NODE_ENV: '"testing"' }
  ? require('../config/test.env')
  // 这里是 { NODE_ENV: '"production"' }
  : require('../config/prod.env')
// 合并基本webpack配置
const webpackConfig = merge(baseWebpackConfig, {
  module: {
    // 通过styleLoaders函数生成样式的一些规则
    rules: utils.styleLoaders({
      // sourceMap这里是true
      sourceMap: config.build.productionSourceMap,
      // 是否提取css到单独的css文件
      extract: true,
      // 是否使用postcss
      usePostCSS: true
    })
  },
  // 配置使用sourceMap true 这里是 #source-map
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    // 这里是根目录下的dist
    path: config.build.assetsRoot,
    // 文件名称 chunkhash
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    // chunks名称 chunkhash
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    // 定义具体是什么环境
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // 压缩js插件
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          // 警告
          warnings: false
          // 构建后的文件 常用的配置还有这些
          // 去除console.log 默认为false。  传入true会丢弃对console函数的调用。
          // drop_console: true,
          // 去除debugger
          // drop_debugger: true,
          // 默认为null. 你可以传入一个名称的数组，而UglifyJs将会假定那些函数不会产生副作用。
          // pure_funcs: [ 'console.log', 'console.log.apply' ],
        }
      },
      // 是否开启sourceMap 这里是true
      sourceMap: config.build.productionSourceMap,
      // 平行处理（同时处理）加快速度
      parallel: true
    }),
    // extract css into its own file
    // 提取css到单独的css文件
    new ExtractTextPlugin({
      // 提取到相应的文件名 使用内容hash contenthash
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      // allChunks 默认是false,true指提取所有chunks包括动态引入的组件。
      allChunks: true,
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      // 这里配置是true
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      // 输出html名称
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        // 这里是 根目录下的dist/index.html
        : config.build.index,
      // 使用哪个模板
      template: 'index.html',
      // inject 默认值 true，script标签位于html文件的 body 底部
      // body 通true, header, script 标签位于 head 标签内
      // false 不插入生成的 js 文件，只是单纯的生成一个 html 文件
      inject: true,
      // 压缩
      minify: {
        // 删除注释
        removeComments: true,
        // 删除空格和换行
        collapseWhitespace: true,
        // 删除html标签中属性的双引号
        removeAttributeQuotes: true
        // 更多配置查看html-minifier插件
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      // 在chunk被插入到html之前，你可以控制它们的排序。允许的值 ‘none’ | ‘auto’ | ‘dependency’ | {function} 默认为‘auto’.
      // dependency 依赖（从属）
      chunksSortMode: 'dependency'
    }),
    // keep module.id stable when vendor modules does not change
    // 根据代码内容生成普通模块的id，确保源码不变，moduleID不变。
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    // 开启作用域提升 webpack3新的特性，作用是让代码文件更小、运行的更快
    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file
    // 提取公共代码
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks (module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    // 提取公共代码
    new webpack.optimize.CommonsChunkPlugin({
      // 把公共的部分放到 manifest 中
      name: 'manifest',
      // 传入 `Infinity` 会马上生成 公共chunk，但里面没有模块。
      minChunks: Infinity
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    // 提取动态组件
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      // 如果设置为 `true`，一个异步的  公共chunk 会作为 `options.name` 的子模块，和 `options.chunks` 的兄弟模块被创建。
      // 它会与 `options.chunks` 并行被加载。可以通过提供想要的字符串，而不是 `true` 来对输出的文件进行更换名称。
      async: 'vendor-async',
      // 如果设置为 `true`，所有  公共chunk 的子模块都会被选择
      children: true,
      // 最小3个，包含3，chunk的时候提取
      minChunks: 3
    }),

    // copy custom static assets
    // 把static资源复制到相应目录。
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        // 这里配置是static
        to: config.build.assetsSubDirectory,
        // 忽略.开头的文件。比如这里的.gitkeep，这个文件是指空文件夹也提交到git
        ignore: ['.*']
      }
    ])
  ]
})
// 如果开始gzip压缩，使用compression-webpack-plugin插件处理。这里配置是false
// 需要使用是需要安装 npm i compression-webpack-plugin -D
if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      // asset： 目标资源名称。 [file] 会被替换成原始资源。
      // [path] 会被替换成原始资源的路径， [query] 会被替换成查询字符串。默认值是 "[path].gz[query]"。
      asset: '[path].gz[query]',
      // algorithm： 可以是 function(buf, callback) 或者字符串。对于字符串来说依照 zlib 的算法(或者 zopfli 的算法)。默认值是 "gzip"。
      algorithm: 'gzip',
      // test： 所有匹配该正则的资源都会被处理。默认值是全部资源。
      // config.build.productionGzipExtensions 这里是['js', 'css']
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      // threshold： 只有大小大于该值的资源会被处理。单位是 bytes。默认值是 0。
      threshold: 10240,
      // minRatio： 只有压缩率小于这个值的资源才会被处理。默认值是 0.8。
      minRatio: 0.8
    })
  )
}

// 输出分析的插件 运行npm run build --report
// config.build.bundleAnalyzerReport这里是 process.env.npm_config_report
// build结束后会自定打开 http://127.0.0.1:8888 链接
if (config.build.bundleAnalyzerReport) {
  // 更多查看链接地址：https://www.npmjs.com/package/webpack-bundle-analyzer
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}
// 当然也可以用官方提供的网站 http://webpack.github.io/analyse/#home
// 运行类似 webpack --profile --json > stats.json 命令
// 把生成的构建信息stats.json上传即可


// 最终导出 webpackConfig
module.exports = webpackConfig

```
至此，我们就分析完了`package.json`中的`npm run dev`和`npm run build`两个命令。测试相关的类似就略过吧。

`npm run lint`，`.eslintrc.js`中的配置不多，更多可以查看[eslint英文文档](https://eslint.org/)或[`eslint`中文官网](http://eslint.cn/)，所以也略过吧。不过提一下，把`eslint`整合到`git`工作流。可以安装`husky`，`npm i husky -S`。安装后，配置`package.json`的`scripts`中，配置`precommit`，具体如下：
```js
"scripts": {
  "lint": "eslint --ext .js,.vue src test/unit test/e2e/specs",
  "precommit": "npm run lint",
},
```
配置好后，每次`git commit -m`提交会检查代码是否通过`eslint`校验，如果没有校验通过则提交失败。还可以配置`prepush`。`husky`不断在更新，现在可能与原先的配置不太相同了，具体查看[husky github仓库](https://github.com/typicode/husky)。原理就是`git-hooks`,`pre-commit`的钩子。对`shell`脚本熟悉的同学也可以自己写一份`pre-commit`。复制到项目的`.git/hooks/pre-commit`中。不需要依赖`husky`包。我司就是用的`shell`脚本。


最后提一下`.babelrc`文件中的配置。

## `.babelrc` `babel`相关配置

配置了一些转码规则。这里附上两个链接：[`babel`英文官网](https://babeljs.io/)和[`babel`的中文官网](https://babel.bootcss.com/)。

具体看文件中的配置注释：
```js
{
  // presets指明转码的规则
  "presets": [
    // env项是借助插件babel-preset-env，下面这个配置说的是babel对es6,es7,es8进行转码，并且设置amd,commonjs这样的模块化文件，不进行转码
    ["env", {
      "modules": false,
      "targets": {
        "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
      }
    }],
    "stage-2"
  ],
  // plugins 属性告诉 Babel 要使用哪些插件，插件可以控制如何转换代码。
  // transform-vue-jsx 表明可以在项目中使用jsx语法，会使用这个插件转换
  "plugins": ["transform-vue-jsx", "transform-runtime"],
  // 在特定的环境中所执行的转码规则，当环境变量是下面的test就会覆盖上面的设置
  "env": {
    // test 是提前设置的环境变量，如果没有设置BABEL_ENV则使用NODE_ENV，如果都没有设置默认就是development
    "test": {
      "presets": ["env", "stage-2"],
      "plugins": ["transform-vue-jsx", "transform-es2015-modules-commonjs", "dynamic-import-node"]
    }
  }
}
```

文件中`presets`中有配置`env`和`stage-2`，可能不知道是什么。这里引用[深入浅出webpack](http://webpack.wuhaolin.cn/3%E5%AE%9E%E6%88%98/3-1%E4%BD%BF%E7%94%A8ES6%E8%AF%AD%E8%A8%80.html)书中，第三章，`3-1`使用`ES6`语言 小节的一段，解释一下。<br>
>`presets` 属性告诉 `Babel` 要转换的源码使用了哪些新的语法特性，一个 Presets 对一组新语法特性提供支持，多个 `Presets` 可以叠加。 `Presets` 其实是一组 `Plugins` 的集合，每一个 `Plugin` 完成一个新语法的转换工作。`Presets` 是按照 `ECMAScript` 草案来组织的，通常可以分为以下三大类（书中就是说三大类，我发现就两点~~~）：<br>
>1、已经被写入 ECMAScript 标准里的特性，由于之前每年都有新特性被加入到标准里，所以又可细分为：<br>
es2015 包含在2015里加入的新特性；<br>
es2016 包含在2016里加入的新特性；<br>
es2017 包含在2017里加入的新特性；<br>
es2017 包含在2017里加入的新特性；<br>
env 包含当前所有 ECMAScript 标准里的最新特性。<br>
>2、被社区提出来的但还未被写入 `ECMAScript` 标准里特性，这其中又分为以下四种：<br>
`stage0` 只是一个美好激进的想法，有 `Babel` 插件实现了对这些特性的支持，但是不确定是否会被定为标准；<br>
`stage1` 值得被纳入标准的特性；<br>
`stage2` 该特性规范已经被起草，将会被纳入标准里；<br>
`stage3` 该特性规范已经定稿，各大浏览器厂商和 `` 社区开始着手实现；<br>
`stage4` 在接下来的一年将会加入到标准里去。<br>

至此，就算相对完整的分析完了`Vue-cli`(版本`v2.9.3`)搭建的`webpack`项目工程。希望对大家有所帮助。<br>
**项目放在笔者的`github`上，[分析vue-cli@2.9.3 搭建的webpack项目工程](https://github.com/lxchuan12/analyse-vue-cli)。方便大家克隆下载，或者在线查看。同时也求个`star` `^_^`，也是对笔者的一种鼓励和支持。**<br>
笔者知识能力有限，文章有什么不妥之处，欢迎指出~

## 小结

1、分析这些，逐行注释，还是需要一些时间的。其中有些不是很明白的地方，及时查阅相应的官方文档和插件文档（建议看英文文档和最新的文档），不过文档没写明白的地方，可以多搜索一些别人的博客文章，相对比较清晰明了。<br>
2、前端发展太快，这个`Vue-cli@2.9.3` `webpack`版本还是`v3.x`，webpack现在官方版本已经是`v4.12.0`，相信不久后，`Vue-cli`也将发布支持`webpack v4.x`的版本，`v3.0.0`已经是`beta.16`了。<br>
3、后续有余力，可能会继续分析新版的`vue-cli`构建的`webpack`项目工程。

## 关于

作者：常以**若川**为名混迹于江湖。前端路上 | PPT爱好者 | 所知甚少，唯善学。<br>
[个人博客](https://lxchuan12.github.io/)<br>
[掘金专栏](https://juejin.im/user/57974dc55bbb500063f522fd/posts)，欢迎关注~<br>
[`segmentfault`前端视野专栏](https://segmentfault.com/blog/lxchuan12)，开通了**前端视野**专栏，欢迎关注~<br>
[知乎前端视野专栏](https://zhuanlan.zhihu.com/lxchuan12)，开通了**前端视野**专栏，欢迎关注~<br>
[github blog](https://github.com/lxchuan12/blog)，相关源码和资源都放在这里，求个`star`^_^~

## 微信公众号  若川视野

可能比较有趣的微信公众号，长按扫码关注。也可以加微信 `ruochuan12`，注明来源，拉您进【前端视野交流群】。

![若川视野](../about/wechat-official-accounts-mini.png)
