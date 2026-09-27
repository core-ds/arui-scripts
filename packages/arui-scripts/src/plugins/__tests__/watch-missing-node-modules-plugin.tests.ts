import { type Compiler } from '@rspack/core';

import { WatchMissingNodeModulesPlugin } from '../watch-missing-node-modules-plugin';

describe('watch dependencies installed during development', () => {
    test.each([
        [['/app/node_modules/new-package/index.js'], true],
        [['/app/src/missing.ts'], false],
        [[], false],
    ] as const)('missing dependencies %j', (missing, shouldWatch) => {
        const tap = jest.fn();
        const compiler = { hooks: { emit: { tap } } };

        new WatchMissingNodeModulesPlugin('/app/node_modules').apply(
            compiler as unknown as Compiler,
        );
        const compilation = {
            missingDependencies: new Set(missing),
            contextDependencies: new Set(['/app/src']),
        };

        tap.mock.calls[0][1](compilation);
        expect(compilation.contextDependencies.has('/app/node_modules')).toBe(shouldWatch);
        expect(compilation.contextDependencies.has('/app/src')).toBe(true);
    });
});
