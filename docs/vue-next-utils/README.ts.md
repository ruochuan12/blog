---
theme: smartblue
highlight: dracula
---

# Vue3 中 那些使用的工具函数

### babelParserDefaultPlugins

```ts
export const babelParserDefaultPlugins = [
  'bigInt',
  'optionalChaining',
  'nullishCoalescingOperator'
] as const
```

### EMPTY_OBJ 空对象

```ts
export const EMPTY_OBJ: { readonly [key: string]: any } = __DEV__
  ? Object.freeze({})
  : {}
```

### EMPTY_ARR  空数组

```ts
export const EMPTY_ARR = __DEV__ ? Object.freeze([]) : []
```

### NOOP 空函数

```ts
export const NOOP = () => {}
```

### NO 永远返回 false 的函数

```ts
/**
 * Always return false.
 */
export const NO = () => false
```

### isOn 判断字符串是不是 on 开头

```ts
const onRE = /^on[^a-z]/
export const isOn = (key: string) => onRE.test(key)
```

### isModelListener

```ts
export const isModelListener = (key: string) => key.startsWith('onUpdate:')
```

### extend 继承

```ts
export const extend = Object.assign
```

### remove 移除数组的一项

```ts
export const remove = <T>(arr: T[], el: T) => {
  const i = arr.indexOf(el)
  if (i > -1) {
    arr.splice(i, 1)
  }
}
```

### hasOwn 是不是自己本身所拥有的属性

```ts
const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)
```

### isArray 判断数组

```ts
export const isArray = Array.isArray
```

### isMap 判断是不是 Map 对象

```ts
export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]'
```

### isSet 判断是不是 Set 对象

```ts
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === '[object Set]'
```

### isDate 判断是不是 Date 对象

```ts
export const isDate = (val: unknown): val is Date => val instanceof Date
```

### isFunction 判断是不是函数

```ts
export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'
```

### isString 判断是不是字符串

```ts
export const isString = (val: unknown): val is string => typeof val === 'string'
```

### isSymbol 判断是不是 Symbol

```ts
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
```

### isObject 判断是不是对象

```ts
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'
```

### isPromise 判断是不是 Promise

```ts
export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}
```

### objectToString 对象转字符串

```ts
export const objectToString = Object.prototype.toString
```

### toTypeString  对象转字符串

```ts
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)
```

### toRawType  对象转字符串 截取后几位

```ts
export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}
```

### isPlainObject 判断是不是纯粹的对象

```ts
export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === '[object Object]'
```

### isIntegerKey 判断是不是

```ts
export const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key
```

### isReservedProp

```ts
export const isReservedProp = /*#__PURE__*/ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ',key,ref,' +
    'onVnodeBeforeMount,onVnodeMounted,' +
    'onVnodeBeforeUpdate,onVnodeUpdated,' +
    'onVnodeBeforeUnmount,onVnodeUnmounted'
)
```

### cacheStringFunction 缓存

```ts
const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
  const cache: Record<string, string> = Object.create(null)
  return ((str: string) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }) as any
}

const camelizeRE = /-(\w)/g
/**
 * @private
 */
export const camelize = cacheStringFunction(
  (str: string): string => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
  }
)

const hyphenateRE = /\B([A-Z])/g
/**
 * @private
 */
export const hyphenate = cacheStringFunction((str: string) =>
  str.replace(hyphenateRE, '-$1').toLowerCase()
)

/**
 * @private
 */
export const capitalize = cacheStringFunction(
  (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
)

/**
 * @private
 */
export const toHandlerKey = cacheStringFunction(
  (str: string) => (str ? `on${capitalize(str)}` : ``)
)
```

### hasChanged 判断是不是有变化

```ts
// compare whether a value has changed, accounting for NaN.
export const hasChanged = (value: any, oldValue: any): boolean =>
  value !== oldValue && (value === value || oldValue === oldValue)
```

### invokeArrayFns  执行数组里的函数

```ts
export const invokeArrayFns = (fns: Function[], arg?: any) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg)
  }
}
```

### def 定义

```ts
export const def = (obj: object, key: string | symbol, value: any) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  })
}
```

### toNumber 转数字

```ts
export const toNumber = (val: any): any => {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}
```

### getGlobalThis 全局对象

```ts
let _globalThis: any
export const getGlobalThis = (): any => {
  return (
    _globalThis ||
    (_globalThis =
      typeof globalThis !== 'undefined'
        ? globalThis
        : typeof self !== 'undefined'
          ? self
          : typeof window !== 'undefined'
            ? window
            : typeof global !== 'undefined'
              ? global
              : {})
  )
}
```
