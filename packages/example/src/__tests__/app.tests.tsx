import React from 'react';
import { shallow } from 'enzyme';

import { App } from '#/components/app';

describe('app', () => {
    it('should be match to snapshot', () => {
        expect(shallow(<App />)).toMatchSnapshot();
    });
});
