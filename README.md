# SubRedux

[![npm version](https://img.shields.io/npm/v/sub-redux.svg)](https://www.npmjs.com/package/sub-redux)
[![npm](https://img.shields.io/npm/dm/sub-redux.svg)](https://www.npmjs.com/package/sub-redux)

`sub-redux` is a library that allows you to dynamically create, use and destroy
multiple isolated redux 'sub-apps'.

# Getting started

## Install

```sh
$ npm install --save sub-redux
```

or

```sh
$ yarn add sub-redux
```

## Usage Example

Include the SubRedux reducer and middleware in your main store:

```javascript
import { applyMiddleware, combineReducers, createStore } from 'redux';
import {
  middleware as subReduxMiddleware,
  reducer as subReduxReducer,
} from 'sub-redux';

const rootReducer = combineReducers({
  subRedux: subReduxReducer,
  ...otherStateSlices,
});

const store = createStore(rootReducer, applyMiddleware(subReduxMiddleware));
```

### Using a subStore

```javascript
import createSagaMiddleware from 'redux-saga';
import { delay, put, takeEvery } from 'redux-saga/effects';
import { actions, getId, getSubStore } from 'sub-redux';

// Create it by dispatching an init action:
const instance = getId();

const sagaMiddleware = createSagaMiddleware();

store.dispatch(
  actions.init({
    instance,
    initial: { count: 0 },
    reducer: (state, action) => {
      switch (action.type) {
        case 'INCREMENT':
          return { count: state.count + 1 };
        default:
          return state;
      }
    },
    middleware: [sagaMiddleware],
  }),
);

const task = sagaMiddleware.run(function*() {
  yield takeEvery('INCREMENT_LATER', function*() {
    yield delay(3000);
    yield put({ type: 'INCREMENT' });
  });
});

const subStore = getSubStore(instance, store);

// Use it
subStore.getState();
subStore.dispatch({ type: 'INCREMENT_LATER' });

//The above is equivalent to:
store.getState().subRedux[instance].state;
store.dispatch({ type: `SUB_REDUX/${instance}/INCREMENT_LATER` });

// Destroy it once you're done
task.cancel();
store.dispatch(actions.destroy({ instance }));
```

## How it works

Dispatching the `actions.init({ instance, initial, reducer, middleware })`
action, two things happen:

- Your initial state and the reducer are stored in the main store's state as
  `subRedux[instance].state` and `subRedux[instance].reducer`
- The SubRedux middleware will take your provided middleware and build a chain
  out of it.

Once a subStore is initialised you can create a wrapper for it with
`getSubStore(instance, store)`. Calling `getState()` on the subStore returns you
that state's store, and calling `dispatch(action)` on it will wrap that action
and dispatch it against the main store. Whenever a `SUB_REDUX/${n}/${action}` is
dispatched against the main store, subStore `n` will reduce and apply
middlewares accordingly.

When you're finished with your subStore, dispatching
`actions.destroy({ instance })` against the main store will destroy it's state,
reducer and middleware.

## React usage

Higher up in your component tree:

```javascript
import { Provider } from 'react-redux';

<Provider store={yourMainStore}>
  <YourApp />
</Provider>;
```

Your component in which you wish to create a subStore:

```javascript
function MyComponent() {
  const sagaMiddleware = React.useMemo(
    () => createSagaMiddleware(),
    [], // Only ever create the one
  );

  const subStore = useSubRedux({
    initial,
    reducer,
    middlewares: [sagaMiddleware],
  });

  React.useEffect(() => {
    const task = sagaMiddleware.run(saga);
    return () => task.cancel(); // cancel on unmount
  }, [sagaMiddleware]);

  return (
    <Provider store={subStore}>
      <p>
        Any react-redux code below here in the React tree will use the subStore,
        rather than the main store.
      </p>
    </Provider>
  );
}
```

### Accessing the main store in a context that is using a subStore

If you need to access the main store in a React subtree that uses a subStore,
try the following:

```javascript
import { ParentProvider } from 'sub-redux';

function MyComponentInContextOfSubStore() {
  return (
    <>
      <ThisComponentCanAccessTheSubStore />
      <ParentProvider>
        <ThisComponentCanAccessTheMainStore />
      </ParentProvider>
    </>
  );
}
```

`ParentProvider` accesses the `subStore.parentStore`, then renders a new
Provider with parent store - anything below that will use the parent store.
