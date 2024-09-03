import type { Options } from '@swc/core';

import applyOverrides from './util/apply-overrides';
import { configs } from './app-configs';

const swcConfig: Options = {
    env: { coreJs: '3', mode: 'entry' },
    jsc: {
        parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: true,
        },
        loose: true,
        transform: {
            legacyDecorator: true,
            react: {
                runtime: 'automatic',
            },
        },
        experimental: configs.collectCoverage
            ? {
                plugins: [
                    ['swc-plugin-coverage-instrument', {}],
                ],
            }
            : {},
    },
};

export const swcClientConfig = applyOverrides(['swc', 'swcClient'], swcConfig);

export const swcServerConfig = applyOverrides(['swc', 'swcServer'], swcConfig);
