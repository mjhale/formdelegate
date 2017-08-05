import 'phoenix_html';
import React from 'react';
import ReactDOM from 'react-dom';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import { flowRight as compose } from 'lodash';
import { Provider } from 'react-redux';
import { RootRouter } from './router';
import api from './middleware/api';
import thunk from 'redux-thunk';
import reducer from './reducers';

const middlewares = [thunk, api];
if (process.env.NODE_ENV !== 'production') {
  const logger = createLogger();

  middlewares.push(logger);
}
const store = compose(applyMiddleware(...middlewares))(createStore)(reducer);

ReactDOM.render(
  <Provider store={store}>
    <RootRouter />
  </Provider>,
  document.getElementById('root')
);
