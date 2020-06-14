const multiply = (x) => {
    const result = x * 10;
    console.log(result);
    return result;
 };
 const add = (y) => y + 10;
 const minus = (z) => z - 2;
 
 // 计算结果
 console.log(minus(add(multiply(10))));
 // 100
 // 108
 // 这样我们就把三个函数计算结果出来了。