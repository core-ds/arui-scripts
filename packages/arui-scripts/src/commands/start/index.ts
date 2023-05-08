import { runCompilers } from '../util/run-compilers';

process.env.BROWSERSLIST_CONFIG = process.env.BROWSERSLIST_CONFIG || require.resolve('../../../.browserslistrc');

runCompilers([
    require.resolve('./client'),
    require.resolve('./server'),
]);
