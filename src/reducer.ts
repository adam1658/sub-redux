import { Action as ReduxAction } from 'redux';
import { isDestroyAction, isInitAction, isSubAction } from './actions';
import { unwrapSubAction } from './actionHelpers';
import { SubReducer, SubState } from './types';

export type State = Readonly<
  Record<string, { state: SubState; reducer: SubReducer }>
>;

export function reducer(state: State = {}, action: ReduxAction) {
  if (isInitAction(action)) {
    return {
      ...state,
      [action.payload.instance]: {
        state: action.payload.initial,
        reducer: action.meta.reducer,
      },
    };
  }

  if (isSubAction(action)) {
    const { instance, subAction } = unwrapSubAction(action);
    const slice = state[instance];
    return {
      ...state,
      [instance]: {
        ...state[instance],
        state: slice.reducer(slice.state, subAction),
      },
    };
  }

  if (isDestroyAction(action)) {
    const newState = { ...state };
    delete newState[action.payload.instance];
    return newState;
  }

  return state;
}
