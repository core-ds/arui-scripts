import { type Configuration } from '@rspack/core';

import { findLoader } from '../find-loader';

describe('findLoader for overrides', () => {
    test.each([{}, { module: {} }, { module: { rules: [] } }])(
        'returns undefined for missing rules: %j',
        (config) => {
            expect(findLoader(config, /\.css$/.toString())).toBeUndefined();
        },
    );

    test('skips placeholders and returns the actual matching rule', () => {
        const css = { test: /\.css$/, use: ['style-loader'] };
        const config: Configuration = {
            module: { rules: [false, null, undefined, '...', { test: /\.js$/ }, css] },
        };

        expect(findLoader(config, /\.css$/.toString())).toBe(css);
        expect(findLoader(config, /\.svg$/.toString())).toBeUndefined();
    });

    test('finds a loader in oneOf and preserves first-match order', () => {
        const css = { test: /\.css$/, loader: 'css-loader' };
        const config: Configuration = {
            module: { rules: [{ oneOf: [false, {}, css] }, { test: /\.css$/ }] },
        };

        expect(findLoader(config, /\.css$/.toString())).toBe(css);
    });
});
