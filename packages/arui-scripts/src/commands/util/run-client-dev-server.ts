import webpack, { Configuration } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import devServerConfig from '../../configs/dev-server';
import printCompilerOutput from '../start/print-compiler-output';
import { choosePort } from 'react-dev-utils/WebpackDevServerUtils';

export async function runClientDevServer(configuration: Configuration) {
    const clientCompiler = webpack(configuration);
    // не резолвиться constructor(config: WebpackDevServer.Configuration, webpack?: webpack.Compiler | webpack.MultiCompiler);
    // clientCompiler: webpack.Compiler
    // @ts-ignore
    const clientDevServer = new WebpackDevServer(devServerConfig, clientCompiler);

    clientCompiler.hooks.invalid.tap('client', () => console.log('Compiling client...'));
    clientCompiler.hooks.done.tap('client', (stats: any) => printCompilerOutput('Client', stats));

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
    } catch (err: any) {
        if (err && err.message) {
            console.log(err.message);
        }

        process.exit(1);
    }
}
