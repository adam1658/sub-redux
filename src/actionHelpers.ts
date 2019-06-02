import { Action } from 'typesafe-actions';
import { SubAction } from './types';

// Wrap / unwrap sub actions ***************************************************
export const wrapSubAction = ({
  instance,
  subAction,
}: {
  instance: string;
  subAction: SubAction;
}) => ({
  ...subAction,
  type: `SUB_REDUX/${instance}/${subAction.type}` as 'SUB_REDUX/x/SUB_ACTION',
});

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
