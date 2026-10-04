import { types } from 'util';

import { type Configuration, type Stats } from '@rspack/core';
import { RspackDevServer } from '@rspack/dev-server';

import { devServerConfig } from '../../configs/dev-server';
import { printCompilerOutput } from '../start/print-compiler-output';

import { createCompiler } from './create-compiler';
import { closeCompiler, registerShutdown } from './graceful-shutdown';

export async function runClientDevServer(configuration: Configuration | Configuration[]) {
    const clientCompiler = createCompiler(configuration);
    let clientDevServer: RspackDevServer | undefined;
    const stop = async () => {
        let stopError: Error | undefined;

        try {
            await clientDevServer?.stop();
        } catch (error) {
            stopError = error instanceof Error ? error : new Error(String(error));
        }
        await closeCompiler(clientCompiler);
        if (stopError) throw stopError;
    };
    const dispose = registerShutdown(stop);

    clientCompiler.hooks.invalid.tap('client', () => console.log('Compiling client...'));
    clientCompiler.hooks.done.tap('client', (stats) =>
        printCompilerOutput('Client', stats as Stats),
    );

    const DEFAULT_PORT = devServerConfig.port;
    const HOST = '0.0.0.0';

    try {
        const { default: getPort } = await import('get-port');
        const port = await getPort({
            port: +(DEFAULT_PORT || 0),
            host: HOST,
        });

        if (!port) {
            // We have not found a port.
            throw new Error('No free port for the client dev server');
        }

        // dev-server слушает порт из конфига как есть, поэтому подменяем его найденным свободным
        clientDevServer = new RspackDevServer(
            { ...devServerConfig, port, setupExitSignals: false },
            clientCompiler,
        );

        await clientDevServer.start();

        console.log(`Client dev server running at http://${HOST}:${port}...`);
    } catch (err) {
        dispose();
        try {
            await stop();
        } catch (closeError) {
            console.error('Client cleanup failed:', closeError);
        }
        if (types.isNativeError(err)) {
            console.log(err.message);
        }

        process.exit(1);
    }
}
