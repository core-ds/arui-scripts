import { runCompilers } from '../util/run-compilers';

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.BROWSERSLIST_CONFIG = process.env.BROWSERSLIST_CONFIG || require.resolve('../../../.browserslistrc');

runCompilers([
    require.resolve('./client'),
    require.resolve('./server'),
]);
