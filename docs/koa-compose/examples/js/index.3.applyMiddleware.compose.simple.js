/**
     * middleware
     * @author 若川
     * @date 2020-06-06 22:15:36
     * @link https://lxchuan12.cn
     */
function compose(...funcs) {
    if (funcs.length === 0) {
      return arg => arg
    }
  
    if (funcs.length === 1) {
      return funcs[0]
    }
    // 原来的源代码
    // return funcs.reduce((a, b) => (...args) => a(b(...args)))
    // 我改成普通函数便于理解
    return funcs.reduce(function(preFnA, itemFnB){
      return function (...args) {
          return preFnA(itemFnB(...args));
      }
  });
}

function applyMiddleware(...middlewares){
    const store = {  
        getState: function(){
            console.log('getState');
            return 0;
        },
        dispatch: function(action){
            console.log('dispatch---action', action);
            return action;
        }
    }
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
}
    
var store = applyMiddleware(logger1, logger2, logger3);
