# vite 源码系列

## 1. 前言

大家好，我是[若川](https://ruochuan12.github.io)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

在 `package.json` 文件中，Vite 的入口文件相关信息主要由 `bin`、`main`、`exports` 字段定义。下面详细分析这些字段：

### 1. `bin` 字段

`bin` 字段定义了可执行脚本，用于在命令行中调用 Vite。

```json

// vite/packages/vite/package.json

"bin": {
  "vite": "bin/vite.js"
}
```
这里表明，当你在命令行中输入 `vite` 命令时，实际上执行的是 `bin/vite.js` 文件。

### 2. `main` 字段

`main` 字段指定了 Node.js 环境下默认的入口文件。
```json:vite/packages/vite/package.json
"main": "./dist/node/index.js"
```

这意味着，当你在 Node.js 项目中使用 `require('vite')` 时，会加载 `./dist/node/index.js` 文件。

### 3. `exports` 字段
`exports` 字段提供了更细致的模块解析规则，支持不同的导入方式（如 `import`、`require`）。
```json:vite/packages/vite/package.json
"exports": {
  ".": {
    "module-sync": "./dist/node/index.js",
    "import": "./dist/node/index.js",
    "require": "./index.cjs"
  },
  "./client": {
    "types": "./client.d.ts"
  },
  // 其他路径...
}
```
- `.` 表示包的主入口：
  - `module-sync` 和 `import` 都指向 `./dist/node/index.js`，适用于 ESM 导入。
  - `require` 指向 `./index.cjs`，适用于 CommonJS 导入。
- `./client` 指向 `./client.d.ts`，用于提供类型定义。

### 总结
- **命令行入口**：`bin/vite.js` 是 Vite 命令行工具的入口文件。
- **Node.js 入口**：
  - ESM 导入时，使用 `./dist/node/index.js`。
  - CommonJS 导入时，使用 `./index.cjs`。

这些入口文件共同构成了 Vite 在不同环境下的启动和使用方式。


`packages/vite/bin/vite.js` 文件是 Vite 命令行工具的入口文件，其主要功能是初始化环境、处理命令行参数，并启动 Vite CLI。以下是对该文件的详细分析：

### 1. 引入模块
```javascript:vite/packages/vite/bin/vite.js
import { performance } from 'node:perf_hooks'
import module from 'node:module'
```
- `node:perf_hooks`：用于性能测量，`performance.now()` 可以获取当前时间戳。
- `node:module`：Node.js 的模块系统，用于启用和刷新编译缓存。

### 2. 开发环境调试支持

```ts
// vite/packages/vite/bin/vite.js
if (!import.meta.url.includes('node_modules')) {
  try {
    // only available as dev dependency
    await import('source-map-support').then((r) => r.default.install())
  } catch {}

  process.on('unhandledRejection', (err) => {
    throw new Error('UNHANDLED PROMISE REJECTION', { cause: err })
  })
}
```
- `source-map-support`：仅在开发环境中使用，用于支持源映射，方便调试。
- `process.on('unhandledRejection')`：捕获未处理的 Promise 拒绝，抛出错误。

### 3. 记录启动时间
```javascript:vite/packages/vite/bin/vite.js
global.__vite_start_time = performance.now()
```
记录 Vite 启动的时间戳，用于后续性能分析。

### 4. 处理调试模式和过滤器
```javascript:vite/packages/vite/bin/vite.js
const debugIndex = process.argv.findIndex((arg) => /^(?:-d|--debug)$/.test(arg))
const filterIndex = process.argv.findIndex((arg) =>
  /^(?:-f|--filter)$/.test(arg),
)
const profileIndex = process.argv.indexOf('--profile')

if (debugIndex > 0) {
  let value = process.argv[debugIndex + 1]
  if (!value || value.startsWith('-')) {
    value = 'vite:*'
  } else {
    // support debugging multiple flags with comma-separated list
    value = value
      .split(',')
      .map((v) => `vite:${v}`)
      .join(',')
  }
  process.env.DEBUG = `${
    process.env.DEBUG ? process.env.DEBUG + ',' : ''
  }${value}`

  if (filterIndex > 0) {
    const filter = process.argv[filterIndex + 1]
    if (filter && !filter.startsWith('-')) {
      process.env.VITE_DEBUG_FILTER = filter
    }
  }
}
```
- `process.argv`：获取命令行参数。
- `debugIndex`：查找 `--debug` 或 `-d` 参数的索引。
- `filterIndex`：查找 `--filter` 或 `-f` 参数的索引。
- `profileIndex`：查找 `--profile` 参数的索引。
- 如果启用了调试模式，设置 `process.env.DEBUG` 环境变量，并处理过滤器。

### 5. 启动函数

```js
// vite/packages/vite/bin/vite.js

function start() {
  try {
    // eslint-disable-next-line n/no-unsupported-features/node-builtins -- it is supported in Node 22.8.0+ and only called if it exists
    module.enableCompileCache?.()
    // flush the cache after 10s because the cache is not flushed until process end
    // for dev server, the cache is never flushed unless manually flushed because the process.exit is called
    // also flushing the cache in SIGINT handler seems to cause the process to hang
    setTimeout(() => {
      try {
        // eslint-disable-next-line n/no-unsupported-features/node-builtins -- it is supported in Node 22.12.0+ and only called if it exists
        module.flushCompileCache?.()
      } catch {}
    }, 10 * 1000).unref()
  } catch {}
  return import('../dist/node/cli.js')
}
```

- `module.enableCompileCache()`：启用 Node.js 的编译缓存，提高性能。
- `module.flushCompileCache()`：在 10 秒后刷新编译缓存。
- `import('../dist/node/cli.js')`：导入 Vite CLI 模块。

### 6. 处理性能分析模式

```javascript

// vite/packages/vite/bin/vite.js

if (profileIndex > 0) {
  process.argv.splice(profileIndex, 1)
  const next = process.argv[profileIndex]
  if (next && !next.startsWith('-')) {
    process.argv.splice(profileIndex, 1)
  }
  const inspector = await import('node:inspector').then((r) => r.default)
  const session = (global.__vite_profile_session = new inspector.Session())
  session.connect()
  session.post('Profiler.enable', () => {
    session.post('Profiler.start', start)
  })
} else {
  start()
}
```
- 如果启用了性能分析模式（`--profile`），启动 Node.js 检查器会话，并开始性能分析。
- 否则，直接调用 `start()` 函数启动 Vite CLI。

### 总结
该文件的主要功能是初始化 Vite 命令行工具的环境，处理命令行参数，包括调试模式、过滤器和性能分析模式，并最终启动 Vite CLI。通过启用编译缓存和性能分析，提高了 Vite 的性能和可调试性。

## vite 入口

```ts
// packages/vite/bin/vite.js
function start() {
  return import('../dist/node/cli.js')
}
start()
```

## cac dev action

```ts
    filterDuplicateOptions(options)
    // output structure is preserved even after bundling so require()
    // is ok here
    const { createServer } = await import('./server')
    try {
      const server = await createServer({
        root,
        base: options.base,
        mode: options.mode,
        configFile: options.config,
        logLevel: options.logLevel,
        clearScreen: options.clearScreen,
        optimizeDeps: { force: options.force },
        server: cleanOptions(options),
      })

      if (!server.httpServer) {
        throw new Error('HTTP server not available')
      }

      await server.listen()
}
```
