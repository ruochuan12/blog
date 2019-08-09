// 对转换后的代码进行了简要的注释
"use strict";
// 主要是对当前环境支持Symbol和不支持Symbol的typeof处理
function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof(obj) {
            return typeof obj;
        };
    } else {
        _typeof = function _typeof(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
    }
    return _typeof(obj);
}
// _possibleConstructorReturn 判断Parent。call(this, name)函数返回值 是否为null或者函数或者对象。
function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
        return call;
    }
    return _assertThisInitialized(self);
}
// 如何 self 是void 0 （undefined） 则报错
function _assertThisInitialized(self) {
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}
// 获取__proto__
function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
}
// 寄生组合式继承的核心
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    // Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__。 
    // 也就是说执行后 subClass.prototype.__proto__ === superClass.prototype; 这条语句为true
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
}
// 设置__proto__
function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _setPrototypeOf(o, p);
}
// instanceof操作符包含对Symbol的处理
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}

function _classCallCheck(instance, Constructor) {
    if (!_instanceof(instance, Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
// 按照它们的属性描述符 把方法和静态属性赋值到构造函数的prototype和构造器函数上
function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
// 把方法和静态属性赋值到构造函数的prototype和构造器函数上
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}

// ES6
var Parent = function () {
    function Parent(name) {
        _classCallCheck(this, Parent);
        this.name = name;
    }
    _createClass(Parent, [{
        key: "sayName",
        value: function sayName() {
            console.log('my name is ' + this.name);
            return this.name;
        }
    }], [{
        key: "sayHello",
        value: function sayHello() {
            console.log('hello');
        }
    }]);
    return Parent;
}();

var Child = function (_Parent) {
    _inherits(Child, _Parent);
    function Child(name, age) {
        var _this;
        _classCallCheck(this, Child);
        // Child.__proto__ => Parent
        // 所以也就是相当于Parent.call(this, name); 是super(name)的一种转换
        // _possibleConstructorReturn 判断Parent.call(this, name)函数返回值 是否为null或者函数或者对象。
        _this = _possibleConstructorReturn(this, _getPrototypeOf(Child).call(this, name));
        _this.age = age;
        return _this;
    }
    _createClass(Child, [{
        key: "sayAge",
        value: function sayAge() {
            console.log('my age is ' + this.age);
            return this.age;
        }
    }]);
    return Child;
}(Parent);

var parent = new Parent('Parent');
var child = new Child('Child', 18);
console.log('parent: ', parent); // parent:  Parent {name: "Parent"}
Parent.sayHello(); // hello
parent.sayName(); // my name is Parent
console.log('child: ', child); // child:  Child {name: "Child", age: 18}
Child.sayHello(); // hello
child.sayName(); // my name is Child
child.sayAge(); // my age is 18