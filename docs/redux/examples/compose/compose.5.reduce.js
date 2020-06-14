const compose = (...func) => {
    return func.reduce((a, b) => {
        return function(x){
            return a(b(x));
        }
    })
}
const calc = compose(minus, add, multiply);
console.log(calc(10));
  // 100
  // 108