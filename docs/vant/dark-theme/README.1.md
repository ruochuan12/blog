---
highlight: darcula
theme: smartblue
---


# vant-ui rc5 暗黑主题

本文为稀土掘金技术社区首发签约文章，14天内禁止转载，14天后未获授权禁止转载，侵权必究！

## 前言

我们开发业务时经常会使用到组件库，一般来说，很多时候我们不需要关心内部实现。但是如果希望学习和深究里面的原理，这时我们可以分析 组件库实现。有哪些优雅实现、最佳实践、前沿技术等都可以值得我们借鉴。

相比于原生 `JS` 等源
码。我们或许更应该学习，正在使用的组件库的源码，因为有助于帮助我们写业务和写自己的组件。

如果 `Vue` 技术栈，开发移动端的项目，大多会选用 `vant` 组件库，目前（2022-10-23） `star` 多达 `20.3k`。我们可以挑选 `vant` 组件库学习，我会写一个[组件库源码系列专栏](https://juejin.cn/column/7140264842954276871)，欢迎大家关注。

这次我们来分析 `vant4` 新增的暗黑主题是如何实现的。

可以[官方文档链接](https://vant-contrib.gitee.io/vant/v4/#/zh-CN/config-provider)，自行体验。

如图所示: 

![暗黑主题](./images/dark-theme.png)


## 准备工作

看一个开源项目，我们可以先看 [README.md](https://github.com/youzan/vant) 再看 [github/CONTRIBUTING.md](https://github.com/youzan/vant/blob/main/.github/CONTRIBUTING.md)

不知道大家有没有发现，很多开源项目都是英文的 `README.md`，即使刚开始明显是为面向中国开发者。再给定一个中文的 `README.md`。主要原因是因为英文是世界通用的语言。想要非中文用户参与进来，英文是必备。也就是说你开源的项目能提供英文版就提供。

### 克隆源码

You will need [Node.js >= 14](https://nodejs.org) and [pnpm](https://pnpm.io).

```bash
# 推荐克隆我的项目
git clone https://github.com/lxchuan12/vant-analysis
cd vant-analysis/vant

# 或者克隆官方仓库
git clone git@github.com:vant-ui/vant.git
cd vant

# Install dependencies
pnpm i

# Start development
pnpm dev
```

执行 `pnpm dev` 后，这时打开 `http://localhost:5173/#/zh-CN/config-provider`。

### package.json

```json
// vant/package.json
{
    "private": true,
    "scripts": {
        "prepare": "husky install",
        "dev": "pnpm --dir ./packages/vant dev",
  },
}
```

```json
// vant/packages/vant/package.json
{
  "name": "vant",
  "version": "4.0.0-rc.5",
  "scripts": {
    "dev": "vant-cli dev",
  },
}
```

vant-cli dev 启动了一个服务。这里我们就不深入 `vant-cli dev` 命令了。
我们接着看。

http://localhost:5173/

### pnpm dev

```js
// vant/packages/vant-cli/lib/commands/dev.js
import { setNodeEnv } from '../common/index.js';
import { compileSite } from '../compiler/compile-site.js';
export async function dev() {
    setNodeEnv('development');
    await compileSite();
}
```

## compile-site.js

```js
import color from 'picocolors';
import { createRequire } from 'module';
import { createServer, build } from 'vite';
import { getViteConfigForSiteDev, getViteConfigForSiteProd, } from '../config/vite.site.js';
import { mergeCustomViteConfig } from '../common/index.js';
import { genPackageEntry } from './gen-package-entry.js';
import { genStyleDepsMap } from './gen-style-deps-map.js';
import { PACKAGE_ENTRY_FILE } from '../common/constant.js';
export function genSiteEntry() {
    return new Promise((resolve, reject) => {
        genStyleDepsMap()
            .then(() => {
            genPackageEntry({
                outputPath: PACKAGE_ENTRY_FILE,
            });
            resolve();
        })
            .catch((err) => {
            console.log(err);
            reject(err);
        });
    });
}
export async function compileSite(production = false) {
    await genSiteEntry();
    if (production) {
        const config = mergeCustomViteConfig(getViteConfigForSiteProd());
        await build(config);
    }
    else {
        const config = mergeCustomViteConfig(getViteConfigForSiteDev());
        const server = await createServer(config);
        await server.listen();
        const require = createRequire(import.meta.url);
        const { version } = require('vite/package.json');
        const viteInfo = color.cyan(`vite v${version}`);
        console.log(`\n  ${viteInfo}` + color.green(` dev server running at:\n`));
        server.printUrls();
    }
}
```

## 实现

![]()

vue-devtools

TODO:
![]()

### PC

```js
// vant/packages/vant-cli/site/desktop/components/Header.vue

<template>
    <li v-if="darkModeClass" class="van-doc-header__top-nav-item">
    <a
        class="van-doc-header__link"
        target="_blank"
        @click="toggleTheme"
    >
        <img :src="themeImg" />
    </a>
    </li>
</template>
<script>

import { getDefaultTheme, syncThemeToChild } from '../../common/iframe-sync';

export default {
  name: 'VanDocHeader',
  data() {
    return {
      currentTheme: getDefaultTheme(),
    };
  },
    watch: {
        currentTheme: {
            handler(newVal, oldVal) {
                window.localStorage.setItem('vantTheme', newVal);
                document.documentElement.classList.remove(`van-doc-theme-${oldVal}`);
                document.documentElement.classList.add(`van-doc-theme-${newVal}`);
                debugger;
                syncThemeToChild(newVal);
            },
            immediate: true,
        },
    },

    methods: {
        toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        },
    }
}

</script>
```

```js
// vant/packages/vant-cli/site/common/iframe-sync.js

import { ref } from 'vue';
import { config } from 'site-desktop-shared';

let queue = [];
let isIframeReady = false;

function iframeReady(callback) {
  if (isIframeReady) {
    callback();
  } else {
    queue.push(callback);
  }
}

if (window.top === window) {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'iframeReady') {
      isIframeReady = true;
      queue.forEach((callback) => callback());
      queue = [];
    }
  });
} else {
  window.top.postMessage({ type: 'iframeReady' }, '*');
}

export function getDefaultTheme() {
  const cache = window.localStorage.getItem('vantTheme');

  if (cache) {
    return cache;
  }

  const useDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return useDark ? 'dark' : 'light';
}

export function syncThemeToChild(theme) {
  const iframe = document.querySelector('iframe');
  if (iframe) {
    iframeReady(() => {
      iframe.contentWindow.postMessage(
        {
          type: 'updateTheme',
          value: theme,
        },
        '*'
      );
    });
  }
}

export function useCurrentTheme() {
  const theme = ref(getDefaultTheme());

  window.addEventListener('message', (event) => {
    if (event.data?.type !== 'updateTheme') {
      return;
    }

    const newTheme = event.data?.value || '';
    theme.value = newTheme;
  });

  return theme;
}
```

### Mobile



## 总结



