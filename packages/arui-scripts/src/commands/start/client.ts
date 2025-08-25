import { config as clientConfig } from '../../configs/webpack.client.dev';
import { loadBrowserslist } from '../util/load-browserslist';
import { runClientDevServer } from '../util/run-client-dev-server';

loadBrowserslist();

runClientDevServer(clientConfig);
