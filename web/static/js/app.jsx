import 'phoenix_html';
import React from 'react';
import ReactDOM from 'react-dom';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { RootRouter } from './router';
import api from './middleware/api';
import thunk from 'redux-thunk';
import reducer from './reducers';

const logger = createLogger();

const store = createStore(reducer, applyMiddleware(thunk, api, logger));

ReactDOM.render(
  <Provider store={store}>
    <RootRouter />
  </Provider>,
  document.getElementById('root')
);
