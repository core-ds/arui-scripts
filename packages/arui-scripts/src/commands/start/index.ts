import { runCompilers } from '../util/run-compilers';
import { getTsWatchCommand } from '../util/typescript';
import configs from '../../configs/app-configs';

process.env.BROWSERSLIST_CONFIG = process.env.BROWSERSLIST_CONFIG || require.resolve('../../../.browserslistrc');

runCompilers([
    require.resolve('./client'),
    require.resolve('./server'),
    (configs.tsconfig && configs.disableDevWebpackTypecheck)
        ? getTsWatchCommand()
        : null,
]);
