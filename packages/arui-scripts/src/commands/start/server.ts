import { webpackServerConfig } from '../../configs/webpack.server.dev';
import { runServerWatchCompiler } from '../util/run-server-watch-compiler';

runServerWatchCompiler(webpackServerConfig);
