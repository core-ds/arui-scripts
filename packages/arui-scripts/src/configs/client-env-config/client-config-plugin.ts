import { type Compiler } from '@rspack/core';

import { ENV_CONFIG_FILENAME } from './constants';
import { getEnvConfigContent } from './get-env-config';

export class ClientConfigPlugin {
    protected cachedContent: string | null = null;

    // eslint-disable-next-line class-methods-use-this
    apply(compiler: Compiler) {
        const pluginName = ClientConfigPlugin.name;

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            // Tapping to the assets processing pipeline on a specific stage.
            compilation.hooks.processAssets.tap(
                {
                    name: pluginName,
                    stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
                },
                () => {
                    const content = getEnvConfigContent();

                    compilation.emitAsset(
                        `../${ENV_CONFIG_FILENAME}`,
                        new compiler.webpack.sources.RawSource(content),
                    );
                },
            );
        });
    }
}
