import serverConfig from '../../configs/webpack.server.prod';
import { runServerWatchCompiler } from '../util/run-server-watch-compiler';

runServerWatchCompiler(serverConfig);
