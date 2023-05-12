import { shallow } from 'enzyme';
import React from 'react';
import { App } from 'Src/components/app';

describe('app', () => {
  it('should be match to snapshot', () => {
    expect(shallow(<App />)).toMatchSnapshot();
  });
});
