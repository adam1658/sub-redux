import * as React from 'react';
import { useStore } from 'react-redux';
import { Middleware } from 'redux';
import { getId, actions } from './actions';
import { getSubStore, SubReduxStore } from './subStore';
import { SubReducer, SubState } from './types';

export function useSubRedux({
  initial,
  reducer,
  middlewares,
}: {
  initial?: SubState;
  reducer: SubReducer;
  middlewares?: Middleware[];
}): SubReduxStore {
  const store = useStore();

  const instance = React.useMemo(() => getId(), []);

  // Dispatch init action during first render (not during useEffect).
  React.useMemo(() => {
    store.dispatch(actions.init({ instance, initial, reducer, middlewares }));
  }, []);

  // Dispatch destroy action on unmount
  React.useEffect(() => {
    return () => {
      store.dispatch(actions.destroy({ instance }));
    };
  }, []);

  return getSubStore(instance, store);
}
