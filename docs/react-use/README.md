# 自从学了 react-use 源码，我写自定义 React Hooks 越来越顺了~

## 1. 前言

大家好，我是[若川](https://lxchuan12.gitee.io)。我倾力持续组织了一年多[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（4.7k+人）第一的专栏，写有20余篇源码文章。

最近 `React` 出了 [新文档 react.dev](https://react.dev)，[新中文文档 zh-hans.react.dev](https://zh-hans.react.dev/)。

现在用 `react` 开发离不开各种 `hooks`。学习各种 `hooks` 的工具库，有助于我们更好的使用和理解 `hooks` 。前端社区中有活跃的 [ahooks](https://ahooks.js.org/zh-CN/)。不过，这次我们来学习目前 `36.2k` `star` 的 [react-use](https://github.com/streamich/react-use) 库。

[react-use 文档](https://streamich.github.io/react-use/)
是用 [storybook](https://storybook.js.org/) 搭建的。

如果公司项目需要搭建组件库或者 `hooks`、工具库等，[storybook](https://storybook.js.org/) 或许是不错的选择。

>[react-use 中文翻译仓库](https://github.com/zenghongtu/react-use-chinese/blob/master/README.md)，最后更新是2年前，可能有点老。

## 2. 环境准备

看一个开源仓库，第一步一般是看 `README.md` 和 `contributing.md` 贡献文档。第二步的克隆下来。按照贡献指南文档，把项目跑起来。

贡献文档中有如下文档。

### 2.1 创建一个新 hook 的步骤

1. 创建 `src/useYourHookName.ts` 和 `stories/useYourHookName.story.tsx`，然后运行 `yarn start`。
2. 创建 `tests/useYourHookName.test.ts`，运行 `yarn test:watch` 监听测试用例执行。
3. 创建 `docs/useYourHookName.md` 文档。
4. 在 `src/index.ts` 文件导出你写的 `hook`，然后添加你的 `hook` 到 `REAMDE.md` 中。

我们可以得知具体要做什么，新增 `hook` 关联哪些文件。

```shell
# 可以克隆官方项目
git clone https://github.com/streamich/react-use.git
cd react-use
yarn install
yarn start
```

克隆项目到本地，安装依赖完成后，执行 `yarn start`。

![命令终端运行 yarn start](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e150fddb489b4e2299ba7a6ea8723cda~tplv-k3u1fbpfcp-watermark.image?)

本地环境打开 `useEffectOnce` `docs`：`http://localhost:6008/?path=/story/lifecycle-useeffectonce--docs`

我们先挑选这个 `useEffectOnce` 简单的 `hook` 来分析。

### 2.2 useEffectOnce

#### 2.2.1 react-use/src/useEffectOnce.ts

```ts
// react-use/src/useEffectOnce.ts
import { EffectCallback, useEffect } from 'react';

// 源码非常简单，不依赖任何参数的函数。

const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, []);
};

export default useEffectOnce;
```

我们来看测试用例，直接使用测试用例调试 `useEffectOnce` 源码。

我之前写过相关文章。可以参考学习。
[你可能不知道测试用例(Vitest)可以调试开源项目(Vue3) 源码](https://juejin.cn/post/7212263304394981432)

我装了 `jest` 和 `jest runner` `vscode` 插件，装完后测试用例中会直接显示 `run`、和 `debug` 按钮。还在装了 `vitest`、`vitest runner` `vscode` 插件，装完后测试用例中会直接显示 `run(vitest)`和 `debug(vitest)` 按钮。

如下图所示。

![runner](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/630baff982384ea7863effffbf5bd728~tplv-k3u1fbpfcp-watermark.image?)

这个项目使用的是 `jest`。于是我点击最右侧的 `debug`。

![调试 gif 图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5eededaeee6847cc90aee01ec2516bcb~tplv-k3u1fbpfcp-watermark.image?)

#### 2.2.2 react-use/tests/useEffectOnce.test.ts

```ts
// react-use/tests/useEffectOnce.test.ts
import { renderHook } from '@testing-library/react-hooks';
import { useEffectOnce } from '../src';

// mock 函数
const mockEffectCleanup = jest.fn();
const mockEffectCallback = jest.fn().mockReturnValue(mockEffectCleanup);

it('should run provided effect only once', () => {
  const { rerender } = renderHook(() => useEffectOnce(mockEffectCallback));
  // 只调用一次
  expect(mockEffectCallback).toHaveBeenCalledTimes(1);

  // 重新渲染时，只调用一次
  rerender();
  expect(mockEffectCallback).toHaveBeenCalledTimes(1);
});

it('should run clean-up provided on unmount', () => {
  const { unmount } = renderHook(() => useEffectOnce(mockEffectCallback));
  expect(mockEffectCleanup).not.toHaveBeenCalled();

  unmount();
  // 卸载时 执行一次
  expect(mockEffectCleanup).toHaveBeenCalledTimes(1);
});
```

#### 2.2.3 react-use/stories/useEffectOnce.story.tsx

`xxx.story.tsx` 渲染组件，可以直接操作。`Demo` 和 `docs`。

```ts
// react-use/stories/useEffectOnce.story.tsx
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { useEffectOnce } from '../src';
import ConsoleStory from './util/ConsoleStory';
import ShowDocs from './util/ShowDocs';

const Demo = () => {
  useEffectOnce(() => {
    console.log('Running effect once on mount');

    return () => {
      console.log('Running clean-up of effect on unmount');
    };
  });

  return <ConsoleStory />;
};

storiesOf('Lifecycle/useEffectOnce', module)
  .add('Docs', () => <ShowDocs md={require('../docs/useEffectOnce.md')} />)
  .add('Demo', () => <Demo />);

```

`docs/useEffectOnce.md` 省略，基本跟测试用例一样。可以说测试用例就是**活文档**。

接下来我们来看其他的 `hooks` 源码，限于篇幅，主要就讲述源码，不包含测试用例、文档、`story`。

`TS` 也不会过多描述。如果对TS不太熟悉，推荐学习这个[《TypeScript 入门教程》](https://ts.xcatliu.com/)。

我们先来看 `Sensors` 行为部分。

## 3. Sensors 行为

### 3.1 useIdle

[useIdle docs](https://streamich.github.io/react-use/?path=/story/sensors-useidle--docs) | 
[useIdle demo](https://streamich.github.io/react-use/?path=/story/sensors-useidle--demo)

>tracks whether user is being inactive.
>跟踪用户是否处于非活动状态。

主要是：监听用户行为的事件（默认的 `'mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel'` ），指定时间内没有用户操作行为就是非活动状态。

```js
import { useEffect, useState } from 'react';
// 防抖、节流
import { throttle } from 'throttle-debounce';
// 事件解绑和监听函数
import { off, on } from './misc/util';

// 监听默认事件
const defaultEvents = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel'];
const oneMinute = 60e3;

const useIdle = (
  ms: number = oneMinute,
  initialState: boolean = false,
  events: string[] = defaultEvents
): boolean => {
  const [state, setState] = useState<boolean>(initialState);

  useEffect(() => {
    let mounted = true;
    let timeout: any;
    let localState: boolean = state;
    const set = (newState: boolean) => {
      if (mounted) {
        localState = newState;
        setState(newState);
      }
    };

    const onEvent = throttle(50, () => {
      if (localState) {
        set(false);
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => set(true), ms);
    });
    const onVisibility = () => {
      if (!document.hidden) {
        onEvent();
      }
    };

    for (let i = 0; i < events.length; i++) {
      on(window, events[i], onEvent);
    }
    on(document, 'visibilitychange', onVisibility);

    timeout = setTimeout(() => set(true), ms);

    return () => {
      mounted = false;

      // 销毁 解绑事件
      for (let i = 0; i < events.length; i++) {
        off(window, events[i], onEvent);
      }
      off(document, 'visibilitychange', onVisibility);
    };
  }, [ms, events]);

  return state;
};

export default useIdle;
```

我们接着来看，`useLocation` `hook`。

### 3.2 useLocation

[useLocation docs](https://streamich.github.io/react-use/?path=/story/sensors-uselocation--docs) | 
[useLocation demo](https://streamich.github.io/react-use/?path=/story/sensors-uselocation--demo)

>React sensor hook that tracks brower's location.

主要获取 `window.location` 等对象信息。

[mdn History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API)

[阮一峰老师的网道：history](https://wangdoc.com/javascript/bom/history)
[阮一峰老师的网道：location](https://wangdoc.com/javascript/bom/location)

自定义事件 [mdn 创建和触发 events](https://developer.mozilla.org/zh-CN/docs/Web/Events/Creating_and_triggering_events)

```ts
import { useEffect, useState } from 'react';
// 判断浏览器
import { isBrowser, off, on } from './misc/util';

const patchHistoryMethod = (method) => {
  const history = window.history;
  const original = history[method];

  history[method] = function (state) {
    // 原先函数
    const result = original.apply(this, arguments);
    // 自定义事件 new Event 、 dispatchEvent
    const event = new Event(method.toLowerCase());

    (event as any).state = state;

    window.dispatchEvent(event);

    return result;
  };
};

if (isBrowser) {
  patchHistoryMethod('pushState');
  patchHistoryMethod('replaceState');
}
// 省略 LocationSensorState 类型

const useLocationServer = (): LocationSensorState => ({
  trigger: 'load',
  length: 1,
});

const buildState = (trigger: string) => {
  const { state, length } = window.history;

  const { hash, host, hostname, href, origin, pathname, port, protocol, search } = window.location;

  return {
    trigger,
    state,
    length,
    hash,
    host,
    hostname,
    href,
    origin,
    pathname,
    port,
    protocol,
    search,
  };
};

const useLocationBrowser = (): LocationSensorState => {
  const [state, setState] = useState(buildState('load'));

  useEffect(() => {
    const onPopstate = () => setState(buildState('popstate'));
    const onPushstate = () => setState(buildState('pushstate'));
    const onReplacestate = () => setState(buildState('replacestate'));

    on(window, 'popstate', onPopstate);
    on(window, 'pushstate', onPushstate);
    on(window, 'replacestate', onReplacestate);

    return () => {
      off(window, 'popstate', onPopstate);
      off(window, 'pushstate', onPushstate);
      off(window, 'replacestate', onReplacestate);
    };
  }, []);

  return state;
};

const hasEventConstructor = typeof Event === 'function';

export default isBrowser && hasEventConstructor ? useLocationBrowser : useLocationServer;
```

接着我们继续来看 `State` 状态部分。

## 4. State 状态

### 4.1 useFirstMountState

[useFirstMountState docs](https://streamich.github.io/react-use/?path=/story/state-usefirstmountstate--docs) | [useFirstMountState demo](https://streamich.github.io/react-use/?path=/story/state-usefirstmountstate--demo)

>Returns true if component is just mounted (on first render) and false otherwise.
>若组件刚刚加载（在第一次渲染时），则返回 `true`，否则返回 `false`。

```ts
import { useRef } from 'react';

export function useFirstMountState(): boolean {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;

    return true;
  }

  return isFirst.current;
}
```

### 4.2 usePrevious

[usePrevious docs](https://streamich.github.io/react-use/?path=/story/state-useprevious--docs) | 
[usePrevious demo](https://streamich.github.io/react-use/?path=/story/state-useprevious--demo)

>React state hook that returns the previous state as described in the React hooks FAQ.
保留上一次的状态。

利用 `useRef` 的不变性。

```ts
import { useEffect, useRef } from 'react';

export default function usePrevious<T>(state: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = state;
  });

  return ref.current;
}
```

### 4.3 useSet

[useSet docs](https://streamich.github.io/react-use/?path=/story/state-useset--docs) | 
[useSet demo](https://streamich.github.io/react-use/?path=/story/state-useset--demo)

>React state hook that tracks a Set.

`new Set` 的 hooks 用法。
useSet 可以用来列表展开、收起等其他场景。
返回 `[set ,{add, remove, toggle, reset, has }]`

```ts
import { useCallback, useMemo, useState } from 'react';

export interface StableActions<K> {
  add: (key: K) => void;
  remove: (key: K) => void;
  toggle: (key: K) => void;
  reset: () => void;
}

export interface Actions<K> extends StableActions<K> {
  has: (key: K) => boolean;
}

const useSet = <K>(initialSet = new Set<K>()): [Set<K>, Actions<K>] => {
  const [set, setSet] = useState(initialSet);

  const stableActions = useMemo<StableActions<K>>(() => {
    const add = (item: K) => setSet((prevSet) => new Set([...Array.from(prevSet), item]));
    const remove = (item: K) =>
      setSet((prevSet) => new Set(Array.from(prevSet).filter((i) => i !== item)));
    const toggle = (item: K) =>
      setSet((prevSet) =>
        prevSet.has(item)
          ? new Set(Array.from(prevSet).filter((i) => i !== item))
          : new Set([...Array.from(prevSet), item])
      );

    return { add, remove, toggle, reset: () => setSet(initialSet) };
  }, [setSet]);

  const utils = {
    has: useCallback((item) => set.has(item), [set]),
    ...stableActions,
  } as Actions<K>;

  return [set, utils];
};

export default useSet;
```

### 4.4 useToggle

[useToggle docs](https://streamich.github.io/react-use/?path=/story/state-usetoggle--docs) | 
[useToggle demo](https://streamich.github.io/react-use/?path=/story/state-usetoggle--demo)

>tracks state of a boolean.
跟踪布尔值的状态。
切换 false => true => false

```ts
import { Reducer, useReducer } from 'react';

const toggleReducer = (state: boolean, nextValue?: any) =>
  typeof nextValue === 'boolean' ? nextValue : !state;

const useToggle = (initialValue: boolean): [boolean, (nextValue?: any) => void] => {
  return useReducer<Reducer<boolean, any>>(toggleReducer, initialValue);
};

export default useToggle;
```

我们继续来看 `Side-effects` 副作用部分。

## 5. Side-effects 副作用

### 5.1 useMountedState

`useMountedState` 属于 `lifecycle` 模块，但这个 `hook` 在 `useAsyncFn` 中使用，所以放到这里讲述。

[useMountedState docs](https://streamich.github.io/react-use/?path=/story/lifecycle-usemountedstate--docs) | 
[useMountedState demo](https://streamich.github.io/react-use/?path=/story/lifecycle-usemountedstate--demo)

>NOTE!: despite having State in its name this hook does not cause component re-render. This component designed to be used to avoid state updates on unmounted components.

>注意！：尽管名称中有State，但该钩子不会导致组件重新呈现。此组件设计用于避免对未安装的组件进行状态更新。

>Lifecycle hook providing ability to check component's mount state.
Returns a function that will return true if component mounted and false otherwise.
>生命周期挂钩提供了检查组件装载状态的能力。
返回一个函数，如果组件已安装，则返回true，否则返回false。

```ts
import { useCallback, useEffect, useRef } from 'react';

export default function useMountedState(): () => boolean {
  const mountedRef = useRef<boolean>(false);
  const get = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return get;
}
```

### 5.2 useAsyncFn

看了 `useMountedState` `hook`，我们继续看 `useAsyncFn` 函数源码。

主要函数传入 `Promise` 函数 `fn`，然后执行函数 fn.then()。
返回 state、callback(fn.then)。

```ts
// 省略若干代码
export default function useAsyncFn<T extends FunctionReturningPromise>(
  fn: T,
  deps: DependencyList = [],
  initialState: StateFromFunctionReturningPromise<T> = { loading: false }
): AsyncFnReturn<T> {
  const lastCallId = useRef(0);
  const isMounted = useMountedState();
  const [state, set] = useState<StateFromFunctionReturningPromise<T>>(initialState);

  const callback = useCallback((...args: Parameters<T>): ReturnType<T> => {
    const callId = ++lastCallId.current;

    if (!state.loading) {
      set((prevState) => ({ ...prevState, loading: true }));
    }

    return fn(...args).then(
      (value) => {
        isMounted() && callId === lastCallId.current && set({ value, loading: false });

        return value;
      },
      (error) => {
        isMounted() && callId === lastCallId.current && set({ error, loading: false });

        return error;
      }
    ) as ReturnType<T>;
  }, deps);

  return [state, callback as unknown as T];
}
```

### 5.3 useAsync

[useAsync docs](https://streamich.github.io/react-use/?path=/story/side-effects-useasync--docs) | 
[useAsync demo](https://streamich.github.io/react-use/?path=/story/side-effects-useasync--demo)

>React hook that resolves an async function or a function that returns a promise;
>解析异步函数或返回 `promise` 的函数的 `React` 钩子；

```ts
import { DependencyList, useEffect } from 'react';
import useAsyncFn from './useAsyncFn';
import { FunctionReturningPromise } from './misc/types';

export { AsyncState, AsyncFnReturn } from './useAsyncFn';

export default function useAsync<T extends FunctionReturningPromise>(
  fn: T,
  deps: DependencyList = []
) {
  const [state, callback] = useAsyncFn(fn, deps, {
    loading: true,
  });

  useEffect(() => {
    callback();
  }, [callback]);

  return state;
}
```

### 5.4 useAsyncRetry

[useAsyncRetry docs](https://streamich.github.io/react-use/?path=/story/side-effects-useasyncretry--docs) | 
[useAsyncRetry demo](https://streamich.github.io/react-use/?path=/story/side-effects-useasyncretry--demo)

>Uses useAsync with an additional retry method to easily retry/refresh the async function;
>重试

主要就是变更依赖，次数（attempt），变更时会执行 `useAsync` 的 `fn` 函数。

```ts
import { DependencyList, useCallback, useState } from 'react';
import useAsync, { AsyncState } from './useAsync';

export type AsyncStateRetry<T> = AsyncState<T> & {
  retry(): void;
};

const useAsyncRetry = <T>(fn: () => Promise<T>, deps: DependencyList = []) => {
  const [attempt, setAttempt] = useState<number>(0);
  const state = useAsync(fn, [...deps, attempt]);

  const stateLoading = state.loading;
  const retry = useCallback(() => {
    // 省略开发环境警告提示

    setAttempt((currentAttempt) => currentAttempt + 1);
  }, [...deps, stateLoading]);

  return { ...state, retry };
};

export default useAsyncRetry;
```

### 5.5 useTimeoutFn

`useTimeoutFn` 属于 `Animations` 模块，但这个 `hook` 在 `useDebounce` 中使用，所以放到这里讲述。

[useTimeoutFn docs](https://streamich.github.io/react-use/?path=/story/animation-usetimeoutfn--docs) | [useTimeoutFn demo](https://streamich.github.io/react-use/?path=/story/animation-usetimeoutfn--demo)

>Calls given function after specified amount of milliseconds.
>在指定的毫秒数后调用给定的函数。

主要是 `useRef` 和 `setTimeout` 结合实现的。

```ts
import { useCallback, useEffect, useRef } from 'react';

export type UseTimeoutFnReturn = [() => boolean | null, () => void, () => void];

export default function useTimeoutFn(fn: Function, ms: number = 0): UseTimeoutFnReturn {
  const ready = useRef<boolean | null>(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const callback = useRef(fn);

  const isReady = useCallback(() => ready.current, []);

  const set = useCallback(() => {
    ready.current = false;
    timeout.current && clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      ready.current = true;
      callback.current();
    }, ms);
  }, [ms]);

  const clear = useCallback(() => {
    ready.current = null;
    timeout.current && clearTimeout(timeout.current);
  }, []);

  // update ref when function changes
  useEffect(() => {
    callback.current = fn;
  }, [fn]);

  // set on mount, clear on unmount
  useEffect(() => {
    set();

    return clear;
  }, [ms]);

  return [isReady, clear, set];
}
```

### 5.6 useDebounce

[useDebounce docs](https://streamich.github.io/react-use/?path=/story/side-effects-usedebounce--docs) | 
[useDebounce demo](https://streamich.github.io/react-use/?path=/story/side-effects-usedebounce--demo)

>React hook that delays invoking a function until after wait milliseconds have elapsed since the last time the debounced function was invoked.
>防抖

```ts
import { DependencyList, useEffect } from 'react';
import useTimeoutFn from './useTimeoutFn';

export type UseDebounceReturn = [() => boolean | null, () => void];

export default function useDebounce(
  fn: Function,
  ms: number = 0,
  deps: DependencyList = []
): UseDebounceReturn {
  const [isReady, cancel, reset] = useTimeoutFn(fn, ms);

  useEffect(reset, deps);

  return [isReady, cancel];
}
```

### 5.7 useThrottle

[useThrottle docs](https://streamich.github.io/react-use/?path=/story/side-effects-usethrottle--docs) | 
[useThrottle demo](https://streamich.github.io/react-use/?path=/story/side-effects-usethrottle--demo)

>React hooks that throttle.

节流

```ts
import { useEffect, useRef, useState } from 'react';
import useUnmount from './useUnmount';

const useThrottle = <T>(value: T, ms: number = 200) => {
  const [state, setState] = useState<T>(value);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const nextValue = useRef(null) as any;
  const hasNextValue = useRef(0) as any;

  useEffect(() => {
    if (!timeout.current) {
      setState(value);
      const timeoutCallback = () => {
        if (hasNextValue.current) {
          hasNextValue.current = false;
          setState(nextValue.current);
          timeout.current = setTimeout(timeoutCallback, ms);
        } else {
          timeout.current = undefined;
        }
      };
      timeout.current = setTimeout(timeoutCallback, ms);
    } else {
      nextValue.current = value;
      hasNextValue.current = true;
    }
  }, [value]);

  useUnmount(() => {
    timeout.current && clearTimeout(timeout.current);
  });

  return state;
};

export default useThrottle;
```

我们继续来看 `UI` 用户界面部分。

## 6. UI 用户界面

### 6.1 useFullscreen

[useFullscreen docs](https://streamich.github.io/react-use/?path=/story/ui-usefullscreen--docs) | 
[useFullscreen demo](https://streamich.github.io/react-use/?path=/story/ui-usefullscreen--demo)

>Display an element full-screen, optional fallback for fullscreen video on iOS.
实现全屏

主要使用 [screenfull](https://github.com/sindresorhus/screenfull) npm 包实现。

```ts
import { RefObject, useState } from 'react';
import screenfull from 'screenfull';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';
import { noop, off, on } from './misc/util';

export interface FullScreenOptions {
  video?: RefObject<
    HTMLVideoElement & { webkitEnterFullscreen?: () => void; webkitExitFullscreen?: () => void }
  >;
  onClose?: (error?: Error) => void;
}

const useFullscreen = (
  ref: RefObject<Element>,
  enabled: boolean,
  options: FullScreenOptions = {}
): boolean => {
  const { video, onClose = noop } = options;
  const [isFullscreen, setIsFullscreen] = useState(enabled);

  useIsomorphicLayoutEffect(() => {
    if (!enabled) {
      return;
    }
    if (!ref.current) {
      return;
    }

    const onWebkitEndFullscreen = () => {
      if (video?.current) {
        off(video.current, 'webkitendfullscreen', onWebkitEndFullscreen);
      }
      onClose();
    };

    const onChange = () => {
      if (screenfull.isEnabled) {
        const isScreenfullFullscreen = screenfull.isFullscreen;
        setIsFullscreen(isScreenfullFullscreen);
        if (!isScreenfullFullscreen) {
          onClose();
        }
      }
    };

    if (screenfull.isEnabled) {
      try {
        screenfull.request(ref.current);
        setIsFullscreen(true);
      } catch (error) {
        onClose(error);
        setIsFullscreen(false);
      }
      screenfull.on('change', onChange);
    } else if (video && video.current && video.current.webkitEnterFullscreen) {
      video.current.webkitEnterFullscreen();
      on(video.current, 'webkitendfullscreen', onWebkitEndFullscreen);
      setIsFullscreen(true);
    } else {
      onClose();
      setIsFullscreen(false);
    }

    return () => {
      setIsFullscreen(false);
      if (screenfull.isEnabled) {
        try {
          screenfull.off('change', onChange);
          screenfull.exit();
        } catch {}
      } else if (video && video.current && video.current.webkitExitFullscreen) {
        off(video.current, 'webkitendfullscreen', onWebkitEndFullscreen);
        video.current.webkitExitFullscreen();
      }
    };
  }, [enabled, video, ref]);

  return isFullscreen;
};

export default useFullscreen;
```

我们继续来看 `Lifecycles` 生命周期部分。

## 7. Lifecycles 生命周期

### 7.1 useLifecycles

[useLifecycles docs](https://streamich.github.io/react-use/?path=/story/lifecycle-uselifecycles--docs) | 
[useLifecycles demo](https://streamich.github.io/react-use/?path=/story/lifecycle-uselifecycles--demo)

>React lifecycle hook that call mount and unmount callbacks, when component is mounted and un-mounted, respectively.
>React 生命周期挂钩，分别在组件安装和卸载时调用。

```ts
import { useEffect } from 'react';

const useLifecycles = (mount, unmount?) => {
  useEffect(() => {
    if (mount) {
      mount();
    }
    return () => {
      if (unmount) {
        unmount();
      }
    };
  }, []);
};

export default useLifecycles;
```

### 7.2 useCustomCompareEffect

[useCustomCompareEffect docs](https://streamich.github.io/react-use/?path=/story/lifecycle-usecustomcompareeffect--docs) | 
[useCustomCompareEffect demo](https://streamich.github.io/react-use/?path=/story/lifecycle-usecustomcompareeffect--demo)

>A modified useEffect hook that accepts a comparator which is used for comparison on dependencies instead of reference equality.
>一个经过修改的useEffect钩子，它接受一个比较器，该比较器用于对依赖项进行比较，而不是对引用相等进行比较。

```ts
import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

const isPrimitive = (val: any) => val !== Object(val);

type DepsEqualFnType<TDeps extends DependencyList> = (prevDeps: TDeps, nextDeps: TDeps) => boolean;

const useCustomCompareEffect = <TDeps extends DependencyList>(
  effect: EffectCallback,
  deps: TDeps,
  depsEqual: DepsEqualFnType<TDeps>
) => {
  // 省略一些开发环境的警告提示

  const ref = useRef<TDeps | undefined>(undefined);

  if (!ref.current || !depsEqual(deps, ref.current)) {
    ref.current = deps;
  }

  useEffect(effect, ref.current);
};

export default useCustomCompareEffect;
```

### 7.3 useDeepCompareEffect

[useDeepCompareEffect docs](https://streamich.github.io/react-use/?path=/story/lifecycle-usedeepcompareeffect--docs) | 
[useDeepCompareEffect demo](https://streamich.github.io/react-use/?path=/story/lifecycle-usedeepcompareeffect--demo)

>A modified useEffect hook that is using deep comparison on its dependencies instead of reference equality.
>一个修改后的 `useEffect` 钩子，它对其依赖项使用深度比较，而不是引用相等。

```ts
import { DependencyList, EffectCallback } from 'react';
import useCustomCompareEffect from './useCustomCompareEffect';
import isDeepEqual from './misc/isDeepEqual';

const isPrimitive = (val: any) => val !== Object(val);

const useDeepCompareEffect = (effect: EffectCallback, deps: DependencyList) => {
  // 省略若干开发环境的警告提示

  useCustomCompareEffect(effect, deps, isDeepEqual);
};

export default useDeepCompareEffect;
```

最后，我们来看 `Animations` 生命周期部分。

## 8. Animations 动画

### 8.1 useUpdate

[useUpdate docs](https://streamich.github.io/react-use/?path=/story/animation-useupdate--docs) | 
[useUpdate demo](https://streamich.github.io/react-use/?path=/story/animation-useupdate--demo)

>React utility hook that returns a function that forces component to re-render when called.
>React 实用程序钩子返回一个函数，该函数在调用时强制组件重新渲染。

主要用了 `useReducer` 每次调用 `updateReducer` 方法，来达到强制组件重新渲染的目的。

```js
import { useReducer } from 'react';

const updateReducer = (num: number): number => (num + 1) % 1_000_000;

export default function useUpdate(): () => void {
  const [, update] = useReducer(updateReducer, 0);

  return update;
}
```

## 9. 总结

行文至此，我们简单分析了若干 [react-use](https://github.com/streamich/react-use) 的自定义 `React Hooks`。想进一步学习的小伙伴，可以继续学完剩余的 `hooks`。还可以学习 [ahooks](https://ahooks.js.org/zh-CN/)、[别人写的 ahooks 源码分析](https://gpingfeng.github.io/ahooks-analysis/hooks)、
[beautiful-react-hooks](https://github.com/antonioru/beautiful-react-hooks)、[mantine-hooks](https://github.com/mantinedev/mantine/blob/master/src/mantine-hooks)等。

学习过程中带着问题多查阅 `React` [新文档 react.dev](https://react.dev)，[新中文文档 zh-hans.react.dev](https://zh-hans.react.dev/)，相信收获更大。

如果技术栈是 `Vue`，感兴趣的小伙伴可以学习 [VueUse](https://github.com/vueuse/vueuse)。

如果能看完一些 React Hooks 工具集合库的源码。相信一定能对 `React Hooks` 有更深的理解，自己写自定义 `React Hooks` 时也会更加顺利、快速。

---

**如果看完有收获，欢迎点赞、评论、分享支持。你的支持和肯定，是我写作的动力**。

最后可以持续关注我[@若川](https://juejin.cn/user/1415826704971918)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（4.7k+人）第一的专栏，写有20余篇源码文章。

我倾力持续组织了一年多[每周大家一起学习200行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。