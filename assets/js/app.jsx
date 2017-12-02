import 'phoenix_html';
import React from 'react';
import ReactDOM from 'react-dom';
import { injectGlobal } from 'styled-components';
import { Provider } from 'react-redux';
import { RootRouter } from 'router';
import theme from 'constants/theme';
import store from 'store';

injectGlobal`
  html,
  body {
    height: 100%;
    margin: 0;
  }

  body {
    background-color: ${theme.backgroundColor};
    font-family: ${theme.systemFont};
    font-size: 1rem;
    overflow-x: hidden;
    padding: 0;
    position: relative;
  }

  h1, h2, h3 {
    color: $header-font;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
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
    text-transform: uppercase;
  }

  input[type="text"],
  input[type="password"],
  select {
    border: 1px solid #CCC;
    box-sizing: border-box;
    display: block;
    margin: .25rem 0 .25rem 0;
    max-width: 20rem;
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
