```
var staticMethods = [];
for(var name in _.prototype){
	staticMethods.push(name);
}
console.log(staticMethods); // ["after", "all", "allKeys", "any", "assign", "before", "bind", "bindAll", "chain", "chunk", "clone", "collect", "compact", "compose", "constant", "contains", ...]
```

```
var prototypeMethods = [];
for(var name in _.prototype){
	prototypeMethods.push(name);
}
console.log(prototypeMethods); // ["after", "all", "allKeys", "any", "assign", "before", "bind", "bindAll", "chain", "chunk", "clone", "collect", "compact", "compose", "constant", "contains", ...] 152个
```


### 推荐阅读

[underscorejs.org 官网](https://underscorejs.org/)
[undersercore-analysis](https://yoyoyohamapi.gitbooks.io/undersercore-analysis/content/)
[underscore 系列之如何写自己的 underscore](https://juejin.im/post/5a0bae515188252964213855)
