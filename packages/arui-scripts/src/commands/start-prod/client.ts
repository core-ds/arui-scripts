import { webpackClientConfig } from '../../configs/rspack.client.prod';
import { loadBrowserslist } from '../util/load-browserslist';
import { runClientDevServer } from '../util/run-client-dev-server';

loadBrowserslist();

runClientDevServer(webpackClientConfig);
