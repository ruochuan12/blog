// const multiply = (x) => {
//     const result = x * 10;
//     console.log(result);
//     return result;
//  };
//  const add = (y) => y + 10;
//  const minus = (z) => z - 2;
 
//  // 计算结果
//  console.log(minus(add(multiply(10))));
 // 100
 // 108
 // 这样我们就把三个函数计算结果出来了。

const multiply = (next) => {
    return action => {
        console.log('multiply');
        action.num  = action.num * 10;
        const returnValue = next(action);
        return returnValue;
    }
}

const add = (next) => {
    return action => {
        console.log('add');
        action.num  = action.num + 10;
        const returnValue = next(action);
        return returnValue;
    }
}

const minus = (next) => {
    return action => {
        console.log('minus');
        action.num  = action.num - 2;
        const returnValue = next(action);
        return returnValue;
    }
}
