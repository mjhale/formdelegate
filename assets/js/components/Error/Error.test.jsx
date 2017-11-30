import React from 'react';
import { shallow } from 'enzyme';
import Error from '.';

describe('<Error />', () => {
  it('renders its given content', () => {
    const wrapper = shallow(<Error />);
    expect(wrapper.text()).toEqual(
      'There was an unknown error, please try again.'
    );
  });
});
