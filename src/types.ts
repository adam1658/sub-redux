import { Action as ReduxAction, Reducer } from 'redux';

export type SubState = any;
export type SubAction = ReduxAction;
export type SubReducer = Reducer<SubState, SubAction>;
