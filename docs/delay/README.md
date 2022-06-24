---
highlight: darcula
theme: smartblue
---

# 面试官：请手写一个带取消功能的延迟函数，axios 取消功能的原理是什么
## 1. 前言

>大家好，我是[若川](https://lxchuan12.gitee.io)。**为了能帮助到更多对源码感兴趣、想学会看源码、提升自己前端技术能力的同学**。我倾力组织了[源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以加我微信 [ruochuan12](https://juejin.cn/pin/7005372623400435725) 参与。每周大家一起学习200行左右的源码，共同进步，已进行4个月，很多人都表示收获颇丰。

想学源码，极力推荐关注我写的专栏（目前1.9K人关注）[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093) 包含`jQuery`、`underscore`、`lodash`、`vuex`、`sentry`、`axios`、`redux`、`koa`、`vue-devtools`、`vuex4`、`koa-compose`、`vue 3.2 发布`、`vue-this`、`create-vue`、`玩具vite`等20余篇源码文章。

[本文仓库 https://github.com/lxchuan12/delay-analysis.git，求个star^_^](https://github.com/lxchuan12/delay-analysis.git)

[源码共读活动](https://juejin.cn/post/7079706017579139102) 每周一期，已进行到17期。于是搜寻各种值得我们学习，且代码行数不多的源码。[delay 主文件仅70多行](https://github.com/sindresorhus/delay/blob/main/index.js)，非常值得我们学习。

阅读本文，你将学到：
```bash
1. 学会如何实现一个比较完善的 delay 函数
2. 学会使用 AbortController 实现取消功能
3. 学会面试常考 axios 取消功能实现
4. 等等
```

## 2. 环境准备

```bash
# 推荐克隆我的项目，保证与文章同步
git clone https://github.com/lxchuan12/delay-analysis.git
# npm i -g yarn
cd delay-analysis/delay && yarn i
# VSCode 直接打开当前项目
# code .
# 我写的例子都在 examples 这个文件夹中，可以启动服务本地查看调试
# 在 delay-analysis 目录下
npx http-server examples
# 打开 http://localhost:8080

# 或者克隆官方项目
git clone https://github.com/sindresorhus/delay.git
# npm i -g yarn
cd delay && yarn i
# VSCode 直接打开当前项目
# code .
```

## 3. delay

我们从零开始来实现一个比较完善的 [delay 函数](https://github.com/sindresorhus/delay/blob/main/index.js)。

### 3.1 第一版 简版延迟

要完成这样一个延迟函数。
#### 3.1.1 使用

```js
(async() => {
    await delay1(1000);
    console.log('输出这句');
})();
```

#### 3.1.2 实现

用 `Promise` 和 `setTimeout` 结合实现，我们都很容易实现以下代码。


```js
const delay1 = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
```

我们要传递结果。

### 3.2 第二版 传递 value 参数作为结果

#### 3.2.1 使用

```js
(async() => {
    const result = await delay2(1000, { value: '我是若川' });
    console.log('输出结果', result);
})();
```

我们也很容易实现如下代码。传递 `value` 最后作为结果返回。

#### 3.2.2 实现

因此我们实现也很容易实现如下第二版。

```js
const delay2 = (ms, { value } = {}) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(value);
        }, ms);
    });
}
```

这样写，`Promise` 永远是成功。我们也需要失败。这时我们定义个参数 `willResolve` 来定义。

### 3.3 第三版 willResolve 参数决定成功还是失败。
#### 3.3.1 使用

```js
(async() => {
    try{
        const result = await delay3(1000, { value: '我是若川', willResolve: false });
        console.log('永远不会输出这句');
    }
    catch(err){
        console.log('输出结果', err);
    }
})();
```

#### 3.3.2 实现

加个 `willResolve` 参数决定成功还是失败。于是我们有了如下实现。

```js
const delay3 = (ms, {value, willResolve} = {}) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(willResolve){
                resolve(value);
            }
            else{
                reject(value);
            }
        }, ms);
    });
}
```

### 3.4 第四版 一定时间范围内随机获得结果

延时器的毫秒数是写死的。我们希望能够在一定时间范围内随机获取到结果。

#### 3.4.1 使用

```js
(async() => {
    try{
        const result = await delay4.reject(1000, { value: '我是若川', willResolve: false });
        console.log('永远不会输出这句');
    }
    catch(err){
        console.log('输出结果', err);
    }

    const result2 = await delay4.range(10, 20000, { value: '我是若川，range' });
    console.log('输出结果', result2);
})();
```

#### 3.4.2 实现

我们把成功 `delay` 和失败 `reject` 封装成一个函数，随机 `range` 单独封装成一个函数。

```js
const randomInteger = (minimum, maximum) => Math.floor((Math.random() * (maximum - minimum + 1)) + minimum);

const createDelay = ({willResolve}) => (ms, {value} = {}) => {
    return new Promise((relove, reject) => {
        setTimeout(() => {
            if(willResolve){
                relove(value);
            }
            else{
                reject(value);
            }
        }, ms);
    });
}

const createWithTimers = () => {
    const delay = createDelay({willResolve: true});
    delay.reject = createDelay({willResolve: false});
    delay.range = (minimum, maximum, options) => delay(randomInteger(minimum, maximum), options);
    return delay;
}
const delay4 = createWithTimers();
```

实现到这里，相对比较完善了。但我们可能有需要提前结束。
### 3.5 第五版 提前清除

#### 3.5.1 使用

```js
(async () => {
    const delayedPromise = delay5(1000, {value: '我是若川'});

    setTimeout(() => {
        delayedPromise.clear();
    }, 300);

    // 300 milliseconds later
    console.log(await delayedPromise);
    //=> '我是若川'
})();
```

#### 3.5.2 实现

声明 `settle`变量，封装 `settle` 函数，在调用 `delayPromise.clear` 时清除定时器。于是我们可以得到如下第五版的代码。

```js
const randomInteger = (minimum, maximum) => Math.floor((Math.random() * (maximum - minimum + 1)) + minimum);

const createDelay = ({willResolve}) => (ms, {value} = {}) => {
    let timeoutId;
    let settle;
    const delayPromise = new Promise((resolve, reject) => {
        settle = () => {
            if(willResolve){
                resolve(value);
            }
            else{
                reject(value);
            }
        }
        timeoutId = setTimeout(settle, ms);
    });

    delayPromise.clear = () => {
        clearTimeout(timeoutId);
		timeoutId = null;
		settle();
    };

    return delayPromise;
}

const createWithTimers = () => {
    const delay = createDelay({willResolve: true});
    delay.reject = createDelay({willResolve: false});
    delay.range = (minimum, maximum, options) => delay(randomInteger(minimum, maximum), options);
    return delay;
}
const delay5 = createWithTimers();
```

### 3.6 第六版 取消功能

我们查阅资料可以知道有 AbortController 可以实现取消功能。

[caniuse AbortController](https://caniuse.com/?search=AbortController)

[npm abort-controller](https://www.npmjs.com/package/abort-controller)

[mdn AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController/abort)

[fetch-abort](https://zh.javascript.info/fetch-abort)

[fetch#aborting-requests](https://github.com/github/fetch#aborting-requests)

[yet-another-abortcontroller-polyfill](https://www.npmjs.com/package/yet-another-abortcontroller-polyfill)

#### 3.6.1 使用

```js
(async () => {
    const abortController = new AbortController();

    setTimeout(() => {
        abortController.abort();
    }, 500);

    try {
        await delay6(1000, {signal: abortController.signal});
    } catch (error) {
        // 500 milliseconds later
        console.log(error.name)
        //=> 'AbortError'
    }
})();
```

#### 3.6.2 实现

```js
const randomInteger = (minimum, maximum) => Math.floor((Math.random() * (maximum - minimum + 1)) + minimum);

const createAbortError = () => {
	const error = new Error('Delay aborted');
	error.name = 'AbortError';
	return error;
};

const createDelay = ({willResolve}) => (ms, {value, signal} = {}) => {
    if (signal && signal.aborted) {
		return Promise.reject(createAbortError());
	}

    let timeoutId;
    let settle;
    let rejectFn;
    const signalListener = () => {
        clearTimeout(timeoutId);
        rejectFn(createAbortError());
    }
    const cleanup = () => {
		if (signal) {
			signal.removeEventListener('abort', signalListener);
		}
	};
    const delayPromise = new Promise((resolve, reject) => {
        settle = () => {
			cleanup();
			if (willResolve) {
				resolve(value);
			} else {
				reject(value);
			}
		};

        rejectFn = reject;
        timeoutId = setTimeout(settle, ms);
    });
    
    if (signal) {
		signal.addEventListener('abort', signalListener, {once: true});
	}

    delayPromise.clear = () => {
		clearTimeout(timeoutId);
		timeoutId = null;
		settle();
	};

    return delayPromise;
}

const createWithTimers = () => {
    const delay = createDelay({willResolve: true});
    delay.reject = createDelay({willResolve: false});
    delay.range = (minimum, maximum, options) => delay(randomInteger(minimum, maximum), options);
    return delay;
}
const delay6 = createWithTimers();
```

### 3.7 第七版 自定义 clearTimeout 和 setTimeout 函数


#### 3.7.1 使用

```js
const customDelay = delay7.createWithTimers({clearTimeout, setTimeout});

(async() => {
    const result = await customDelay(100, {value: '我是若川'});

    // Executed after 100 milliseconds
    console.log(result);
    //=> '我是若川'
})();
```

#### 3.7.2 实现

传递 clearTimeout, setTimeout 两个参数替代上一版本的`clearTimeout，setTimeout`。于是有了第七版。这也就是[delay]()的最终实现。

```js
const randomInteger = (minimum, maximum) => Math.floor((Math.random() * (maximum - minimum + 1)) + minimum);

const createAbortError = () => {
	const error = new Error('Delay aborted');
	error.name = 'AbortError';
	return error;
};

const createDelay = ({clearTimeout: defaultClear, setTimeout: set, willResolve}) => (ms, {value, signal} = {}) => {
    if (signal && signal.aborted) {
		return Promise.reject(createAbortError());
	}

    let timeoutId;
    let settle;
    let rejectFn;
    const clear = defaultClear || clearTimeout;

    const signalListener = () => {
        clear(timeoutId);
        rejectFn(createAbortError());
    }
    const cleanup = () => {
		if (signal) {
			signal.removeEventListener('abort', signalListener);
		}
	};
    const delayPromise = new Promise((resolve, reject) => {
        settle = () => {
			cleanup();
			if (willResolve) {
				resolve(value);
			} else {
				reject(value);
			}
		};

        rejectFn = reject;
        timeoutId = (set || setTimeout)(settle, ms);
    });
    
    if (signal) {
		signal.addEventListener('abort', signalListener, {once: true});
	}

    delayPromise.clear = () => {
		clear(timeoutId);
		timeoutId = null;
		settle();
	};

    return delayPromise;
}

const createWithTimers = clearAndSet => {
    const delay = createDelay({...clearAndSet, willResolve: true});
    delay.reject = createDelay({...clearAndSet, willResolve: false});
    delay.range = (minimum, maximum, options) => delay(randomInteger(minimum, maximum), options);
    return delay;
}
const delay7 = createWithTimers();
delay7.createWithTimers = createWithTimers;
```

## 4. axios 取消请求

`axios`取消原理是：通过传递 `config` 配置 `cancelToken` 的形式，来取消的。判断有传`cancelToken`，在 `promise` 链式调用的 `dispatchRequest` 抛出错误，在 `adapter` 中 `request.abort()` 取消请求，使 `promise` 走向 `rejected`，被用户捕获取消信息。

更多查看我的 `axios` 源码文章取消模块 [学习 axios 源码整体架构，取消模块](https://juejin.cn/post/6844904019987529735#heading-26)
## 5. 总结

我们从零开始实现了一个带取消功能比较完善的延迟函数。也就是 [delay 70多行源码](https://github.com/sindresorhus/delay/blob/main/index.js)的实现。

包含支持随机时间结束、提前清除、取消、自定义 `clearTimeout、setTimeout`等功能。

取消使用了 [mdn AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController/abort) ，由于兼容性不太好，社区也有了相应的 [npm abort-controller](https://www.npmjs.com/package/abort-controller) 实现 `polyfill`。

[yet-another-abortcontroller-polyfill](https://www.npmjs.com/package/yet-another-abortcontroller-polyfill)

建议克隆项目启动服务调试例子，印象会更加深刻。

```bash
# 推荐克隆我的项目，保证与文章同步
git clone https://github.com/lxchuan12/delay-analysis.git
cd delay-analysis
# 我写的例子都在 examples 这个文件夹中，可以启动服务本地查看调试
npx http-server examples
# 打开 http://localhost:8080
```

最后可以持续关注我@若川。欢迎加我微信 [ruochuan12](https://juejin.cn/pin/7005372623400435725) 交流，参与 [源码共读](https://juejin.cn/pin/7005372623400435725) 活动，每周大家一起学习200行左右的源码，共同进步。
