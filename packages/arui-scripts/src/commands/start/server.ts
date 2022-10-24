import webpack from 'webpack'
import printCompilerOutput from './print-compiler-output';
import serverConfig from '../../configs/webpack.server.dev';
import configs from '../../configs/app-configs';

const serverCompiler = webpack(serverConfig);

serverCompiler.hooks.compile.tap('server', () => console.log('Compiling server...'));
serverCompiler.hooks.invalid.tap('server', () => console.log('Compiling server...'));
serverCompiler.hooks.done.tap('server', (stats: any) => printCompilerOutput('Server', stats));

serverCompiler.watch({
    aggregateTimeout: 50, // Делаем это значение меньше чем у клиента, чтобы сервер пересобирался быстрее
    ignored: new RegExp(configs.watchIgnorePath.join('|')),
}, () => {});
