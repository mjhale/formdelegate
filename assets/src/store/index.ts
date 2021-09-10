import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createResponsiveStoreEnhancer } from 'redux-responsive';
import * as React from 'react';
import thunkMiddleware from 'redux-thunk';

import apiMiddleware from 'middleware/api';
import reducers from 'reducers';

let store;

function initStore(initialState) {
  return createStore(
    reducers,
    initialState,
    composeWithDevTools(
      createResponsiveStoreEnhancer(),
      applyMiddleware(thunkMiddleware, apiMiddleware)
    )
  );
}

export const initializeStore = (preloadedState) => {
  let _store = store ?? initStore(preloadedState);

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({
      ...store.getState(),
      ...preloadedState,
    });

    // Reset the current store
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};

export function useStore(initialState) {
  const store = React.useMemo(
    () => initializeStore(initialState),
    [initialState]
  );

  return store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
