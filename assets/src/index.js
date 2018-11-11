import React from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components/macro';
import { normalize } from 'polished';
import { Provider } from 'react-redux';

import theme from 'constants/theme';
import store from 'store';
import { RootRouter } from 'router';

const GlobalStyle = createGlobalStyle`
  ${normalize()}

  body {
    background-color: ${theme.backgroundColor};
    font-family: ${theme.systemFont};
    overflow-x: hidden;
    padding: 0;
  }
`;

ReactDOM.render(
  <Provider store={store}>
    <React.Fragment>
      <GlobalStyle />
      <RootRouter />
    </React.Fragment>
  </Provider>,
  document.getElementById('root')
);
