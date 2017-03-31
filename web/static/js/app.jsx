import 'phoenix_html';
import createLogger from 'redux-logger';
import React from 'react';
import ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';

import api from './middleware/api';
import reducer from './reducers';
import { RootRouter } from './router';

const logger = createLogger();
const store = createStore(
  reducer,
  applyMiddleware(
    thunk,
    api,
    logger
  )
);
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <RootRouter history={history} />
  </Provider>,
  document.getElementById('root')
);
