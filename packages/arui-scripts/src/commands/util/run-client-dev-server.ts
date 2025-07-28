import { types } from 'util';

import { choosePort } from 'react-dev-utils/WebpackDevServerUtils';
import { Configuration, rspack, Stats } from '@rspack/core';
import { RspackDevServer } from '@rspack/dev-server';

import { devServerConfig } from '../../configs/dev-server';
import { printCompilerOutput } from '../start/print-compiler-output';

export async function runClientDevServer(configuration: Configuration | Configuration[]) {
    const clientCompiler = rspack(configuration);
    const clientDevServer = new RspackDevServer(devServerConfig, clientCompiler);

    clientCompiler.hooks.invalid.tap('client', () => console.log('Compiling client...'));
    clientCompiler.hooks.done.tap('client', (stats) =>
        printCompilerOutput('Client', stats as Stats),
    );

    const DEFAULT_PORT = devServerConfig.port;
    const HOST = '0.0.0.0';

    try {
        const port = await choosePort(HOST, +(DEFAULT_PORT || 0));

        if (!port) {
            // We have not found a port.
            return;
        }

        clientDevServer.startCallback(() => {
            console.log(`Client dev server running at http://${HOST}:${port}...`);
        });
    } catch (err) {
        if (types.isNativeError(err)) {
            console.log(err.message);
        }

        process.exit(1);
    }
}
