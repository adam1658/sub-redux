import { Middleware } from 'redux';
import {
  ActionType,
  createCustomAction,
  createStandardAction,
} from 'typesafe-actions';
import { SubAction, SubReducer, SubState } from './types';

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

  subAction: createCustomAction(
    'SUB_REDUX/SUB_ACTION',
    () => ({
      instance,
      subAction,
    }: {
      instance: string;
      subAction: SubAction;
    }) => ({
      ...subAction,
      type: `SUB_REDUX/${instance}/${subAction.type}` as 'SUB_REDUX/SUB_ACTION',
    }),
  ),

  destroy: createStandardAction('SUB_REDUX/DESTROY')<{ instance: string }>(),
};

export type Action = ActionType<typeof actions>;

// Subaction helpers ***********************************************************
export const isSubAction = (
  action: SubAction,
): action is ReturnType<typeof actions.subAction> =>
  !!action.type.match(/^SUB_REDUX\/([0-9a-zA-Z]+)\/(.*)$/);

export const wrapSubAction = actions.subAction;
export const unwrapSubAction = (
  action: Action,
): { instance: string; subAction: SubAction } => {
  const match = action.type.match(/^SUB_REDUX\/([0-9a-zA-Z]+)\/(.*)$/);

  if (!match) {
    throw new Error('Invalid action for unwrapSubAction');
  }

  const [, instance, subType] = match;

  return {
    instance,
    subAction: {
      ...action,
      type: subType,
    },
  };
};
