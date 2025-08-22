import { supportingNode } from '../../configs/supporting-node';
import { webpackServerConfig } from '../../configs/webpack.server.dev';
import { runServerWatchCompiler } from '../util/run-server-watch-compiler';

process.env.BROWSERSLIST = supportingNode.join(',');

runServerWatchCompiler(webpackServerConfig);
