
### 缓存

```js
let cache
let time = {}
if (options.cache) {
  const LRU = require('lru-cache')

  cache = new LRU({
    max: 500,
    length: function (n, key) { return n * 2 + key.length }
  })
}
```

### tryCache

```js
async function tryCache (key, checkUpdateTime = true) {
  const data = cache.get(key)

  if (checkUpdateTime) {
    const cacheUpdateTime = time[key]
    const fileUpdateTime = (await stat(path.resolve(root, key.replace(/^\//, '')))).mtime.getTime()
    if (cacheUpdateTime < fileUpdateTime) return null
  }

  return data
}
```

### cacheData

```js
function cacheData (key, data, updateTime) {
  const old = cache.peek(key)

  if (old != data) {
    cache.set(key, data)
    if (updateTime) time[key] = updateTime
    return true
  } else return false
}
```