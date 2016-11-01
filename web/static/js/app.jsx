import 'phoenix_html';
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import reducer from './reducers/index';
import { RootRouter } from './router';

const logger = createLogger();

const store = createStore(
  reducer,
  applyMiddleware(
    thunk,
    logger
  )
);

const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <RootRouter history={history} />
  </Provider>,
  document.getElementById('root'));
