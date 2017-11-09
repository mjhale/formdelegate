import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import App from '.';
import reducer from 'reducers';

it('renders without crashing', () => {
  let store = createStore(reducer);

  shallow(<App store={store} />);
});
