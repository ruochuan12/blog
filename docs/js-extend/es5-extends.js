// ES5 实现ES6 extends的例子
function Parent(name){
    this.name = name;
}
Parent.sayHello = function(){
    console.log('hello');
}
Parent.prototype.sayName = function(){
    console.log('my name is ' + this.name);
    return this.name;
}

function Child(name, age){
    // 相当于super
    Parent.call(this, name);
    this.age = age;
}
// new
function object(){
    function F() {}
    F.prototype = proto;
    return new F();
}
function _inherits(Child, Parent){
    // Object.create
    Child.prototype = Object.create(Parent.prototype);
    // __proto__
    // Child.prototype.__proto__ = Parent.prototype;
    Child.prototype.constructor = Child;
    // ES6
    // Object.setPrototypeOf(Child, Parent);
    // __proto__
    Child.__proto__ = Parent;
}
_inherits(Child,  Parent);
Child.prototype.sayAge = function(){
    console.log('my age is ' + this.age);
    return this.age;
}
var parent = new Parent('Parent');
var child = new Child('Child', 18);
console.log('parent: ', parent); // parent:  Parent {name: "Parent"}
Parent.sayHello(); // hello
parent.sayName(); // my name is Parent
console.log('child: ', child); // child:  Child {name: "Child", age: 18}
Child.sayHello(); // hello
child.sayName(); // my name is Child
child.sayAge(); // my age is 18