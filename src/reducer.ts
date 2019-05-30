import { Action, isSubAction, unwrapSubAction } from './actions';
import { SubReducer, SubState } from './types';

export type State = Readonly<
  Record<string, { state: SubState; reducer: SubReducer }>
>;

export function reducer(state: State = {}, action: Action) {
  if (action.type === 'SUB_REDUX/INIT') {
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

  if (action.type === 'SUB_REDUX/DESTROY') {
    const newState = { ...state };
    delete newState[action.payload.instance];
    return newState;
  }

  return state;
}
