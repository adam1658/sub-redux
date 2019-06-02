import * as React from 'react';
import { Provider, useStore } from 'react-redux';
import { SubReduxStore } from './subStore';

export const ParentProvider: React.FunctionComponent = props => {
  const subStore = useStore() as SubReduxStore;
  return <Provider {...props} store={subStore.parentStore} />;
};
