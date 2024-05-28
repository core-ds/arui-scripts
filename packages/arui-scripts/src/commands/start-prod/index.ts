import { configs } from '../../configs/app-configs';
import { getTscWatchCommand } from '../util/tsc';
import { runCompilers } from '../util/run-compilers';

process.env.BROWSERSLIST_CONFIG =
    process.env.BROWSERSLIST_CONFIG || require.resolve('../../../.browserslistrc');

const compilersCommands: Array<string | string[]> = [
    require.resolve('./client'),
];

if (!configs.clientOnly) {
    compilersCommands.push(require.resolve('./server'));
}

if (configs.tsconfig && configs.disableDevWebpackTypecheck) {
    compilersCommands.push(getTscWatchCommand(configs.tsconfig));
}

runCompilers(compilersCommands);
