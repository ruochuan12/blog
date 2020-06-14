const compose = (f, g, h) => {
    return function(x){
      return f(g(h(x)));
    }
  }
  const calc = compose(minus, add, multiply);
  console.log(calc(10));
  // 100
  // 108