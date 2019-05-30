import { wrapSubAction } from './actions';
import { MiddlewareAPI, Store } from 'redux';

export function getSubMiddlewareApi(
  instance: string,
  store: MiddlewareAPI,
): MiddlewareAPI {
  return {
    dispatch: subAction => {
      store.dispatch(wrapSubAction({ instance, subAction }));
      return subAction;
    },
    getState: () => store.getState().subRedux[instance].state,
  };
}

export type SubReduxStore = Store & {
  isSubReduxStore: true;
  subReduxInstance: string;
};
export function getSubStore(instance: string, store: Store): SubReduxStore {
  return {
    ...getSubMiddlewareApi(instance, store),
    subscribe: subscriber => store.subscribe(subscriber),
    replaceReducer() {
      throw new Error('subredux subStore does not support replaceReducer');
    },

    isSubReduxStore: true,
    subReduxInstance: instance,
  };
}
