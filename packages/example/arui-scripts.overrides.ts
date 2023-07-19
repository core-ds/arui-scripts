import { OverrideFile } from "arui-scripts";

const overrides: OverrideFile = {
    webpackClient: (config, appConfig, { createSingleClientWebpackConfig }) => {
        const workerConfig = createSingleClientWebpackConfig(
            { worker: './src/worker.ts' },
            'worker',
        );
        workerConfig.output.filename = 'worker.js';

        return [
            config,
            workerConfig,
        ];
    },
};

export default overrides;
