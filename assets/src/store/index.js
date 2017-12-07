import thunk from 'redux-thunk';
import { applyMiddleware, compose, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import api from 'middleware/api';
import reducer from 'reducers';

const middlewares = [thunk, api];

if (process.env.NODE_ENV !== 'production') {
  const logger = createLogger();
  middlewares.push(logger);
}

const store = compose(applyMiddleware(...middlewares))(createStore)(reducer);

export default store;
