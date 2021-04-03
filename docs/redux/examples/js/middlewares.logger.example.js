/**
     * middleware
     * @author 若川
     * @date 2020-06-06
     * @link https://lxchuan12.cn
     */

function logger1({ getState }) {
  return next => action => {
      console.log('will dispatch--1--next, action:', next, action)

      // Call the next dispatch method in the middleware chain.
      const returnValue = next(action)

      console.log('state after dispatch--1', getState())

      // This will likely be the action itself, unless
      // a middleware further in chain changed it.
      return returnValue
  }
}

function logger2({ getState }) {
  return function (next){
      return function (action){
          console.log('will dispatch--2--next, action:', next, action)

          // Call the next dispatch method in the middleware chain.
          const returnValue = next(action)

          console.log('state after dispatch--2', getState())

          // This will likely be the action itself, unless
          // a middleware further in chain changed it.
          return returnValue
      }
  }
}

function logger3({ getState }) {
  return function (next){
      return function (action){
          console.log('will dispatch--3--next, action:', next, action)

          // Call the next dispatch method in the middleware chain.
          const returnValue = next(action)

          console.log('state after dispatch--3', getState())

          // This will likely be the action itself, unless
          // a middleware further in chain changed it.
          return returnValue
      }
  }
}