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
