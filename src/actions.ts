import { Action as ReduxAction, Middleware } from 'redux';
import {
  ActionType,
  createCustomAction,
  createStandardAction,
} from 'typesafe-actions';
import { wrapSubAction } from './actionHelpers';
import { SubReducer, SubState } from './types';

// Actions *********************************************************************
let nextId = 1;
export const getId = () => (nextId++).toString(36);

export const actions = {
  init: createStandardAction('SUB_REDUX/INIT').map(
    ({
      instance,
      initial,
      reducer,
      middlewares = [],
    }: {
      instance: string;
      initial?: SubState;
      reducer: SubReducer;
      middlewares?: Middleware[];
    }) => ({
      payload: { instance, initial },
      meta: { reducer, middlewares },
    }),
  ),

  subAction: createCustomAction('SUB_REDUX/x/SUB_ACTION', () => wrapSubAction),

  destroy: createStandardAction('SUB_REDUX/DESTROY')<{ instance: string }>(),
};

export type Action = ActionType<typeof actions>;

// Subaction helpers ***********************************************************
export const isInitAction = (
  action: ReduxAction,
): action is ReturnType<typeof actions.init> =>
  action.type === 'SUB_REDUX/INIT';

export const isSubAction = (
  action: ReduxAction,
): action is ReturnType<typeof actions.subAction> =>
  !!action.type.match(/^SUB_REDUX\/([0-9a-zA-Z]+)\/(.*)$/);

export const isDestroyAction = (
  action: ReduxAction,
): action is ReturnType<typeof actions.destroy> =>
  action.type === 'SUB_REDUX/DESTROY';
