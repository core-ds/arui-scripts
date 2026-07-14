import { webpackServerConfig as serverConfig } from '../../configs/rspack.server.prod';
import { supportingNode } from '../../configs/supporting-node';
import { runServerWatchCompiler } from '../util/run-server-watch-compiler';

process.env.BROWSERSLIST = supportingNode.join(',');

runServerWatchCompiler(serverConfig);
