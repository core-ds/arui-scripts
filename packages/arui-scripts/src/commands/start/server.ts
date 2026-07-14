import { webpackServerConfig } from '../../configs/rspack.server.dev';
import { supportingNode } from '../../configs/supporting-node';
import { runServerWatchCompiler } from '../util/run-server-watch-compiler';

process.env.BROWSERSLIST = supportingNode.join(',');

runServerWatchCompiler(webpackServerConfig);
