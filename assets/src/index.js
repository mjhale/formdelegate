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
    font-size: 1rem;
    overflow-x: hidden;
    padding: 0;
    position: relative;
  }

  h1, h2, h3 {
    font-weight: 300;
    word-wrap: break-word;
  }

  h1 {
    font-size: 1.5rem;
    line-height: 1.5;
    margin: 0 0 .5rem;
  }

  h2 {
    font-size: 1.2rem;
    line-height: 1.2;
    margin: .4rem 0;
  }

  h3 {
    font-size: 1.1rem;
    line-height: 1.2;
    margin: .4rem 0;
  }

  label {
    display: block;
    font-size: .8rem;
    padding-top: .1rem;
  }

  input[type="text"],
  input[type="password"],
  select,
  textarea {
    border: 1px solid ${theme.ghostGray};
    border-radius: 2px;
    box-shadow: 0 0 2px 0 #e8e8e8;
    box-sizing: border-box;
    display: block;
    margin: .25rem 0 .25rem 0;
    max-width: 22rem;
    padding: .4rem;
    width: 100%;

    &:disabled {
      background: linear-gradient(to bottom, #bfbfbf, #bbb9b9);
      cursor: not-allowed;
    }
  }
`;

ReactDOM.render(
  <Provider store={store}>
    <RootRouter />
  </Provider>,
  document.getElementById('root')
);
