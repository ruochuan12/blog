# jQuery 源码学习 - 整体架构

### 匿名自执行函数
```

```

### 无 new 改造

```
var Student = function(){

}

Student.prototype.study  = function(){
    console.log('study');
}

var student = new Student();
student.study();
```

```
 jQuery = function( selector, context ) {

    // The jQuery object is actually just the init constructor 'enhanced'
    // Need init if jQuery is called (just allow error to be thrown if not included)
    return new jQuery.prototype.init( selector, context );
}

jQuery.prototype.init = function( selector, context, root ) {
        root = root || rootjQuery;
		return jQuery.makeArray( selector, this );
	};

jQuery.fn.init = function( selector, context, root ) {
        root = root || rootjQuery;
		return jQuery.makeArray( selector, this );
	};

```