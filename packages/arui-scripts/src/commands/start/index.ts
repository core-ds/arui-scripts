import configs from '../../configs/app-configs';
import { runCompilers } from '../util/run-compilers';

process.env.BROWSERSLIST_CONFIG =
    process.env.BROWSERSLIST_CONFIG || require.resolve('../../../.browserslistrc');

if (configs.tsconfig && configs.disableDevWebpackTypecheck) {
    const TSC_WATCH_COMMAND = [
        require.resolve('typescript/lib/tsc.js'),
        '--watch',
        '--noEmit',
        '--project',
        configs.tsconfig,
        '--skipLibCheck',
    ];

    runCompilers([require.resolve('./client'), require.resolve('./server'), TSC_WATCH_COMMAND]);
} else {
    runCompilers([require.resolve('./client'), require.resolve('./server')]);
}
