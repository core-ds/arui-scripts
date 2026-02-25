import React from 'react';
import { shallow } from 'enzyme';

import { App } from '#/components/app';

describe('app', () => {
    it('should render root layout', () => {
        const wrapper = shallow(<App />);

        expect(wrapper.type()).toBe('div');
        expect(wrapper.isEmptyRender()).toBe(false);
    });
});
