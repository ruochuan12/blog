---
highlight: darcula
theme: smartblue
---

本文为稀土掘金技术社区首发签约文章，14天内禁止转载，14天后未获授权禁止转载，侵权必究！

## 1. 前言

大家好，我是[若川](https://lxchuan12.gitee.io)。我倾力持续组织了一年[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（4.1k+人）第一的专栏，写有20余篇源码文章。

我们开发业务时经常会使用到组件库，一般来说，很多时候我们不需要关心内部实现。但是如果希望学习和深究里面的原理，这时我们可以分析自己使用的组件库实现。有哪些优雅实现、最佳实践、前沿技术等都可以值得我们借鉴。

相比于原生 `JS` 等源码。我们或许更应该学习，正在使用的组件库的源码，因为有助于帮助我们写业务和写自己的组件。

如果是 `Vue` 技术栈，开发移动端的项目，大多会选用 `vant` 组件库，目前（2022-11-20）`star` 多达 `20.5k`，最新版本是 `v4.0.0-rc7`。我们可以挑选 `vant` 组件库学习，我会写一个[vant 组件库源码系列专栏](https://juejin.cn/column/7140264842954276871)，欢迎大家关注。

**vant 组件库源码分析系列：**

- 1.[vant 4 即将正式发布，支持暗黑主题，那么是如何实现的呢](https://juejin.cn/post/7158239404484460574)
- 2.[跟着 vant 4 源码学习如何用 vue3+ts 开发一个 loading 组件，仅88行代码](https://juejin.cn/post/7160465286036979748)
- 3.[分析 vant 4 源码，如何用 vue3 + ts 开发一个瀑布流滚动加载的列表组件？](https://juejin.cn/post/7165661072785932296)
- 4.[分析 vant 4 源码，学会用 vue3 + ts 开发毫秒级渲染的倒计时组件，真是妙啊](https://juejin.cn/post/7169003604303413278)
- 5.[vant 4.0 正式发布了，分析其源码学会用 vue3 写一个图片懒加载组件！](https://juejin.cn/post/7171227417246171149)

这次我们来学习倒计时组件，[`countdown`](https://vant-contrib.gitee.io/vant/v4/#/zh-CN/count-down)。

学完本文，你将学到：

```bash
1. 如何开发一个更优雅的毫秒级渲染的倒计时组件
2. 学会使用 requestAnimationFrame
3. 等等
```

## 2. 准备工作

看一个开源项目，我们可以先看 [README.md](https://github.com/youzan/vant) 再看 [github/CONTRIBUTING.md](https://github.com/youzan/vant/blob/main/.github/CONTRIBUTING.md)

### 2.1 克隆源码

You will need [Node.js >= 14](https://nodejs.org) and [pnpm](https://pnpm.io).

```bash
# 推荐克隆我的项目
git clone https://github.com/lxchuan12/vant-analysis
cd vant-analysis/vant

# 或者克隆官方仓库
git clone git@github.com:vant-ui/vant.git
cd vant

# 安装依赖，如果没安装 pnpm，可以用 npm i pnpm -g 安装，或者查看官网通过其他方式安装
pnpm i

# 启动服务
pnpm dev
```

执行 `pnpm dev` 后，这时我们打开倒计时组件 `http://localhost:5173/#/zh-CN/count-down`。

## 3. 倒计时组件可谓是十分常用

在各种电商类或者其他的移动端页面中，倒计时真的是太常见了。我们自己也基本能够快速的写一个倒计时组件。代码实现参考这里，主要是 `JavaScript`。[码上掘金倒计时初步代码@若川](https://code.juejin.cn/pen/7167966535649230883)

代码中，我直接使用的 `setInterval` 和每秒钟执行一次。把倒计时的时候减去`1s`，当倒计时毫秒数不足时用 `clearInterval` 清除停止定时器。

但如果要实现毫秒级的倒计时这种方法行不通。
另外 `setInterval` 这种做法，并不是最优的。
那么，`vant` 倒计时组件中，是如何处理毫秒级和实现倒计时呢。

带着问题我们直接找到 `countdown demo` 文件：`vant/packages/vant/src/count-down/demo/index.vue`。为什么是这个文件，我在之前文章[跟着 vant4 源码学习如何用 vue3+ts 开发一个 loading 组件，仅88行代码](https://juejin.cn/post/7160465286036979748#heading-3)分析了其原理，感兴趣的小伙伴点击查看。这里就不赘述了。

## 4. 利用 demo 调试源码

组件源码中的 `TS` 代码我不会过多解释。没学过 `TS` 的小伙伴，推荐学这个[TypeScript 入门教程](http://ts.xcatliu.com/)。
另外，`vant` 使用了 [@vue/babel-plugin-jsx](https://www.npmjs.com/package/@vue/babel-plugin-jsx) 插件来支持 `JSX、TSX`。

![倒计时组件](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae7e1662c40449ef9a815dfe6c4d6e19~tplv-k3u1fbpfcp-watermark.image?)

```js
// vant/packages/vant/src/count-down/demo/index.vue
<script setup lang="ts">
import VanGrid from '../../grid';
import VanGridItem from '../../grid-item';
import VanCountDown, { type CountDownInstance } from '..';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import { showToast } from '../../toast';

const t = useTranslate({
  'zh-CN': {
    reset: '重置',
    pause: '暂停',
    start: '开始',
    finished: '倒计时结束',
    millisecond: '毫秒级渲染',
    customStyle: '自定义样式',
    customFormat: '自定义格式',
    manualControl: '手动控制',
    formatWithDay: 'DD 天 HH 时 mm 分 ss 秒',
  },
});

const time = ref(30 * 60 * 60 * 1000);
const countDown = ref<CountDownInstance>();

// 开始
const start = () => {
  countDown.value?.start();
};
// 暂停
const pause = () => {
  countDown.value?.pause();
};
// 重置
const reset = () => {
  countDown.value?.reset();
};
const onFinish = () => showToast(t('finished'));
</script>

<template>

  <!-- 基本使用 -->
  <demo-block :title="t('basicUsage')">
    <van-count-down :time="time" />
  </demo-block>

  <!-- 自定义渲染 -->
  <demo-block :title="t('customFormat')">
    <van-count-down :time="time" :format="t('formatWithDay')" />
  </demo-block>

  <!-- 毫秒级渲染 -->
  <demo-block :title="t('millisecond')">
    <van-count-down millisecond :time="time" format="HH:mm:ss:SS" />
  </demo-block>

  <!-- 自定义样式-->
  <demo-block :title="t('customStyle')">
    <van-count-down :time="time">
      <template #default="currentTime">
        <span class="block">{{ currentTime.hours }}</span>
        <span class="colon">:</span>
        <span class="block">{{ currentTime.minutes }}</span>
        <span class="colon">:</span>
        <span class="block">{{ currentTime.seconds }}</span>
      </template>
    </van-count-down>
  </demo-block>

  <!-- 手动控制 -->
  <demo-block :title="t('manualControl')">
    <van-count-down
      ref="countDown"
      millisecond
      :time="3000"
      :auto-start="false"
      format="ss:SSS"
      @finish="onFinish"
    />
    <van-grid clickable :column-num="3">
      <van-grid-item icon="play-circle-o" :text="t('start')" @click="start" />
      <van-grid-item icon="pause-circle-o" :text="t('pause')" @click="pause" />
      <van-grid-item icon="replay" :text="t('reset')" @click="reset" />
    </van-grid>
  </demo-block>
</template>
```

从 `demo` 文件中，我们可以看出 `import VanCountDown, { type CountDownInstance } from '..';`，引入自 `vant/packages/vant/src/count-down/index.ts`。我们继续来看入口 `index.ts`。

## 5. 入口 index.ts

主要就是导出一下类型和变量等。

```js
// vant/packages/vant/src/count-down/index.ts
import { withInstall } from '../utils';
import _CountDown from './CountDown';

export const CountDown = withInstall(_CountDown);
// 默认导出
// import xxx from 'vant'
export default CountDown;
export { countDownProps } from './CountDown';
export type { CountDownProps } from './CountDown';
export type {
  CountDownInstance,
  CountDownThemeVars,
  CountDownCurrentTime,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanCountDown: typeof CountDown;
  }
}
```

`withInstall` 函数在之前文章[5.1 withInstall 给组件对象添加 install 方法](https://juejin.cn/post/7160465286036979748#heading-10) 也有分析，这里就不赘述了。

我们可以在这些文件，任意位置加上 `debugger` 调试源码。

截两张调试图。

调试 `Countdown` `setup`。

![调试 setup](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/73eb51d983894281b6f4bf40f8f9e19a~tplv-k3u1fbpfcp-watermark.image?)

调试 `useCountDown`。

![调试 useCountDown](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0fc529f702df4d7c8c103b11d79daa9b~tplv-k3u1fbpfcp-watermark.image?)

我们跟着调试，继续分析 `Countdown`。

## 6. 主文件 Countdown

```js
// vant/packages/vant/src/count-down/CountDown.tsx
import { watch, computed, defineComponent, type ExtractPropTypes } from 'vue';

// Utils
import {
  truthProp,
  makeStringProp,
  makeNumericProp,
  createNamespace,
} from '../utils';
import { parseFormat } from './utils';

// Composables
import { useCountDown } from '@vant/use';
import { useExpose } from '../composables/use-expose';

const [name, bem] = createNamespace('count-down');

export const countDownProps = {
  time: makeNumericProp(0),
  format: makeStringProp('HH:mm:ss'),
  autoStart: truthProp,
  millisecond: Boolean,
};

export type CountDownProps = ExtractPropTypes<typeof countDownProps>;

export default defineComponent({
  name,

  props: countDownProps,

  emits: ['change', 'finish'],

  setup(props, { emit, slots }) {
    // 代码省略，下文叙述
  },
});
```

### 6.1 setup 部分

这一部分主要使用了`useCountDown`。

```js
setup(props, { emit, slots }) {
  // useCountDown 组合式 API
  const { start, pause, reset, current } = useCountDown({
    // 传入的时间毫秒数，+ 是字符串转数字
    time: +props.time,
    // 毫秒级渲染
    millisecond: props.millisecond,
    // 回调事件，onChange, onFinish
    onChange: (current) => emit('change', current),
    onFinish: () => emit('finish'),
  });

  // 格式化时间
  const timeText = computed(() => parseFormat(props.format, current.value));

  // 重置，重新开始
  const resetTime = () => {
    reset(+props.time);

    if (props.autoStart) {
      start();
    }
  };

  watch(() => props.time, resetTime, { immediate: true });

  // 导出 start、pause、reset
  useExpose({
    start,
    pause,
    reset: resetTime,
  });

  return () => (
    // 有传入插槽，使用插槽，支持自定义样式，传入解析后的时间对象
    <div role="timer" class={bem()}>
      {slots.default ? slots.default(current.value) : timeText.value}
    </div>
  );
},
```

### 6.2 useExpose 暴露

```js
import { getCurrentInstance } from 'vue';
import { extend } from '../utils';

// expose public api
export function useExpose<T = Record<string, any>>(apis: T) {
  const instance = getCurrentInstance();
  // 合并到 getCurrentInstance().proxy 上
  if (instance) {
    extend(instance.proxy as object, apis);
  }
}
```

通过 `ref` 可以获取到 `Countdown` 实例并调用实例方法，详见[组件实例方法](https://vant-contrib.gitee.io/vant/v4/#/zh-CN/advanced-usage#zu-jian-shi-li-fang-fa)。

>`Vant` 中的许多组件提供了实例方法，调用实例方法时，我们需要通过 `ref` 来注册组件引用信息，引用信息将会注册在父组件的 `$refs` 对象上。注册完成后，我们可以通过 `this.$refs.xxx` 或者

```js
const xxxRef = ref();
xxxRef.value.xxx();
```

访问到对应的组件实例，并调用上面的实例方法。

## 7. useCountDown 组合式 API

### 7.1 parseTime 解析时间

```js
// vant/packages/vant-use/src/useCountDown/index.ts
import {
  ref,
  computed,
  onActivated,
  onDeactivated,
  onBeforeUnmount,
} from 'vue';
import { raf, cancelRaf, inBrowser } from '../utils';

export type CurrentTime = {
  days: number;
  hours: number;
  total: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
};

export type UseCountDownOptions = {
  time: number;
  // 毫秒
  millisecond?: boolean;
  onChange?: (current: CurrentTime) => void;
  onFinish?: () => void;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// 解析时间
function parseTime(time: number): CurrentTime {
  const days = Math.floor(time / DAY);
  const hours = Math.floor((time % DAY) / HOUR);
  const minutes = Math.floor((time % HOUR) / MINUTE);
  const seconds = Math.floor((time % MINUTE) / SECOND);
  const milliseconds = Math.floor(time % SECOND);

  return {
    total: time,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
  };
}
```

以上这大段代码，`parseTime` 是主要函数，解析时间，生成天数、小时、分钟、秒、毫秒的对象。

### 7.2 useCountDown 真实逻辑

真实逻辑这一段可以不用细看。可以调试时再细看。

主要就是利用 `Date.now()` 会自己走的原理。

```bash
初始化开始：结束时间 = 当前时间戳 + 剩余时间
获取：剩余时间 = 结束时间 - 当前时间戳
加上自己定时器逻辑循环
剩余时间就是真实流逝的时间
如果是毫秒级渲染，就直接赋值剩余时间
如果不是，那就判断是同一秒才赋值
```

设计的十分巧妙，看到这里，我们可能感慨：不得不佩服。

```js
// 简化版 一
const useCountDown = (options) => {
  let endTime;
  let remain = options.time;
  const getCurrentRemain = () => Math.max(endTime - Date.now(), 0);
  const start = () => {
    endTime = Date.now() + remain;
  }
  const setRemain = (value) => {
    remain = value;
  };
  return {
    start,
  }
}
const { start } = useCountDown({time: 3 * 1000});
start();
```

码上掘金倒计时简化版二

[码上掘金倒计时简化版二@若川](https://code.juejin.cn/pen/7168892330752081928)

```js
// vant/packages/vant-use/src/useCountDown/index.ts
function isSameSecond(time1: number, time2: number): boolean {
  return Math.floor(time1 / 1000) === Math.floor(time2 / 1000);
}

export function useCountDown(options: UseCountDownOptions) {
  let rafId: number;
  let endTime: number;
  let counting: boolean;
  let deactivated: boolean;

  const remain = ref(options.time);
  const current = computed(() => parseTime(remain.value));

  const pause = () => {
    counting = false;
    cancelRaf(rafId);
  };

  const getCurrentRemain = () => Math.max(endTime - Date.now(), 0);

  const setRemain = (value: number) => {
    remain.value = value;
    options.onChange?.(current.value);

    if (value === 0) {
      pause();
      options.onFinish?.();
    }
  };

  const microTick = () => {
    rafId = raf(() => {
      // in case of call reset immediately after finish
      if (counting) {
        setRemain(getCurrentRemain());

        if (remain.value > 0) {
          microTick();
        }
      }
    });
  };

  const macroTick = () => {
    rafId = raf(() => {
      // in case of call reset immediately after finish
      if (counting) {
        const remainRemain = getCurrentRemain();

        if (!isSameSecond(remainRemain, remain.value) || remainRemain === 0) {
          setRemain(remainRemain);
        }

        if (remain.value > 0) {
          macroTick();
        }
      }
    });
  };

  const tick = () => {
    // should not start counting in server
    // see: https://github.com/vant-ui/vant/issues/7807
    if (!inBrowser) {
      return;
    }

    if (options.millisecond) {
      microTick();
    } else {
      macroTick();
    }
  };

  const start = () => {
    if (!counting) {
      endTime = Date.now() + remain.value;
      counting = true;
      tick();
    }
  };

  const reset = (totalTime: number = options.time) => {
    pause();
    remain.value = totalTime;
  };

  // 组件被卸载之前被调用
  onBeforeUnmount(pause);

  // 激活
  onActivated(() => {
    if (deactivated) {
      counting = true;
      deactivated = false;
      tick();
    }
  });

  onDeactivated(() => {
    if (counting) {
      pause();
      deactivated = true;
    }
  });

  // 返回方法和当前时间对象
  return {
    start,
    pause,
    reset,
    current,
  };
}

```

我们继续来看 `raf` 和 `cancelRaf`，是如何实现的。

## 8. raf、cancelRaf、inBrowser 实现

```js
// 判断是不是浏览器环境，你可能会问，为啥要判断？因为 SSR （服务端渲染）不是浏览器环境。
export const inBrowser = typeof window !== 'undefined';

// Keep forward compatible
// should be removed in next major version
export const supportsPassive = true;

export function raf(fn: FrameRequestCallback): number {
  return inBrowser ? requestAnimationFrame(fn) : -1;
}

export function cancelRaf(id: number) {
  if (inBrowser) {
    cancelAnimationFrame(id);
  }
}

// double raf for animation
export function doubleRaf(fn: FrameRequestCallback): void {
  raf(() => raf(fn));
}
```

上文代码，主要一个 `API`，`requestAnimationFrame、cancelAnimationFrame`。

我们这里简单理解为 `window.requestAnimationFrame()` 中的回调函数，每 `16.67ms` 执行一次回调函数即可。

也就是类似 `setTimeout、clearTimeout`

```js
const timeId = setTimeout( () => {
  // 16.67ms 执行一次
  console.log('16.67ms 执行一次');
}, 16.67);

clearTimeout(timeId);
```

也可以自行搜索这个 `API` 查阅更多资料。比如 `MDN` 上的解释。

[mdn window.requestAnimationFrame](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame)

>`window.requestAnimationFrame()` 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行

>回调函数执行次数通常是每秒 60 次，但在大多数遵循 W3C 建议的浏览器中，回调函数执行次数通常与浏览器屏幕刷新次数相匹配。

>备注： 若你想在浏览器下次重绘之前继续更新下一帧动画，那么回调函数自身必须再次调用 `window.requestAnimationFrame()`。

## 9. 支持格式化时间，默认 HH:mm:ss

### 9.1 parseFormat 处理格式化

再来看看，组件中，是如何格式化时间的。这个值得我们参考。我们很多时候可能都是写死天数、小时等文案。不支持自定义格式化。

```js
// vant/packages/vant/src/count-down/utils.ts
import { padZero } from '../utils';
import { CurrentTime } from '@vant/use';

export function parseFormat(format: string, currentTime: CurrentTime): string {
  const { days } = currentTime;
  let { hours, minutes, seconds, milliseconds } = currentTime;

  // 有 DD 参数，补零替换，没有则小时数加上天数
  if (format.includes('DD')) {
    format = format.replace('DD', padZero(days));
  } else {
    hours += days * 24;
  }

  // 有 HH 参数，补零替换，没有则分钟数加上小时数
  if (format.includes('HH')) {
    format = format.replace('HH', padZero(hours));
  } else {
    minutes += hours * 60;
  }

  // 有 mm 参数，补零替换，没有则秒数加上分钟数
  if (format.includes('mm')) {
    format = format.replace('mm', padZero(minutes));
  } else {
    seconds += minutes * 60;
  }

  // 有 mm 参数，补零替换，没有则毫秒数加上秒数
  if (format.includes('ss')) {
    format = format.replace('ss', padZero(seconds));
  } else {
    milliseconds += seconds * 1000;
  }

  // 毫秒数 默认补三位数，按照格式最终给出对应的位数
  if (format.includes('S')) {
    const ms = padZero(milliseconds, 3);

    if (format.includes('SSS')) {
      format = format.replace('SSS', ms);
    } else if (format.includes('SS')) {
      format = format.replace('SS', ms.slice(0, 2));
    } else {
      format = format.replace('S', ms.charAt(0));
    }
  }

  // 最终返回格式化的数据
  return format;
}
```

### 9.2 padZero 补零

```js
// vant/packages/vant-compat/node_modules/vant/src/utils/format.ts
// 补零操作
export function padZero(num: Numeric, targetLength = 2): string {
  let str = num + '';

  while (str.length < targetLength) {
    str = '0' + str;
  }

  return str;
}
```

行文自此，我们就分析完了毫秒级渲染的倒计时组件的实现。

## 10. 总结

我们来简单总结下。通过 `demo` 文件调试，入口文件，主文件，`useCountDown` 组合式 API，插槽等。
分析了自定义格式、毫秒级渲染、自定义样式（利用插槽）等功能的实现。

其中毫秒级渲染，主要就是利用 `Date.now()` 和 （`window.requestAnimationFrame`）每 `16.67ms` 执行一次回调函数。

大致流程如下：

```bash
初始化开始：结束时间 = 当前时间戳 + 剩余时间
获取：剩余时间 = 结束时间 - 当前时间戳
加上自己定时器逻辑循环（`window.requestAnimationFrame`）每 16.67ms 执行一次回调函数
剩余时间就是真实流逝的时间
如果是毫秒级渲染，就直接赋值剩余时间
如果不是，那就判断是同一秒才赋值
```

看完这篇源码文章，再去看 [CountDown 组件文档](https://vant-contrib.gitee.io/vant/#/zh-CN/count-down)，可能就会有豁然开朗的感觉。再看其他组件，可能就可以猜测出大概实现的代码了。

如果是使用 `react`、`Taro` 技术栈，感兴趣也可以看看 `taroify` `CountDown` 组件的实现 [文档](https://taroify.gitee.io/taroify.com/components/countdown)，[源码](https://github.com/mallfoundry/taroify/tree/main/packages/core/src/countdown)。

**如果看完有收获，欢迎点赞、评论、分享支持。你的支持和肯定，是我写作的动力**。

## 11. 加源码共读群交流

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)。我会写一个[组件库源码系列专栏](https://juejin.cn/column/7140264842954276871)，欢迎大家关注。

我倾力持续组织了一年[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。

另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（4.2k+人）第一的专栏，写有20余篇源码文章。包含`jQuery`、`underscore`、`lodash`、`vuex`、`sentry`、`axios`、`redux`、`koa`、`vue-devtools`、`vuex4`、`koa-compose`、`vue 3.2 发布`、`vue-this`、`create-vue`、`玩具vite`、`create-vite` 等20余篇源码文章。
