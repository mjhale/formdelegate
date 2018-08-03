import React from 'react';
import ReactDOM from 'react-dom';
import { injectGlobal } from 'styled-components';
import { normalize } from 'polished';
import { Provider } from 'react-redux';

import theme from 'constants/theme';
import store from 'store';
import { RootRouter } from 'router';

injectGlobal`
  ${normalize()}

  body {
    background-color: ${theme.backgroundColor};
    font-family: ${theme.systemFont};
    overflow-x: hidden;
    padding: 0;
    position: relative;
  }
`;

ReactDOM.render(
  <Provider store={store}>
    <RootRouter />
  </Provider>,
  document.getElementById('root')
);
