import { Middleware, Dispatch, MiddlewareAPI, compose } from 'redux';
import { Action, wrapSubAction, unwrapSubAction, isSubAction } from './actions';
import { getSubMiddlewareApi } from './subStore';

export const middleware: Middleware = store => {
  const chains: Record<string, ReturnType<Middleware>> = {};
  return next => (action: Action) => {
    if (action.type === 'SUB_REDUX/INIT') {
      chains[action.payload.instance] = applySubMiddleware(
        store,
        action.payload.instance,
        action.meta.middlewares,
      );
    }

    if (action.type === 'SUB_REDUX/DESTROY') {
      delete chains[action.payload.instance];
    }

    if (isSubAction(action)) {
      // Insert the middleware chain for this sub-instance between this
      // middleware and next. HOWEVER, the sub-chain needs the unwrapped action,
      // then we need to rewrap it before passing it on to the next middleware

      const { instance, subAction } = unwrapSubAction(action);
      const nextWithRewrapped: any = (subAction: any) =>
        next(wrapSubAction({ instance, subAction }));

      return chains[instance](nextWithRewrapped)(subAction);
    }

    return next(action);
  };
};

// Inspired by redux's applyMiddleware.
function applySubMiddleware(
  store: MiddlewareAPI,
  instance: string,
  middlewares: Middleware[],
): ReturnType<Middleware> {
  const subStore = getSubMiddlewareApi(instance, store);
  let dispatch: Dispatch = () => {
    throw new Error(
      'Dispatching while constructing your middleware is not allowed. ' +
        'Other middleware would not be applied to this dispatch.',
    );
  };

  const middlewareAPI: MiddlewareAPI = {
    getState: subStore.getState,
    dispatch: (...args) => dispatch(...args),
  };
  const chain = middlewares.map(m => m(middlewareAPI));

  dispatch = subAction => subStore.dispatch(subAction);
  return compose(...chain);
}
