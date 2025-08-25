import { supportingNode } from '../../configs/supporting-node';
import { webpackServerConfig as serverConfig } from '../../configs/webpack.server.prod';
import { runServerWatchCompiler } from '../util/run-server-watch-compiler';

process.env.BROWSERSLIST = supportingNode.join(',');

runServerWatchCompiler(serverConfig);
