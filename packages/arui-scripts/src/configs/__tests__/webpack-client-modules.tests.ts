import { type Configuration } from '@rspack/core';

import { configs } from '../app-configs';
import { MODULES_SEPARATE_BUILD_NAME } from '../modules';
import { createClientWebpackConfig } from '../rspack.client';

describe('client webpack config for modules', () => {
    const originalModules = configs.modules;
    const originalNormalizedName = configs.normalizedName;

    afterEach(() => {
        configs.modules = originalModules;
        configs.normalizedName = originalNormalizedName;
    });

    it('isolates separate wmf build runtime from main application runtime', () => {
        configs.normalizedName = 'test_app';
        configs.modules = {
            exposes: {
                testModule: './src/modules/test-module',
            },
            shared: {},
            options: {
                useSeparateBuild: true,
            },
        };

        const clientConfig = createClientWebpackConfig('prod') as Configuration[];
        const mainConfig = clientConfig.find((config) => !config.name);
        const wmfConfig = clientConfig.find(
            (config) => config.name === MODULES_SEPARATE_BUILD_NAME,
        );

        expect(wmfConfig?.output).toMatchObject({
            uniqueName: 'test_app_wmf',
            chunkLoadingGlobal: 'rspackChunktest_app_wmf',
        });
        expect(mainConfig?.output).not.toMatchObject({
            chunkLoadingGlobal: 'rspackChunktest_app_wmf',
        });
    });
});
