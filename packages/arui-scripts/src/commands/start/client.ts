import { config as clientConfig } from '../../configs/webpack.client.dev';
import { runClientDevServer } from '../util/run-client-dev-server';

runClientDevServer(clientConfig);
