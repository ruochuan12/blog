// 写一个请求简版请求
function request(ms= 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({name: '若川'});
    }, ms);
  });
}
