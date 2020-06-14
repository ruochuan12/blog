/**
 * https://github.com/reduxjs/redux-thunk/blob/master/src/index.js
 * @author 若川
 * @date 2020-06-06
 * @link https://lxchuan12.cn
 */
function createThunkMiddleware(extraArgument) {
    return ({ dispatch, getState }) => (next) => (action) => {
        if (typeof action === 'function') {
            return action(dispatch, getState, extraArgument);
        }

        return next(action);
    };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;