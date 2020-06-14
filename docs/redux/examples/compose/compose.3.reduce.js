// 我们常用reduce来计算数值数组的总和
[1,2,3,4,5].reduce((pre, item, index, arr) => {
    console.log('(pre, item, index, arr)', pre, item, index, arr);
    // (pre, item, index, arr) 1 2 1 (5) [1, 2, 3, 4, 5]
    // (pre, item, index, arr) 3 3 2 (5) [1, 2, 3, 4, 5]
    // (pre, item, index, arr) 6 4 3 (5) [1, 2, 3, 4, 5]
    // (pre, item, index, arr) 10 5 4 (5) [1, 2, 3, 4, 5]
    return pre + item;
  });
  // 15