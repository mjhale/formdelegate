import thunk from 'redux-thunk';
import { applyMiddleware, compose, createStore } from 'redux';
import { createResponsiveStoreEnhancer } from 'redux-responsive';

import api from 'middleware/api';
import reducer from 'reducers';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducer,
  composeEnhancers(createResponsiveStoreEnhancer(), applyMiddleware(thunk, api))
);

export default store;
