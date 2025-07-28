import { webpackClientConfig } from '../../configs/webpack.client.prod';
import { runClientDevServer } from '../util/run-client-dev-server';

runClientDevServer(webpackClientConfig);
